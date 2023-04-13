import React, { useState, useEffect } from 'react';
import SocketContext from './SocketContext';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import LoginPopupForm from './authentication/PopupAuthenticationPrompt'
import { ProfileSetup } from './authentication/register/register';
import { Settings } from './settings/settings';
import { Directory } from './directory/directory';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { NotFound } from './errors/404/404';
import { AuthState } from './authentication/login/AuthState';
import { SurveyCollection } from './surveys/SurveyCollection';
import { Socket } from './addons_React/socketCommunicator';
//import './addons_React/pushNotifications';
import InactivityDetector from './addons_React/InactivityDetector';
import ConnectionStatus from './addons_React/ConnectionStatus';
import { auth } from './authentication/login/Firebase_Assets/firebaseConfig';
import './App.css';
import { initializePushNotifications } from './addons_React/PushNotificationServiceWorker'
import { Popup } from './addons_React/Popups/popup';
function App() {



  const [AuthRequested, requestAuthPage] = useState(false);
  const [userStatus, setUserStatus] = useState(localStorage.getItem('last_displayed_status') || 'Online');
  const [socket, setSocket] = useState(null);
  const [EmailAddress, setEmail] = useState(localStorage.getItem('email') || '');
  const [userAlias, setUserAlias] = React.useState(localStorage.getItem('Alias') || '');
  const [userID, setID] = useState(localStorage.getItem('userID'));
  const [FirstNameDesktop, setUserName] = React.useState(localStorage.getItem('FirstName') || 'Visitor');
  const [profile_image_url, setProfileURL] = useState(localStorage.getItem('profile_image_url') || 'https://cdn-icons-png.flaticon.com/512/456/456212.png');
  const location = useLocation();
  const logout = async () => {
    await signOutOfFirebase();
    fetch(`/api/auth/logout`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      method: 'delete'
    }).then(() => {

      // auth.settings.appVerificationDisabledForTesting;
      window.location.reload()
      localStorage.clear()
    }
    );
  }
  async function signOutOfFirebase() {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Sign out of Firebase
        await auth.signOut();

        // Sign out of the Google session
        if (currentUser.providerData && currentUser.providerData.length > 0) {
          const providerId = currentUser.providerData[0].providerId;
          //If we are signed in to google sign us out of google completely.
          if (providerId === 'google.com') {
            const auth2 = window.gapi.auth2.getAuthInstance();

            if (auth2) {
              await auth2.disconnect();
            } else {
              // Initialize the Google Sign-In API if it's not loaded
              await new Promise((resolve) => {
                window.gapi.load('auth2', async () => {
                  await window.gapi.auth2.init();
                  const authInstance = window.gapi.auth2.getAuthInstance();
                  await authInstance.disconnect();
                  resolve();
                });
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  //hardcoded edit current user status icon:
  const handleInactivity = () => {
    console.log('Window has been inactive for more than 2 minutes.');
    setUserStatus('Away');
  };
  const handleActivityResumed = () => {
    console.log('Window activity resumed after being inactive for more than 5 minutes.');
    setUserStatus(localStorage.getItem('last_displayed_status'));
  };
  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setUserStatus(newStatus);
    localStorage.setItem('last_displayed_status', newStatus);
    socket.sendStatus(userID, newStatus);
  };
  //TODO: Authentication verification:
  // Asynchronously determine if the user is authenticated by calling the service
  const [authState, setAuthState] = React.useState(AuthState.Unknown); // This will be replaced by Firebase
  const [profilePresent, setProfilePresence] = useState(true);

  React.useEffect(() => {
    if (EmailAddress && authState) {
      fetch(`/api/user/${EmailAddress}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
          else if (response.status === 422) {
            //Go to register/complete profile
            setProfileURL('https://cdn-icons-png.flaticon.com/512/456/456212.png');
            loadProfileImage();
            setProfilePresence(false);

          }
        })
        .then((response) => {
          if (!response) {
            return;
          }
          console.log(response);
          const state = response?.authenticated ? AuthState.Authenticated : AuthState.Unauthenticated;
          setUserName(response?.first_name);
          setProfileURL(response?.profile_image_url);
          setAuthState(state);
          setID(response?.id);
          localStorage.setItem('id', response.id);
          //Socket Connections will go here for only authenticated users.
          if (!socket) {
            Socket.connect();
            setSocket(Socket);
          }
          setProfilePresence(true);
        });
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [EmailAddress, auth]);

  useEffect(() => {
    auth.onAuthStateChanged((userCred) => {
      if (userCred) {
        //console.log(userCred);
        setAuthState(AuthState.Authenticated);
        userCred.getIdToken().then((token) => {
          localStorage.setItem('token', token);
        })
        localStorage.setItem('id', userCred.uid);
        //Trigger the other useEffect to get remaining data
        setEmail(userCred.email);
        requestAuthPage(false);


      }
    })
  }, [auth])

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          console.log(`Notification permission: ${permission}`);

        });
      }
      if (Notification.permission === 'granted' && authState === AuthState.Authenticated) {
        initializePushNotifications();
      }
    }
  }, [authState]);

  React.useEffect(() => {
    if (authState === AuthState.Authenticated) {
      if (socket && userID && userStatus) {
        const sendStatus = () => {
          if (Socket.socket.readyState === WebSocket.OPEN) {
            Socket.sendStatus(userID, userStatus);
          }
        };

        sendStatus(); // Send status immediately
        const intervalId = setInterval(sendStatus, 60000); // Send status every 2 seconds
        return () => {
          clearInterval(intervalId);
        };
      }
    }

  }, [Socket, userID, userStatus]);

  async function loadProfileImage() {
    if (authState === AuthState.Authenticated) {
      var userProfileImage = localStorage.getItem('profile_image_url');
      const imageHolder = document.querySelectorAll('.profileImage');
      imageHolder.src = "data:image/png;base64," + userProfileImage;
    }
    else {
      const imageHolder = document.querySelectorAll('.profileImage');
      imageHolder.src = "data:image/png;base64, https://cdn-icons-png.flaticon.com/512/456/456212.png";
    }
  }


  const Login = () => {
    //AuthenticationLoginHolder.innerHTML = <LoginPopupForm targetURL="/home"/> ;
    requestAuthPage(true);
  }
  const closePopup = () => {
    requestAuthPage(false);
  }

  return (
    <div className="App">
      <InactivityDetector onInactivity={handleInactivity} onActivityResumed={handleActivityResumed} />
      <header className="App-header">
        <nav>
          <div className="user-account-menu">
            <img src={profile_image_url} alt="Profile Picture" className="profile-picture" id='profileImage' />

            {authState === AuthState.Authenticated && profilePresent && (<NavLink to={`/users/${userID}/profile`}>Welcome, {FirstNameDesktop}</NavLink>)}
            {authState === AuthState.Authenticated && profilePresent && (
              <NavLink className='nav-link' to="settings">Settings</NavLink>)}
            {authState === AuthState.Authenticated && profilePresent && (
              <select class="custom-select" id="status-dropdown" onChange={handleStatusChange} name="status" value={userStatus}>
                <option value="Online" className="status-item online">Online</option>
                <option value="Away" className="status-item away">Away</option>
                <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                <option value="Appear Offline" className="status-item offline">Appear Offline</option>
              </select>)}

          </div>

          {authState === AuthState.Authenticated && profilePresent && (
            <NavLink className='nav-link' id="desktopNav" to="home">My Groups</NavLink>)}

          {authState === AuthState.Authenticated && (
            <NavLink onClick={logout} id="desktopNav">Logout</NavLink>)}
          {authState !== AuthState.Authenticated && (<NavLink id="desktopNav" onClick={Login}>Login</NavLink>)}
          {authState !== AuthState.Authenticated && (<NavLink id="desktopNav" to='register'>Register</NavLink>)}
          <div className="dropdown">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Hamburger_icon_white.svg/1024px-Hamburger_icon_white.svg.png" width="20px" alt="Menu_icon" />
            <NavLink to="#"><b>Menu</b></NavLink>
            <div className="dropdown-content">
              <div className="user-account">
                <img src={profile_image_url} alt="Profile Picture" className="profile-picture" id='profileImage' />
                <div className="user-info">
                  {authState === AuthState.Authenticated && profilePresent && (<NavLink to="/users/UserUUID/profile">Welcome, {FirstNameDesktop}</NavLink>)}
                  {authState === AuthState.Authenticated && profilePresent && (
                    <NavLink className='nav-link' to="settings">Settings</NavLink>)}
                  {authState === AuthState.Authenticated && profilePresent && (
                    <select id="status-dropdown" onChange={handleStatusChange} name="status" value={userStatus}>
                      <option value="Online" className="status-item online">Online</option>
                      <option value="Away" className="status-item away">Away</option>
                      <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                      <option value="Appear Offline" className="status-item offline">Appear Offline</option>
                    </select>
                  )}
                </div>
              </div>
              {authState === AuthState.Authenticated && profilePresent && (
                <NavLink className='nav-link' to="home">My Groups</NavLink>)}
              {authState === AuthState.Authenticated && (
                <NavLink onClick={logout} >Logout</NavLink>)}
              {authState !== AuthState.Authenticated && (<NavLink onClick={Login}>Login</NavLink>)}
              {authState !== AuthState.Authenticated && (<NavLink id="desktopNav" to='register'>Register</NavLink>)}

            </div>
          </div>
          {loadProfileImage}
        </nav>
      </header>
      <main>
        <div id='AuthenticationLoginHolder'>{AuthRequested && <LoginPopupForm targetURL={location.pathname} closePopup={closePopup} />}</div>
        {!profilePresent && authState === AuthState.Authenticated && (<Popup targetURL={location.pathname} component={<ProfileSetup Authenticated={authState} email={EmailAddress} logout={logout} />} />)}
        <Routes>
          <Route
            path='/'
            element={
              <Home Authenticated={authState} />
            }
            exact
          />
          <Route path='/settings' element={<Settings Authenticated={authState} />} />
          <Route
            path="/:id/directory"
            element={<Directory Authenticated={authState} socket={Socket} />}
          />
          <Route path='/home' element={<Home Authenticated={authState} />} />
          <Route path='/register' element={<ProfileSetup Authenticated={authState} />} />
          {/* <Route path='/users/:uuid/profile' element={<Profile Authenticated={authState} />} /> */}
          <Route path='/:groupID/surveys/:surveyID' element={<SurveyCollection Authenticated={authState} />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </main>
      <Footer />

    </div>

  );
}
function Footer() {
  return (
    <footer>
      <table className='FooterTable'>
        <tr className='FooterRow'>
          <td className='left'>Elias Sanabria
          <button type="button" className="btn btn-link" onClick={() => window.location.href = 'https://github.com/eliassanabria/Orginzation-Tools'}>Source</button>

          </td>
          <td className='center'>
          <button type="button" className="btn btn-link" onClick={() => window.location.href = 'https://pysa169.eliassanabria.com'}>Provo YSA 169 Ward Login</button>
          </td>
          <td className='right'>
          <ConnectionStatus />
          </td>
        </tr>
      </table>
    </footer>
  );
}






export default App;
