import React, { useState } from 'react';
import { CAlert } from '@coreui/react'
import 'bootstrap';
import '../AuthPopup.css';
import { Spinner } from '../../addons_React/Spinners/Spinner';
import { signInWithEmailAndPassword, signInWithGoogle, registerWithEmailAndPassword, signInWithApple} from './Firebase_Assets/authFunctions';
import { auth } from './Firebase_Assets/firebaseConfig';
import TermsModal from '../../Legal/TOSModal';
export function LoginPopupForm(props) {
  const [displayLoader, setLoader] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const targetURL = props.targetURL;
  const closePopup = props.closePopup;
  const [displayTOS, setTOSDisp] = useState(false);
  const onClose = ()=>{
    setTOSDisp(false);
  }
  const toggleTOS = ()=>{
    setTOSDisp(true);
  }
   const loginWithGoogle = async(event)=> {
    event.preventDefault();
    try {
      setLoader(true);
      await signInWithGoogle(auth)
      

      //window.location.href = targetURL;
    }
    catch (error) {
      alert(error);

      if (error.code === 'auth/account-exists-with-different-credential') {
        const email = error.email;
        const pendingCred = error.credential;
        
        // Prompt the user to enter their email/password account
        const password = window.prompt(`Enter the password for ${email}:`);
        
        // Sign in with email and password
        await auth.signInWithEmailAndPassword(email, password);
        
        // Get the signed-in user
        const user = auth.currentUser;
        setLoader(true);

        // Link the Google account to the existing account
        await user.linkWithCredential(pendingCred);
      } else {
        console.error('Error signing in with Google:', error);
      }
      setLoader(false);
    }
  }
  const signInWithApplePopup = async(event) =>{
    event.preventDefault();
    try{
      setLoader(true);
      await signInWithApple(auth);
    }catch(error){
      alert(error);
    }
    setLoader(false);

  }
  async function singInWithUsernameAndPassword(event) {
    event.preventDefault();

    setLoader(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
      console.log(response.user.email);
      localStorage.setItem('token', await response.user.getIdToken());
      localStorage.setItem('email', response.user.email);
      window.location.href = targetURL;
    }
    catch (error) {
      alert(error);
    }
    setLoader(false);
  }

  async function registerWithEmail(event) {
    event.preventDefault();
    setLoader(true);
    try {
      const response = await registerWithEmailAndPassword(auth, email, password);
      console.log(response);
      console.log(response.user.email);
      localStorage.setItem('token', await response.user.getIdToken());
      localStorage.setItem('email', response.user.email);
      window.location.href = targetURL;
    }
    catch (error) {
      alert(error);
    }
    setLoader(false);
  }


  return (
    <div>
      <a href="#" className="login-button" onClick={loginWithGoogle} >
        <img src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google logo" className="google-logo"></img>Login with Google</a>
        <br></br><br></br>
        {/* <br></br><br></br>
        <button class="apple-button" onClick={signInWithApplePopup} disabled>
  <span class="apple-icon"></span>
  <span class="apple-text">Sign in with Apple</span>
</button>

      <br></br><br></br>
      {displayLoader && <Spinner />}
      <form id="LoginForm" onSubmit={singInWithUsernameAndPassword}>
        <label htmlFor="email">Email:</label>
        <input
          type="emailText"
          id="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled
        />
        <br />
        <br />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          disabled
        />
        <br />
        <br />
        <input type="button" className="btn btn-secondary form-button" value="Register" onClick={registerWithEmail} disabled/>
        <input type="submit" className="btn btn-primary form-button" value="Login"disabled />

        <br />
        <br />
      </form> */}
      <small>By using this app you agree to the <a href='#' onClick={toggleTOS}>Terms of Service</a></small>
      <button className="btn btn-light"onClick={closePopup}>Cancel</button>
      <TermsModal onClose={onClose} isOpen={displayTOS}/>
    </div>


  );

}
export default LoginPopupForm;
