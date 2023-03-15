import React, { useState } from 'react';
import './AuthPopup.css';
import LoginPopupForm from './login/LoginPopupForm';

export function PopupAuthenticationPrompt(props) {
  const [showLoginForm, setLoginForm] = useState(false);
  const targetURL = props.targetURL;
  const [Authenticated, setAuthentication] = React.useState(localStorage.getItem('IsSignedIn') || 'false');

  const checkAuthValid = ()=>{
    if(Authenticated == 'true'){
      window.location.href=targetURL;
    }
  }

  const goLogin = () => {
    //Go to Login
    const FormTitle = document.getElementById('FormTitle');
    const authNavBtns = document.getElementById('AuthOptionBtnHolder');
    authNavBtns.style.display = 'none';
    FormTitle.innerHTML = 'Login:'
    setLoginForm(true);
    
  };
  const closePopup = ()=>{
    const popup = document.getElementById("authPopup");
    //popup.style.display='none'
    }

  return (
<div className="popup" id='authPopup'>
  
      <div className="popup-inner" id='popup'>
      <button className="close-button" id ="closeBtn"onClick={closePopup}>x</button>

        <h2>Welcome to Organization Tools</h2>
        <h4>Please login or create an account to continue</h4>
        <h2 id='FormTitle'></h2>
        <div id='formHolder'>
          {showLoginForm && <LoginPopupForm targetURL={targetURL}/>}
        </div>
        <div id='AuthOptionBtnHolder'>
          <button onClick={() => { window.location.href=`/register`}}>Register</button> <button onClick={goLogin}>Login</button>
        </div>
        
      </div>
    </div>
    
    
  );

}

export default PopupAuthenticationPrompt;
