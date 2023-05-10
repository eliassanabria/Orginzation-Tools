import React from "react";
import { useState, useRef, useEffect } from 'react';
import LoginPopupForm from '../PopupAuthenticationPrompt'
import './register.css';
//import { Area } from 'react-easy-crop/types';
import { uploadUserImage } from "../../addons_React/ProfileImageUploader";
import { AuthState } from '../login/AuthState';
export function ProfileSetup(props) {
  const logout = props.logout;
  const fileInputRef = useRef(null);
  const [CroppedFile, setCropFile] = useState(null);
  const Authenticated = props.Authenticated;
  const Email = props.email;
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
  const [aliasError, setAliasError] = useState('');
  const [dobError, setDobError] = useState('');


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
  const validateAlias = (alias) => {
    const aliasPattern = /^[a-z0-9._]+$/;

    if (alias.length < 5) {
      setAliasError('Alias must be at least 5 characters long');
      return false;
    } else if (!aliasPattern.test(alias)) {
      setAliasError('Alias can only contain lowercase letters, digits, dots, and underscores');
      return false;
    } else {
      setAliasError('');
      return true;
    }
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
    validateAlias(input);
    setAlias(input);
  };
  const handleDOBUpdateChange = (e) => {
    const newDob = e.target.value;
    setDOB(newDob);

    validateAge(newDob);
  };

  const calculateAge = (birthdate) => {
    const birthDate = new Date(birthdate);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = currentDate.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && currentDate.getDate() < birthDate.getDate())) {
      return age - 1;
    }

    return age;
  };
  const validateAge = (birthdate) => {
    const age = calculateAge(birthdate);

    if (age < 16) {
      setDobError('You must be at least 16 years of age');
      return false;
    } else {
      setDobError('');
      return true;
    }
  };

  const handlePrefNameUpdateChange = (event) => {
    const input = event.target.value;
    setPreferredName(input);
  };
  async function registerNewUser(event) {
    event.preventDefault();
    register('/api/auth/create/profile');
  }
  async function register(endpoint) {
    const response = await fetch(endpoint, {
      method: 'post',
      body: JSON.stringify({
        email: Email,
        first_name: first_name,
        last_name: last_name,
        pref_name: preferred_name,
        share_pref_name: sharePrefNameWithOrg,
        phone: phoneNumber,
        share_phone: sharePhone,
        share_email: shareEmailOrg,
        alias: alias,
        dob: dob,
        gender: gender,
      }),
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-type': 'application/json; charset=UTF-8',
      },
    });
    //Check successful creation then attempt to upload image to S3:
    if (response?.status === 201) {
      await uploadUserImage(CroppedFile);
      window.location.reload();
    }
    else if (response?.status === 409) {
      const body = await response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
  }

  useEffect(() => {
    if (Authenticated !== AuthState.Authenticated) {
      window.location.href = '/home';
    }
  }, [Authenticated]);



  return (
    <div id="AuthenticationFormHolder">
      <form id="RegisterForm" onSubmit={registerNewUser}>
        <h3>Account Setup:</h3>

        {image && <img src={image} alt="Preview" className='ProfileImageRoundSubmit' />}
        <br />
        <input type="file" onChange={handleImageChange} required ref={fileInputRef} accept="image/png, image/jpeg" />
        <br />
        <label htmlFor="email">Email: {Email}</label>
        <input
          type="checkbox"
          id="shareEmailOrg"
          name="shareEmailWithorg"
          value={shareEmailOrg}

        />
        <label htmlFor="shareEmailOrg">Share with Orgs</label>
        {aliasError && (<small className="text-danger">{aliasError}</small> )}
        <br />
        <label htmlFor="Alias">Alias:  </label>
        <input type='text' id='alias' name='userAlias' value={alias} pattern="[a-z._]*"
          minlength="5" onChange={handleAliasUpdateChange} required />
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
        <label htmlFor="prefName">Preferred Name: </label>
        <input
          type="text"
          id="prefName"
          name="varText"
          placeholder="Preferred name"
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
        <label htmlFor="checkbox1">Display In Org Directory</label>
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
        <label htmlFor="sharePhoneWard">Share with Orgs</label>
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
        /> <label style={{ color: 'red' }}>*</label>
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
        /><label style={{ color: 'red' }}>*</label>
        <br />
        <div className="mb-3">
          <button type="submit" className="btn btn-primary">Save Public Profile</button>
          <button onClick={logout} className="btn btn-secondary ms-2">Logout</button>
        </div>
        <p style={{ color: 'red' }}>* This information is only visible to you and group owners and leader of groups you are apart of</p>
      </form>

    </div>
  );
}