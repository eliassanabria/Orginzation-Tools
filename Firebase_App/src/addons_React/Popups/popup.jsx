import React, { useState } from 'react';
import './AuthPopup.css';

export function Popup(props) {
  const targetURL = props.targetURL;
  const react_component = props.component;
  //pass in the Close popup from the App.jsx
  const closePopup = props.closePopup;




  return (
    <div className="popup" id='authPopup'>
      
      <div className="popup-inner" id='popup'>
        {react_component}
        
      </div>
    </div>
  );
}

export default Popup;
