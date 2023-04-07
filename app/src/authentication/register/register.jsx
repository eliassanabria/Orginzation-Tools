import React from "react";
import { useState, useRef, useEffect } from 'react';
import LoginPopupForm from '../PopupAuthenticationPrompt'
import './register.css';
//import { Area } from 'react-easy-crop/types';
import { uploadUserImage } from "../../addons_React/ProfileImageUploader";
import { AuthState } from '../login/AuthState';
export function Register(props) {
  const fileInputRef = useRef(null);
  const [CroppedFile, setCropFile] = useState(null);
  const Authenticated = props.Authenticated;
  const [AuthRequested, requestAuthPage] = useState(false); // Don't need
  const [email, setEmail] = useState('');
  const [shareEmailOrg, setEmailSharing] = useState(true);
  const [alias, setAlias] = useState('');
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [preferred_name, setPreferredName] = useState('');
  const [sharePrefNameWithOrg, setPrefNameSharing] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sharePhone, setPhoneDisp] = useState(true);
  const [dob, setDOB] = useState();
  const [gender, setGender] = useState('maleGender'); const [password, setPassword] = useState('')

  const [image, setImage] = useState("https://cdn-icons-png.flaticon.com/512/456/456212.png");
  const formatPhoneNumber = (input) => {
    // Strip all non-numeric characters from the input
    const numericInput = input.replace(/\D/g, '');

    // Slice the input into three groups of three characters each
    const firstGroup = numericInput.slice(0, 3);
    const secondGroup = numericInput.slice(3, 6);
    const thirdGroup = numericInput.slice(6, 10);

    // Combine the groups into the final formatted phone number
    const formattedNumber = `${firstGroup}-${secondGroup}-${thirdGroup}`;

    return formattedNumber;
  };
  const handleImageChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      //setImage(reader.result);
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          context.drawImage(
            img,
            (img.width - size) / 2,
            (img.height - size) / 2,
            size,
            size,
            0,
            0,
            size,
            size
          );
          canvas.toBlob((blob) => {
            // convert the blob to a file
            const croppedFile = new File([blob], file.name, { type: file.type });
            // call your upload image function with the cropped file
            setCropFile(croppedFile);
          }, file.type);
          const dataUrl = canvas.toDataURL(file.type);
          setImage(dataUrl);
        };
      };
    };
  }
  const handlePhoneNumberChange = (event) => {
    const input = event.target.value;
    const formattedNumber = formatPhoneNumber(input);
    setPhoneNumber(formattedNumber);
  };
  const handleEmailUpdateChange = (event) => {
    const input = event.target.value;
    setEmail(input);
  };
  const handleFirstNameUpdateChange = (event) => {
    const input = event.target.value;
    setFirstName(input);
  };
  const handleLastNameUpdateChange = (event) => {
    const input = event.target.value;
    setLastName(input);
  };
  const handleAliasUpdateChange = (event) => {
    const input = event.target.value;
    setAlias(input);
  };
  const handleDOBUpdateChange = (event) => {
    const input = event.target.value;
    setDOB(input);
  };
  const handlePrefNameUpdateChange = (event) => {
    const input = event.target.value;
    setPreferredName(input);
  };
  const handlePasswordUpdateChange = (event) => {
    const input = event.target.value;
    setPassword(input);
  };
  async function registerNewUser(event) {
    event.preventDefault();
    register('/api/auth/register');
  }
  async function register(endpoint) {
    const response = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({
        email: email,
        password: password,
        first_name: first_name,
        last_name: last_name,
        preferred_name: preferred_name,
        share_pref_name: sharePrefNameWithOrg,
        phone: phoneNumber,
        share_phone: sharePhone,
        email: email,
        share_email: shareEmailOrg,
        alias: alias,
        dob: dob,
        gender: gender,
        password: password,
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    //Check successful creation then attempt to upload image to S3:
    if (response?.status === 200) {
      if (response?.headers.has('Authorization')) {
        // Extract token from header value
        const token = response.headers.get('Authorization').split(' ')[1];
        // Store token in local storage or cookie
        localStorage.setItem('token', token);
      } else {
        console.log('No Authorization Bearer token found in response header');
        // Handle login error
      }
      const body = await response.json();
      localStorage.setItem('email', email);
      //Save data to local storage:
      localStorage.setItem('profile_image_url', body.profile_image_url);
      localStorage.setItem('first_name', first_name);
      localStorage.setItem('last_name', last_name);
      localStorage.setItem('preferred_name', preferred_name);
      localStorage.setItem('alias', alias);
      localStorage.setItem('creation_date', body.creation_date);
      localStorage.setItem('userID', body.id);
      localStorage.setItem('dob', dob);
      //localStorage.setItem('')
      const file = fileInputRef.current.files[0];
      await uploadUserImage(CroppedFile);
    }
    else if (response?.status === 409) {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
    window.location.href = "/home";
    //Upload image to S3 Bucket
  }


  const backToLogin = () => {
    window.location.href = "/home";

  }

  useEffect(() => {
    if (Authenticated === AuthState.Authenticated) {
      window.location.href = '/home';
    }
  }, [Authenticated]);



  return (
    <div id="AuthenticationFormHolder">
      <div id='AuthenticationLoginHolder'>{AuthRequested && <LoginPopupForm targetURL="/home" />}</div>
      <form id="RegisterForm" onSubmit={registerNewUser}>
        <h1>Create your account:</h1>

        {image && <img src={image} alt="Preview" className='ProfileImageRound' />}
        <br />
        <br />
        <input type="file" onChange={handleImageChange} required ref={fileInputRef} accept="image/png, image/jpeg" /> Image Upload Not working yet... stay tuned!
        <br />
        <br />
        <label htmlFor="email">Email: </label>
        <input type="email"
          id="emailRegistered"
          name="varEmail" required
          value={email}
          onChange={handleEmailUpdateChange} />
        <input
          type="checkbox"
          id="shareEmailOrg"
          name="shareEmailWithorg"
          value={shareEmailOrg}

        />
        <label htmlFor="shareEmailOrg">Share with Organizations</label>
        <br />
        <br />
        <label htmlFor="Alias">Alias: </label>
        <input type='text' id='alias' name='userAlias' value={alias} onChange={handleAliasUpdateChange} required />
        <br />
        <br />
        <label htmlFor="firstNameRegister">First Name: </label>
        <input
          type="text"
          id="firstNameRegister"
          name="varText"
          placeholder="First Name"
          value={first_name}
          spellCheck=""
          required
          onChange={handleFirstNameUpdateChange}
        />
        <br />
        <br />
        <label htmlFor="lastNameRegister">Last Name: </label>
        <input
          type="text"
          id="lastNameRegister"
          name="varText"
          placeholder="Last Name"
          spellCheck=""
          value={last_name}
          required
          onChange={handleLastNameUpdateChange}
        />
        <br />
        <br />
        <label htmlFor="prefName">Preferred Name: </label>
        <input
          type="text"
          id="prefName"
          name="varText"
          placeholder="Preffered name"
          spellCheck=""
          value={preferred_name}
          required
          onChange={handlePrefNameUpdateChange}
        />
        <input
          type="checkbox"
          id="checkbox1"
          name="sharePrefNameWithWard"
          value={sharePrefNameWithOrg}
          defaultChecked
        />
        <label htmlFor="checkbox1">Display In Organization Directory</label>
        <br />
        <br />
        <label htmlFor="phone">Phone Number:</label>
        <input
          type='tel'
          id="phone"
          name="phone"
          placeholder="801-422-0000"
          pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
          required
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
        />
        <input
          type="checkbox"
          id="sharePhoneWard"
          name="sharePhonehWard"
          value={sharePhone}
          defaultChecked
        />
        <label htmlFor="sharePhoneWard">Share with Organizations</label>
        <br />
        <br />
        <label htmlFor="DOB_Reg">Date of Birth: </label>
        <input
          type="date"
          name="varDate"
          id="DOB_Reg"
          required
          value={dob}
          onChange={handleDOBUpdateChange}
          placeholder="01/01/1999"
        />
        <br />
        <br />
        <label>Gender:  </label>
        <label htmlFor="maleGender">Male</label>
        <input
          type="radio"
          id="maleGender"
          name="gender"
          value="maleGender"
          checked={gender === 'maleGender'}
          onChange={(e) => setGender(e.target.value)}
        />

        <label htmlFor="femaleGender">Female</label>
        <input
          type="radio"
          id="femaleGender"
          name="gender"
          value="femaleGender"
          checked={gender === 'femaleGender'}
          onChange={(e) => setGender(e.target.value)}
        />
        <br />
        <br />
        <label htmlFor="password">Password: </label>
        <input type="password" id="passwordRegister" name="varPassword" required value={password}
          onChange={handlePasswordUpdateChange} />
        <br />
        <br />
        <button type="button" onClick={backToLogin}>Return to Login</button>
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}