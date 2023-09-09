import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SocketContext from './SocketContext';
import { NavLink, Route, Routes } from 'react-router-dom';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import LoginPopupForm from './authentication/PopupAuthenticationPrompt'
import { ProfileSetup } from './authentication/register/register';
import { Settings } from './settings/settings';
import { Directory } from './directory/directory';
import { Home } from './home/home';
import { Profile } from './profile/profile';
import { JoinDeepLink } from './Organizations/JoinGroupDeepLink'
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
import CustomToast from './addons_React/Popups/ToastPopup';
import GroupSettings from './Organizations/GroupSettings';
import "./SideDrawer.js"
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './custom.scss'; // Import the custom SCSS file
import { NotificationCenterPopup } from './home/Notification_Center/NotificationsViewer';
import GroupDashboard from "./Organizations/Dashboard/GroupDashboard"
import { ToastContainer } from 'react-bootstrap';
import { AlignCenter } from 'react-bootstrap-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faEnvelope, faBuilding , faClipboardList, faBellSlash } from '@fortawesome/free-solid-svg-icons';
import TermsOfService from './Legal/TermsOfService';
import TermsModal from './Legal/TOSModal';
import { NotificationCenter } from './AppScreens/Notifications/NotificationCenter';
import ChatPage from './AppScreens/DirectMessages/DirectMessages';
import RoleLists from './Organizations/SettingsTabs/Roles/RoleListComponents/MemberLists';
import PricingPages from './AppScreens/Pricing Options/PricingPages';
import SubGroupManagementScreen from './Organizations/SettingsTabs/Subgroups/SubGroupManagement';
import SubgroupDetails from './Organizations/SettingsTabs/Subgroups/SubgroupDetails/SubgroupDetailsView';

