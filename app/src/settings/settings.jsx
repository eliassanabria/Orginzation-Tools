import React from 'react';
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';

export function Settings(props) {
    const Authenticated = props.Authenticated;
    const [FirstName, setUserFName] = React.useState(localStorage.getItem('FirstName') || 'Visitor');
    const [LastName, setUserLName] = React.useState(localStorage.getItem('LastName') || 'Last Name');
    const [PhoneNumber, setPhoneNumber] = React.useState(localStorage.getItem('PhoneNumber') || '801-123-4525');
    const [EmailAddress, setEmailAddr] = React.useState(localStorage.getItem('EmailAddress') || 'sampleEmail@cs.byu.edu');
    const [DOB, setDOB] = React.useState(localStorage.getItem('DOB') || '01/01/1999');
    const [PrefName, setPrefName] = React.useState(localStorage.getItem('PrefName') || 'Guest User');
    const [Pasword, setPassword] = React.useState(localStorage.getItem('Password') || 'Guest Password');
    const [Alias, setAlias] = React.useState(localStorage.getItem('Alias') || 'Visitor');


    return (
        <div>
            {Authenticated === 'false' && 
          <LoginPopupForm targetURL={`./settings`} />
                }
            <h1>Settings</h1>
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
                <input type="email" id="userEmailSetting" disabled placeholder="email@mail.com" value={EmailAddress}/>
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
                <input type="password" id="userPassSetting" disabled value={Pasword}/>
                <input type="button" id="change-password" value="Change Password" disabled />
            </div>
            </section>
        </div>
      );
}
