import React, { useState } from 'react';

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


import './loaderContainer.css'
import './App.css';

function App() {
  const [AuthRequested,requestAuthPage] = useState(false);
  const [EmailAddress, setEmail] = useState(localStorage.getItem('email') || '');
  const [userAlias, setUserAlias] = React.useState(localStorage.getItem('Alias') || '');
  const [userID, setID] = useState(localStorage.getItem('userID'));
  const [FirstNameDesktop, setUserName] = React.useState(localStorage.getItem('FirstName') || 'Visitor');
  const [profile_image_url, setProfileURL] = useState(localStorage.getItem('profile_image_url') || 'https://cdn-icons-png.flaticon.com/512/456/456212.png');
  function logout() {
    fetch(`/api/auth/logout`, {
      headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
      method: 'delete'
    }).then(()=> window.location.reload()
    ).then(()=> localStorage.clear()
    );
  }

  //TODO: Authentication verification:
// Asynchronously determine if the user is authenticated by calling the service
const [authState, setAuthState] = React.useState(AuthState.Unknown);
React.useEffect(() => {
  if (EmailAddress) {
    fetch(`/api/user/${EmailAddress}`,{
      headers:{
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
        localStorage.setItem('id',response.id)
      });
  } else {
    setAuthState(AuthState.Unauthenticated);
  }
}, [EmailAddress]);



  
  async function loadProfileImage(){
    var userProfileImage = localStorage.getItem('profile_image_url');
    const imageHolder = document.querySelectorAll('.profileImage');
    imageHolder.src = "data:image/png;base64," + userProfileImage;
  }

  const Login = ()=>{
       requestAuthPage(true);
  }
  // const logout = ()=>{
  //   localStorage.setItem("IsSignedIn", false);
  //   window.location.reload();
  // }

  
  return (
    <div className="App">
      <header className="App-header">
          <nav>
            <div className="user-account-menu">
              <img src={profile_image_url} alt="Profile Picture" className="profile-picture" id='profileImage'/>
              <div className="user-info">
                {authState === AuthState.Authenticated && (<NavLink to="/users/UserUUID/profile">Welcome, <t id='FirstNameDesktop'>{FirstNameDesktop}</t></NavLink>)}
                {authState === AuthState.Authenticated && (
                <NavLink className='nav-link' to="settings">Settings</NavLink>)}
                {authState === AuthState.Authenticated && (
                <select id="status-dropdown" onChange="updateStatus()" name="status">
                  <option value="Online" className="status-item online">Online</option>
                  <option value="Away" className="status-item away">Away</option>
                  <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                  <option value="Appear Offline" className="status-item offline">Appear Offline</option>
                </select> )}
              </div>
            </div>
            {authState === AuthState.Authenticated && (
            <NavLink className='nav-link' id='desktopNav' to="6410b886773710f67ea6835b/directory">Directory</NavLink>)}
            {authState === AuthState.Authenticated && (
            <NavLink className='nav-link' id="desktopNav" to="home">My Groups</NavLink>)}
            {authState === AuthState.Authenticated && (
            <NavLink  onClick={logout} id="desktopNav">Logout</NavLink>)}
            {authState !== AuthState.Authenticated && (<NavLink id="desktopNav" onClick={Login}>Login</NavLink>)}

          <div className="dropdown">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Hamburger_icon_white.svg/1024px-Hamburger_icon_white.svg.png" width="20px" alt="Menu_icon" />
            <NavLink to="#"><b>Menu</b></NavLink>
            <div className="dropdown-content">
              <div className="user-account">
                <img src={profile_image_url} alt="Profile Picture" className="profile-picture" id='profileImage'/>
                <div className="user-info">
                <NavLink to="/users/UserUUID/profile">Welcome, <t id="FirstNameDesktop">{FirstNameDesktop}</t></NavLink>
                  <NavLink className='nav-link' to="settings">Settings</NavLink>
                  <select id="status-dropdown-mobile" onChange="updateStatusMobile()" name="status">
                    <option value="Online" className="status-item online">Online</option>
                    <option value="Away" className="status-item away">Away</option>
                    <option value="Do Not Disturb" className="status-item dnd">Do Not Disturb</option>
                    <option value="Appear Offline" className="status-item offline">Appear Offline</option>
                  </select>
                </div>
              </div>
              <NavLink className='nav-link' to="6410b886773710f67ea6835b/directory">Directory</NavLink>
              <NavLink className='nav-link' to="home">My Groups</NavLink>
              <NavLink  onClick={logout} id="desktopNav">Logout</NavLink>
            </div>
          </div>
          {loadProfileImage}
          </nav>
      </header>
      <div id='AuthenticationLoginHolder'>{AuthRequested &&<LoginPopupForm targetURL="/home"/>}</div>
      <Routes>
      <Route
          path='/'
          element={
            <Home Authenticated={authState}/>
          }  
          exact
        />
        <Route path='/settings' element={<Settings Authenticated={authState}/>} />
        <Route
          path="/:id/directory"
          element={<Directory Authenticated={authState}/>}
        />
        <Route path='/home' element={<Home Authenticated={authState}/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/users/:uuid/profile' element={<Profile Authenticated={authState}/>}/>
        <Route path='*' element={<NotFound/>}/>
      </Routes>
      
      <Footer/>
    </div>
    
  );
}
function Footer() {
  return(
  <footer className="tools-footer" style={{}}>
        
  <div className="footCenter">
    <h9>This application is not spported nor endorsed by the Church of Jesus Christ of Latter-day Saints</h9>
  </div>
  <div className="footCenter">
  <button className="button" onClick={() => window.location.href='https://pysa169.eliassanabria.com'}>Provo YSA 169 Ward Login</button>
  </div>
  <div className="footCenter">
    <h9>This webiste is under construction</h9>
  </div>
</footer>);
}


export default App;
