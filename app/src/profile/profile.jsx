import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'
import './profile.css'
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';

export function Profile(props) {
    const Authenticated = props.Authenticated;

    //Extract USER_UUID for Profile
    const { id } = useParams();



    return(<div>
        <div>
        {Authenticated === 'false' && 
          <LoginPopupForm targetURL={`./profile`} />
                }
            <section>
                <br></br>
            <img src="https://cdn-icons-png.flaticon.com/512/456/456212.png" alt="Profile Picture" className="ProfileImageRound" />
                <h1>Selected User</h1>
            </section>
            
        </div>
    </div>);
}