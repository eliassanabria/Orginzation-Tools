import React from 'react';
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
import { useState, useRef } from 'react';
import axios from 'axios';
import { uploadUserImage} from '../addons_React/ProfileImageUploader';
import { AuthState } from '../authentication/login/AuthState';

export function Settings(props) {
  const authenticated = props.Authenticated;
  const [FirstName, setUserFName] = React.useState(localStorage.getItem('first_name') || 'Visitor');
  const [LastName, setUserLName] = React.useState(localStorage.getItem('last_name') || 'Last Name');
  const [PhoneNumber, setPhoneNumber] = React.useState(localStorage.getItem('PhoneNumber') || '801-123-4525');
  const [EmailAddress, setEmailAddr] = React.useState(localStorage.getItem('email') || 'sampleEmail@cs.byu.edu');
  const [DOB, setDOB] = React.useState(localStorage.getItem('DOB') || '01/01/1999');
  const [PrefName, setPrefName] = React.useState(localStorage.getItem('preferred_name') || 'Guest User');
  const [Pasword, setPassword] = React.useState(localStorage.getItem('Password') || 'Guest Password');
  const [Alias, setAlias] = React.useState(localStorage.getItem('alias') || 'Visitor');
  const fileInputRef = useRef(null);
  const [CroppedFile, setCropFile] = useState(null);
  const [image, setImage] = useState(localStorage.getItem('profile_image_url')||"https://cdn-icons-png.flaticon.com/512/456/456212.png");

  React.useEffect(()=>{
    if(CroppedFile){
      document.getElementById('imageUploader').disabled=false;
    }
    else{
      document.getElementById('imageUploader').disabled=true;

    }
  },[CroppedFile])
  const uploadImage = async()=>{
    //Loading Logo
    console.log("Uploading image...");
    await uploadUserImage(CroppedFile);
    window.location.reload();
  }
  const handleImageChange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
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

  return (
    <div>

      {authenticated !== AuthState.Authenticated &&
        <LoginPopupForm targetURL={`./settings`} />
      }
      <h1>My Account</h1>

      {image && <img src={image} alt="Preview" className='ProfileImageRound' />}
      <input type="file" onChange={handleImageChange} required ref={fileInputRef} accept="image/png, image/jpeg" />
      <button id='imageUploader' onClick={uploadImage}>Upload Image</button>

      <section className="User-Settings">
        <div>
          <label><b>First Name:</b></label>
          <label id="FirstNameSetting">{FirstName}</label>
        </div>
        <div>
          <label><b>Last Name:</b></label>
          <label id="LastNameSetting">{LastName}</label>
        </div>
        <div>
          <lable><b>Preferred Name:</b></lable>
          <lable id="PrefferedNameSetting">{PrefName}</lable>
        </div>
        <div>
          <label><b>Email Address:</b></label>
          <input type="email" id="userEmailSetting" disabled placeholder="email@mail.com" value={EmailAddress} />
          <input type="button" id="change-email-btn" value="Change Email" disabled />
        </div>
        <div>
          <label><b>Phone:</b></label>
          <input type="tel" id="userPhoneSetting" disabled placeholder="801-422-0000" value={PhoneNumber} />
          <input type="button" id="change-phone-btn" value="Change Phone" disabled />
          <label id="phone verified">Not Verified</label>
        </div>
        <div>
          <label><b>Date of Birth:</b></label>
          <input type="date" id="UserDOBSetting" value={DOB} disabled />
        </div>
        <div>
          <label><b>Password:</b></label>
          <input type="password" id="userPassSetting" disabled value={Pasword} />
          <input type="button" id="change-password" value="Change Password" disabled />
        </div>
      </section>
    </div>
  );
}
