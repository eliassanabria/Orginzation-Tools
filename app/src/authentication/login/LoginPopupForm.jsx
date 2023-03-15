import React, { useState } from 'react';
import '../AuthPopup.css';
export function LoginPopupForm(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const targetURL = props.targetURL;

  async function loginUser(event) {
    event.preventDefault();
    login(`/api/auth/login`);
  }

  async function login(endpoint){
    //set spinning loader
    const spinnerHolder = document.getElementById('spinnerHolder');
    spinnerHolder.innerHTML = '<div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div></div>';

    const response = await fetch(endpoint,{
      method:'post',
      body:JSON.stringify({email: email, password: password}),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    if(response?.status === 200){
      //get auth token
      if (response?.headers.has('Authorization')) {
        // Extract token from header value
        const token = response.headers.get('Authorization').split(' ')[1];
        // Store token in local storage or cookie
        localStorage.setItem('token',token);
      } else {
        console.log('No Authorization Bearer token found in response header');
        // Handle login error
      }
      spinnerHolder.innerHTML = '';
      const body = await response.json();
      localStorage.setItem('email', email);
      //Save data to local storage:
      localStorage.setItem('profile_image_url',body.profile_image_url);
      localStorage.setItem('first_name', body.first_name);
      localStorage.setItem('last_name',body.last_name);
      localStorage.setItem('preferred_name',body.preferred_name);
      localStorage.setItem('email',body.email);
      localStorage.setItem('alias', body.alias);
      localStorage.setItem('creation_date', body.creation_date);
      localStorage.setItem('userID', body.id);

      window.location.href = targetURL;
    }
    else if(response?.status ===401){
      const body = await response.json();
      spinnerHolder.innerHTML = '';
      alert(`⚠ Error: ${body.msg}`);

    }
    else{
      spinnerHolder.innerHTML = '';
    }
  }
  
  return (
    <div>
      <div id='spinnerHolder'>

      </div>
      <form id="LoginForm" onSubmit={loginUser}>
        <label htmlFor="email">Email:</label>
        <input
          type="emailText"
          id="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
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
        />
        <br />
        <br />
        <input type="button" value="Register" onClick={() => { window.location.href=`/register`}}/>
        <input type="submit" value="Login" />
        <br />
        <br />
    </form>
    </div>
    
    
  );

}
export default LoginPopupForm;
