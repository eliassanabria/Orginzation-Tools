import React from 'react';
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
import { useState, useRef } from 'react';
import axios from 'axios';
import { uploadUserImage} from '../addons_React/ProfileImageUploader';
import { AuthState } from '../authentication/login/AuthState';
import { Spinner } from '../addons_React/Spinners/Spinner';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SubscriptionForm from './SubscriptionPlan';
import ManageBillingButton from './ManageBillingBtns';
import StripePricingTable from './StripePrincingTable';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
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
  const [userUID, setUserUID] = useState('');
  const [isStripeCX, setCX] = useState(false);
  const fileInputRef = useRef(null);
  const [CroppedFile, setCropFile] = useState(null);
  const [userPlan, setUserPlan] = useState('No Plan found...');
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
      setCX(UserDocument.isStripeCX);
      setUserPlan(UserDocument.userPlan);
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
  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container mt-4">
      {displayLoader && <Spinner />}
      {authenticated !== AuthState.Authenticated &&
        <LoginPopupForm targetURL={`./settings`} />
      }
      
      <section className="User-Settings">
        <h1 className="mb-4">My Account</h1>
        <div className="text-center mb-4">
        {image && <img src={image} alt="Preview" className="ProfileImageRound rounded-circle" style={{ width: '150px', height: '150px' }} />}
        <input type="file" onChange={handleImageChange} required ref={fileInputRef} accept="image/png, image/jpeg" className="d-none" />
        <button className="btn btn-secondary mt-2" onClick={handleFileButtonClick} enabled>Choose Image</button>
        <button id='imageUploader' className="btn btn-primary mt-2 ms-2" onClick={uploadImage}>Upload Image</button>
      </div>
        <form>
          <div className="mb-3">
            <label htmlFor="FirstNameSetting" className="form-label">First Name</label>
            <input type="text" className="form-control" id="FirstNameSetting" value={FirstName} readOnly />
          </div>
          <div className="mb-3">
            <label htmlFor="LastNameSetting" className="form-label">Last Name</label>
            <input type="text" className="form-control" id="LastNameSetting" value={LastName} readOnly />
          </div>
          <div className="mb-3">
            <label htmlFor="PrefferedNameSetting" className="form-label">Preferred Name</label>
            <input type="text" className="form-control" id="PrefferedNameSetting" value={PrefName} readOnly />
          </div>
          <div className="mb-3">
            <label htmlFor="userEmailSetting" className="form-label">Email Address</label>
            <input type="email" className="form-control" id="userEmailSetting" placeholder="email@mail.com" value={EmailAddress} disabled />
            <div className="form-text">Signed in with Google</div>
          </div>
          <div className="mb-3">
            <label htmlFor="userPhoneSetting" className="form-label">Phone</label>
            <input type="tel" className="form-control" id="userPhoneSetting" placeholder="801-422-0000" value={PhoneNumber} disabled />
          </div>
          <div className="mb-3">
        <label htmlFor="UserDOBSetting" className="form-label">Date of Birth</label>
        <input type="date" className="form-control" id="UserDOBSetting" value={DOB} disabled />
      </div>
    </form>
    {isStripeCX && (<div><ManageBillingButton />  My Plan: {userPlan}</div>)}
    {!isStripeCX && (<StripePricingTable />)}
    {/* <Elements stripe={stripePromise}>
      <SubscriptionForm uid={userUID} />
    </Elements> */}
  </section>
</div>
);
}