function App() {
  //Check for Mobile for prompt:
  const [isMobile, setIsMobile] = useState(false);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  useEffect(() => {
    // Check if the user is using a mobile device
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileDevice = /mobile/.test(userAgent);

    setIsMobile(isMobileDevice);

    // Check if the PWA is already installed
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      setIsPWAInstalled(true);
    });
  }, []);

  const handleInstallPWA = () => {
    const promptEvent = new Event('beforeinstallprompt');
    window.dispatchEvent(promptEvent);
  };
  const [messages, setMessages] = useState([]);


  useEffect(() => {
    Socket.addHandler(handleAnnouncement);
    return () => {
      Socket.removeHandler(handleAnnouncement);
    }
  }, [Socket]);
  const handleCloseToast = (id) => {
    setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));
  };
  const addToast = (title, groupName, body) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: new Date().getTime(), groupName, title, body },
    ]);
  };


  function handleAnnouncement(event) {
    //console.log(event.type);
    if (event.type === 'AnnouncementNotification') {
      addToast(event.title, event.groupName, event.body);
    }
    if (event.type === 'StatusChange') {
      //console.log(event.status);
      const status = event.status;
      if (event.userID === window.localStorage.getItem('id')) {
        //we are current user or self, update other online clients.
        if (status === 'overlayUserStatusOnline') {

          localStorage.setItem('last_displayed_status', 'Online'); setUserStatus('Online');
        }
        if (status === 'overlayUserStatusAway') {

          localStorage.setItem('last_displayed_status', 'Away'); setUserStatus('Away');
        }
        if (status === 'overlayUserStatusDND') {

          localStorage.setItem('last_displayed_status', 'Do Not Disturb'); setUserStatus('Do Not Disturb');
        }
        if (status === 'overlayUserStatusOffline') {

          localStorage.setItem('last_displayed_status', 'Appear Offline'); setUserStatus('Appear Offline');
        }
      }
    }
    //alert(event.title);
  }
  const [notificationEnabled, setNotificationBellStatus] = useState(null);
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
    fetch(`/api/notifications/push/token/delete`, {
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
    if (userStatus === 'Online') {
      setUserStatus('Away');
      Socket.sendStatus(localStorage.getItem('id'), 'Away')
    }

  };
  const handleActivityResumed = () => {
    console.log('Window activity resumed after being inactive for more than 5 minutes.');
    setUserStatus(localStorage.getItem('last_displayed_status'));
  };
  const handleStatusChange = (event) => {
    console.log('Status Change Recieved:')
    const newStatus = event.target.value;
    console.log('Status is now:', newStatus)
    setUserStatus(newStatus);
    localStorage.setItem('last_displayed_status', newStatus);
    Socket.sendStatus(userID, newStatus);
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
          localStorage.setItem('profile_image_url', response.profile_image_url);
          setAuthState(state);
          setID(response?.id);
          localStorage.setItem('id', response.id);
          // //Socket Connections will go here for only authenticated users.
          // if (!socket) {
          //   Socket.connect();
          //   setSocket(Socket);
          // }
          setProfilePresence(true);
        });
    } else {
      setAuthState(AuthState.Unauthenticated);
    }
  }, [EmailAddress, auth]);

  useEffect(() => {
    auth.onAuthStateChanged(async (userCred) => {
      if (userCred) {
        setAuthState(AuthState.Authenticated);
        const token = await userCred.getIdToken();
        localStorage.setItem('token', token);
        localStorage.setItem('id', userCred.uid);
        setEmail(userCred.email);
        requestAuthPage(false);

        // Set the token in the Axios authorization header
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      }
    });

    // Setup Axios Interceptor
    axios.interceptors.response.use(undefined, async error => {
      if (error.config && error.response && error.response.status === 401 && !error.config.__isRetryRequest) {
        // Token expired, try to refresh it
        const newToken = await refreshToken();
        
        // Update the token in the request and retry it
        error.config.headers['Authorization'] = 'Bearer ' + newToken;
        
        // Add this line to set the __isRetryRequest flag to true
        error.config.__isRetryRequest = true;
    
        return axios(error.config);
      }
      return Promise.reject(error);
    });

  }, [auth]);

  const refreshToken = async () => {
    const userCred = auth.currentUser;
    if (userCred) {
      const token = await userCred.getIdToken(true);
      localStorage.setItem('token', token);
      return token;
    }
    // If no user is signed in, throw an error

    throw new Error("No user is currently signed in.");
  };

  useEffect(() => {
    if ('Notification' in window) {
      // if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      //   //Set the notification bell as slashed
      //   Notification.requestPermission().then(permission => {
      //     console.log(`Notification permission: ${permission}`);
      //   });
      // }
      if (Notification.permission === 'denied') {
        setNotificationBellStatus(false);
      }
      if (Notification.permission === 'granted' && authState === AuthState.Authenticated) {
        //set bell as full functional
        setNotificationBellStatus(true);
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
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawerOpen = () => {
    setDrawerOpen(true);
  };
  const toggleDrawerClose = () => {
    setDrawerOpen(false);
  };


  const Login = () => {
    requestAuthPage(true);
    setDrawerOpen(false);
  }
  const closePopup = () => {
    requestAuthPage(false);
  }
  const promptNotificationPermission = () => {

    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log(`Notification permission: ${permission}`);
        if (Notification.permission === 'granted') {
          setNotificationBellStatus(true);
        }
        else {
          setNotificationBellStatus(false);

        }
      });
    }
    else {
      if (isIOS) {
        Notification.requestPermission().then(permission => {
          console.log(`Notification permission: ${permission}`);
          if (Notification.permission === 'granted') {
            setNotificationBellStatus(true);
          }
          else {
            setNotificationBellStatus(false);
          }
        });
      }
      if (!notificationEnabled) {
        alert(`It seems you have notifications block, please change your settings in the browser to allow notifications.`);
      }

    }

  }
  function isIOS() {
    return !!navigator.userAgent.match(/(iPod|iPhone|iPad)/);
  }
  return (
    <div className="App">

      <InactivityDetector onInactivity={handleInactivity} onActivityResumed={handleActivityResumed} />
      <header className="App-header" style={{ position: 'sticky' }}>
        <nav>
          <div className="user-account-menu" style={{ padding: `5px` }} >
            {authState === AuthState.Authenticated && (<img src={profile_image_url} alt="Profile Picture" className="profile-picture" id='profileImage' />)}

            {authState === AuthState.Authenticated && profilePresent && (<NavLink to={`/users/${userID}/profile`}>Welcome, {FirstNameDesktop}</NavLink>)}
            {authState === AuthState.Authenticated && profilePresent && (
              <NavLink className='nav-link' to="/settings">
                <i className="fas fa-cog fa-lg" style={{ color: '#ffffff', marginRight: '25px', marginLeft: '50px' }}></i>
              </NavLink>)}
            {authState === AuthState.Authenticated && profilePresent && (
              <select className="custom-select" id="status-dropdown" onChange={handleStatusChange} name="status" value={userStatus} style={{ width: `auto`, marginRight:'15px'}}>
                <option value="Online" className="status-item online">Online</option>
                <option value="Away" className="status-item away">Away</option>
                <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                <option value="Appear Offline" className="status-item offline">Appear Offline</option>
              </select>)}
            {authState === AuthState.Authenticated && !notificationEnabled && (<div>
              <i className="fas fa-bell-slash fa-lg" id="desktopNav" style={{ color: 'white', marginLeft: '30px' }} onClick={promptNotificationPermission}></i>
            </div>)}
            {authState === AuthState.Authenticated && notificationEnabled && (<div>
              <NotificationCenterPopup authenticated={authState} />
            </div>)}
          </div>
          <img src='/company_logo.jpg' alt='Company Logo' id="desktopNav" style={{ height: '60px', width: '60px', borderRadius: '20%', marginRight: '20px' }} />

          {authState === AuthState.Authenticated && profilePresent && (
            <NavLink className='nav-link' id="desktopNav" to="groups">My Groups</NavLink>)}

          {authState === AuthState.Authenticated && (
            <NavLink onClick={logout} id="desktopNav">Logout</NavLink>)}
          {authState !== AuthState.Authenticated && (<NavLink id="desktopNav" onClick={Login}>Login / Register</NavLink>)}

          <div className="dropdown">
            <nav className="navbar navbar-dark app-Theme-bg">
              <button className="navbar-toggler" type="button" style={{marginLeft:'10px'}}>
                
                <span
                  className="navbar-toggler-icon"
                  
                  onMouseOver={toggleDrawerOpen}
                  onTouchEnd={toggleDrawerClose}
                ></span>
              </button>
              <h2>Org Tools</h2>
            </nav>

            <div
              className={`app-theme-light-bg navbar-custom nav-drawer ${drawerOpen ? 'open' : 'closed'}`}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                bottom: 0,
                width: '65%',
                overflowY: 'scroll',
                zIndex: 1054,
                paddingTop: '30px',
                paddingLeft: '0.5rem',
                height: '100%',
                display: 'block'
              }}
            >
              <Nav className="flex-column" onMouseEnter={toggleDrawerOpen} style={{
                position: 'relative',
                zIndex: 1054,
                display: 'block'
              }}>

                <div style={{ display: 'flex' }}>
                  <div style={{ fontSize: 'x-large' }}>
                  
                  <b style={{display:'flex'}}><img src='/company_logo.jpg' alt='Company Logo' style={{ height: '70px', width: '90px', borderRadius:'15%', marginRight: '5px' }} />Org Tools</b>
                  </div>
                  <div style={{ fontSize: 'large', paddingLeft: '3rem' }}>
                    {authState === AuthState.Authenticated && (
                      <NavLink onClick={logout} ><i className="fas fa-sign-out-alt" style={{ fontSize: '22px' }}></i>
                      </NavLink>)}
                  </div>

                </div>
                <div className="user-account">

                  <img src={profile_image_url} alt="Profile Picture" className="profile-picture-mobile" id='profileImage' />

                </div>
                <div className="user-info">
                  <div style={{ display: 'flex' }}>
                    <div>
                      {authState === AuthState.Authenticated && profilePresent && (<h3><b>Hi, {FirstNameDesktop}</b></h3>)}
                    </div>
                    <div>

                    </div>
                    <div>
                      {authState === AuthState.Authenticated && profilePresent && (
                        <a href='/settings' style={{ right: '0' }}>
                          <i className="fas fa-cog fa-lg" style={{ color: '#ffffff', paddingLeft: '1rem' }}></i>
                        </a>)}
                    </div>
                  </div>
                  <br></br>
                  {authState === AuthState.Authenticated && profilePresent && (
                    <select id="status-dropdown" onChange={handleStatusChange} name="status" value={userStatus}>
                      <option value="Online" className="status-item online">Online</option>
                      <option value="Away" className="status-item away">Away</option>
                      <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                      <option value="Appear Offline" className="status-item offline">Appear Offline</option>
                    </select>
                  )}

                </div>

                {authState === AuthState.Authenticated && profilePresent && (
                  <a href='/groups' style={{ display: location.pathname === '/groups' ? 'none' : 'flex' }}><FontAwesomeIcon icon={faBuilding} style={{marginRight:'10px'}} />My Groups</a>)}

                {authState !== AuthState.Authenticated && (<NavLink onClick={Login}>Login / Register</NavLink>)}
                {authState === AuthState.Authenticated && !notificationEnabled && (<div>
                  <FontAwesomeIcon icon={faBellSlash} onClick={promptNotificationPermission}/><a href='/notifications'>Notifications</a>
                </div>)}
                {authState === AuthState.Authenticated && notificationEnabled && (<div>
                  
                  <NotificationCenterPopup authenticated={authState} mobileNavClose={toggleDrawerClose} />
                </div>)}
                {/* {authState === AuthState.Authenticated && profilePresent && (<div>
                  <br></br>
                  <a href='/chats' disabled><FontAwesomeIcon icon={faEnvelope} style={{marginRight:'10px'}} />Direct Messages</a>
                </div>)}
                {authState === AuthState.Authenticated && profilePresent && (<div>
                  <br></br>
                  <a href='/appointments' disabled><FontAwesomeIcon icon={faCalendarCheck} style={{marginRight:'10px'}} />My Appointments</a>
                </div>)}
                {authState === AuthState.Authenticated && profilePresent && (<div>
                  <br></br>
                  <a href='/tasks'><FontAwesomeIcon icon={faClipboardList} style={{marginRight:'10px'}} />My Tasks</a>
                </div>)} */}
                <div style={{ bottom: 0 }}><br></br>
                  <Button className='app-Theme-bg' onClick={toggleDrawerClose} >Close Menu</Button>
                </div>


              </Nav>
            </div>
          </div>

          {/* <div className="dropdown">
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
              {authState !== AuthState.Authenticated && (<NavLink onClick={Login}>Login / Register</NavLink>)}
            </div>
          </div> */}
          {loadProfileImage}
        </nav >

      </header >


      <main style={{ zIndex: '0', position: 'relative' }}>
        <div id='AuthenticationLoginHolder'>{AuthRequested && <LoginPopupForm targetURL={location.pathname} closePopup={closePopup} />}</div>
        {!profilePresent && authState === AuthState.Authenticated && (<Popup targetURL={location.pathname} component={<ProfileSetup Authenticated={authState} email={EmailAddress} logout={logout} />} />)}
        <ToastContainer position="top-end" style={{ zIndex: '7' }} className="p-3">

          {messages.map((message) => (
            <CustomToast
              key={message.id}
              id={message.id}
              title={message.title}
              body={message.body}
              groupName={message.groupName}
              handleClose={handleCloseToast}
            />
          ))}
        </ToastContainer>

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
            path="groups/:groupID/directory"
            element={<Directory Authenticated={authState} socket={Socket} />}
          />
          <Route path="/users/:userUUID/profile" element={<Profile Authenticated={authState} />} />
          <Route path='/groups/:groupID/settings' element={<GroupSettings Authenticated={authState} socket={Socket} />} />
          <Route path='/groups/:groupID/dashboard' element={<GroupDashboard Authenticated={authState} socket={Socket} />} />
          <Route path='/groups/:groupID/settings/roles/:roleID/lists' element={<RoleLists Authenticated={authState}/>} />
          <Route path='/groups/:groupID/settings/subgroups/:subgroupID/lists' element={<RoleLists Authenticated={authState}/>} />
          <Route path='/groups/:groupID/settings/subgroups/manage' element={<SubGroupManagementScreen Authenticated={authState}/>} />
          <Route path='/groups/:groupID/subgroups/:subgroupID/view' element={<SubgroupDetails Authenticated={authState}/>} />
          <Route path='/groups' element={<Home Authenticated={authState} />} />
          <Route path='/register' element={<ProfileSetup Authenticated={authState} />} />
          <Route path='groups/:groupID/surveys/:surveyID' element={<SurveyCollection Authenticated={authState} />} />
          <Route path='/organizations/requests/join/:joincode' element={<JoinDeepLink Authenticated={authState} />} />
          <Route path='/terms-of-service' element={<TermsModal isOpen={true}/>}/>
          <Route path='/notifications' element={<NotificationCenter Authenticated={authState}/>}/>
          <Route path='/chats' element={<ChatPage Authenticated={authState}/>}/>
          <Route path='/pricing' element={<PricingPages Authenticated={authState}/>}/>

          <Route path='*' element={<NotFound />} />
        </Routes>
      </main>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <br></br>
      <Footer authenticated={authState} />

    </div >

  );
}
function Footer(props) {
  const authenticated = props.authenticated;
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768); // Adjust the breakpoint as needed
    };

    handleResize(); // Check initially

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <footer>
      <table className='FooterTable'>
        <tbody>
          <tr className='FooterRow'>
            <td className='left'>
             <small>Org Tools & Solutions Inc. 2023© All Rights Reserved</small>
            </td>
            
            
            <td className='right'>
              {authenticated === AuthState.Authenticated && (<ConnectionStatus WebSocket={Socket} />)}
            </td>
          </tr>
        </tbody>

      </table>
    </footer>
  );
}

export default App;
