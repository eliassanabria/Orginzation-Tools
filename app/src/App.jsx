import React, { useState, useEffect } from 'react';
import SocketContext from './SocketContext';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginPopupForm from './authentication/PopupAuthenticationPrompt'
import { Register } from './authentication/register/register';
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
import './loaderContainer.css';
import './App.css';
import {initializePushNotifications} from './addons_React/PushNotificationServiceWorker'

function App() {
  
  
  
  const [AuthRequested, requestAuthPage] = useState(false);
  const [userStatus, setUserStatus] = useState(localStorage.getItem('last_displayed_status') || 'Online');
  const [socket, setSocket] = useState(null);
  const [EmailAddress, setEmail] = useState(localStorage.getItem('email') || '');
  const [userAlias, setUserAlias] = React.useState(localStorage.getItem('Alias') || '');
  const [userID, setID] = useState(localStorage.getItem('userID'));
  const [FirstNameDesktop, setUserName] = React.useState(localStorage.getItem('FirstName') || 'Visitor');
  const [profile_image_url, setProfileURL] = useState(localStorage.getItem('profile_image_url') || 'https://cdn-icons-png.flaticon.com/512/456/456212.png');
  function logout() {
    fetch(`/api/auth/logout`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      method: 'delete'
    }).then(() => window.location.reload()
    ).then(() => localStorage.clear()
    );
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
  const [authState, setAuthState] = React.useState(AuthState.Unknown);
  React.useEffect(() => {
    if (EmailAddress) {
      fetch(`/api/user/${EmailAddress}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then((response) => {
          if (response.status === 200) {
            return response.json();
          }
        })
        .then((response) => {
          const state = response?.authenticated ? AuthState.Authenticated : AuthState.Unauthenticated;
          setUserName(response?.first_name);
          setUserAlias(response?.alias);
          setProfileURL(response?.profile_image_url);
          setAuthState(state);
          setID(response?.id);
          localStorage.setItem('id', response.id);
          //Socket Connections will go here for only authenticated users.
          if (!socket) {
            Socket.connect();
            setSocket(Socket);
          }
        });
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [EmailAddress]);

  useEffect(()=>{
    if ('Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          console.log(`Notification permission: ${permission}`);

        });
      }
      if(Notification.permission ==='granted' && authState === AuthState.Authenticated){
        initializePushNotifications();
      }
    }
  },[authState]);

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
    var userProfileImage = localStorage.getItem('profile_image_url');
    const imageHolder = document.querySelectorAll('.profileImage');
    imageHolder.src = "data:image/png;base64," + userProfileImage;
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
            <div className="user-info">
              {authState === AuthState.Authenticated && (<NavLink to={`/users/${userID}/profile`}>Welcome, <label id='FirstNameDesktop'>{FirstNameDesktop}</label></NavLink>)}
              {authState === AuthState.Authenticated && (
                <NavLink className='nav-link' to="settings">Settings</NavLink>)}
              {authState === AuthState.Authenticated && (
                <select id="status-dropdown" onChange={handleStatusChange} name="status" value={userStatus}>
                  <option value="Online" className="status-item online">Online</option>
                  <option value="Away" className="status-item away">Away</option>
                  <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                  <option value="Appear Offline" className="status-item offline">Appear Offline</option>
                </select>)}
            </div>
          </div>
          {authState === AuthState.Authenticated && (
            <NavLink className='nav-link' id='desktopNav' to="6410b886773710f67ea6835b/directory">Directory</NavLink>)}
          {authState === AuthState.Authenticated && (
            <NavLink className='nav-link' id="desktopNav" to="home">My Groups</NavLink>)}
          {authState === AuthState.Authenticated && (
            <NavLink onClick={logout} id="desktopNav">Logout</NavLink>)}
          {authState !== AuthState.Authenticated && (<NavLink id="desktopNav" onClick={Login}>Login</NavLink>)}

          <div className="dropdown">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Hamburger_icon_white.svg/1024px-Hamburger_icon_white.svg.png" width="20px" alt="Menu_icon" />
            <NavLink to="#"><b>Menu</b></NavLink>
            <div className="dropdown-content">
              <div className="user-account">
                <img src={profile_image_url} alt="Profile Picture" className="profile-picture" id='profileImage' />
                <div className="user-info">
                  <NavLink to="/users/UserUUID/profile">Welcome, <lable id="FirstNameDesktop">{FirstNameDesktop}</lable></NavLink>
                  {authState === AuthState.Authenticated && (
                    <NavLink className='nav-link' to="settings">Settings</NavLink>)}
                  {authState === AuthState.Authenticated && (
                    <select id="status-dropdown" onChange={handleStatusChange} name="status" value={userStatus}>
                      <option value="Online" className="status-item online">Online</option>
                      <option value="Away" className="status-item away">Away</option>
                      <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                      <option value="Appear Offline" className="status-item offline">Appear Offline</option>
                    </select>
                  )}
                </div>
              </div>
              {authState === AuthState.Authenticated && (
                <NavLink className='nav-link' to="6410b886773710f67ea6835b/directory">Directory</NavLink>)}
              {authState === AuthState.Authenticated && (
                <NavLink className='nav-link' to="home">My Groups</NavLink>)}
              {authState === AuthState.Authenticated && (
                <NavLink onClick={logout} >Logout</NavLink>)}
              {authState !== AuthState.Authenticated && (<NavLink onClick={Login}>Login</NavLink>)}

            </div>
          </div>
          {loadProfileImage}
        </nav>
      </header>
      <main>
        <div id='AuthenticationLoginHolder'>{AuthRequested && <LoginPopupForm targetURL="/home" closePopup={closePopup} />}</div>

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
          <Route path='/register' element={<Register Authenticated={authState}/>} />
          <Route path='/users/:uuid/profile' element={<Profile Authenticated={authState} />} />
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
      <div className="footCenter">
        <h6>This application is not spported nor endorsed by the Church of Jesus Christ of Latter-day Saints</h6>
      </div>
      <div className="footCenter">
        <button className="button" onClick={() => window.location.href = 'https://pysa169.eliassanabria.com'}>Provo YSA 169 Ward Login</button>
      </div>
      <div className="footCenter">
        <h6>This webiste is under construction</h6>
      </div>
      <div id='FCMTOK'>

      </div>
      <div><ConnectionStatus /></div>
    </footer>
  );
}






export default App;
