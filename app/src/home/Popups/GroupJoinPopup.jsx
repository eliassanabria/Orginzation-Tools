import React, { useState } from 'react';
import '../../authentication/AuthPopup.css'
//This is the Preview Popup:
export function JoinGroupPreview(props) {
const {closePreview, JoinGroup,group_name, group_description, group_creation, member_count, owner_name, owner_contact}= props;


return(
<div className="popup" id='authPopup'>
    <div className="popup-inner" id='popup'>
        <div>
            Join: {group_name}
        </div>
        <div>
            Description: {group_description}
        </div>
        <div>
        Created on: {group_creation}
        </div>
        <div>
            Members: {member_count}
        </div>
        
        <div>
            Group Owner: {owner_name}
        </div>
        <div>
            Contact Info: {owner_contact}
        </div>
        <div>
        <button onClick={closePreview}>Cancel</button>
        <button onClick={JoinGroup}>Join Group</button>
        </div>
        
    </div>
</div>
);
}
export default JoinGroupPreview;