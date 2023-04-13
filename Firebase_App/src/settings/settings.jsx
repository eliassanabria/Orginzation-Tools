import React from 'react';
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
import { useState, useRef } from 'react';
import axios from 'axios';
import { uploadUserImage} from '../addons_React/ProfileImageUploader';
import { AuthState } from '../authentication/login/AuthState';
import { Spinner } from '../addons_React/Spinners/Spinner';
export function Settings(props) {
  const authenticated = props.Authenticated;
  const[displayLoader, setLoader] = useState(false);
  const [FirstName, setUserFName] = useState(localStorage.getItem('first_name') || 'Visitor');
  const [LastName, setUserLName] = useState(localStorage.getItem('last_name') || 'Last Name');
  const [PhoneNumber, setPhoneNumber] = React.useState(localStorage.getItem('PhoneNumber') || '801-123-4525');
  const [EmailAddress, setEmailAddr] = React.useState(localStorage.getItem('email') || 'sampleEmail@cs.byu.edu');
  const [DOB, setDOB] = React.useState(localStorage.getItem('DOB') || '01/01/1999');
  const [PrefName, setPrefName] = React.useState(localStorage.getItem('preferred_name') || 'Guest User');
  const [Alias, setAlias] = React.useState(localStorage.getItem('alias') || 'Visitor');
  const fileInputRef = useRef(null);
  const [CroppedFile, setCropFile] = useState(null);
  const [image, setImage] = useState(localStorage.getItem('profile_image_url')||"https://cdn-icons-png.flaticon.com/512/456/456212.png");
  const fetchUserSettings = async () => {
    try {
      setLoader(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/account/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const { UserDocument } = response.data;

      setUserFName(UserDocument.first_name);
      setUserLName(UserDocument.last_name);
      setPhoneNumber(UserDocument.phone);
      setEmailAddr(UserDocument.email);
      setDOB(UserDocument.dob);
      setPrefName(UserDocument.preferred_name);
      //setJoinDate(UserDocument.cre)
      setAlias(UserDocument.alias);
      setImage(UserDocument.profile_image_url);
      setLoader(false);

    } catch (error) {
      console.error('Error fetching user settings:', error);
      setLoader(false);

    }
  };

  React.useEffect(() => {
    if (props.Authenticated === AuthState.Authenticated) {
      fetchUserSettings();
    }
  }, [props.Authenticated]);
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
    setLoader(true);

    console.log("Uploading image...");
    await uploadUserImage(CroppedFile);
    setLoader(false);

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
      {displayLoader && <Spinner/>}
      {authenticated !== AuthState.Authenticated &&
        <LoginPopupForm targetURL={`./settings`} />
      }
      
      <section className="User-Settings">
      <h1>My Account</h1>
      {image && <img src={image} alt="Preview" className='ProfileImageRound' />}
      <input type="file" onChange={handleImageChange} required ref={fileInputRef} accept="image/png, image/jpeg" />
      <button id='imageUploader' onClick={uploadImage}>Upload Image</button>
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
          
          <input type="button" id="change-password" value="Change Password" disabled />
        </div>
      </section>
    </div>
  );
}
