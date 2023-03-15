import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
import { AuthState } from '../authentication/login/AuthState'

import '../loaderContainer.css';
import '../authentication/AuthPopup.css';
import './directory.css';

export function Directory(props) {

  const Authenticated = props.Authenticated;
    //Extract Group ID
    const { id } = useParams();
    const[OrganizationName, setOrgName] = useState(localStorage.getItem('Recent-Org-Directory-Name') || 'Organization Name');
  
    useEffect(()=>{
      const gridContainer = document.getElementById("directory-grid");
      const LoadingHolder = document.getElementById('LoadingHolder');
      gridContainer.innerHTML='';
      //Clear the directory grid if page is refreshed. This eliminates duplicate members from showing up.
      LoadingHolder.innerHTML ='<div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div></div>';
      if(Authenticated !== AuthState.Authenticated){
        gridContainer.innerHTML = "Please log in to view this directory";
        //gridContainer.appendChild();
        return;
      }
      console.log("Grid is :" + gridContainer);
      
      const apiUrl = "/api/" + id + '/directory';
      //var directoryCell = gridContainer.children[0];
      //gridContainer = "";
      // Call the API and get the response
      fetch(apiUrl, {
        headers:{
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }})
        .then(response => {
          if (!response.ok) {
            alert("403, please join this group to view directory.\nTo join, please contact the group admin from a join code.");
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then(responseBody => {
          const users = Array.from(responseBody.data); // Create an array from the JSON data
          console.log(users); // This will log an array of user objects to the console
          setOrgName(responseBody.OrgName);
          console.log("There are " + users.length + " from api call");

          for (let i = 0; i < users.length; i++) {
              const item = users[i];
            
              // Create a grid item element
              const gridItem = document.createElement("div");
              gridItem.className = "directory-item";
              gridItem.id = item.id;
              gridItem.onclick = function() {
                window.location.href = '/users/' + item.id + '/profile'
              };
            
              // Create the inner structure of the grid item
              const userObjectBoarder = document.createElement("div");
              userObjectBoarder.className = "Directory_User_Object_Boarder";
            
              const userSmallProfileIconBoarder = document.createElement("div");
              userSmallProfileIconBoarder.className = "directory_user_small_profile_icon_boarder";
            
              const userSmallProfileIcon = document.createElement("img");
              userSmallProfileIcon.className = "directory_user_small_profile_icon";
              userSmallProfileIcon.src = item.profile_image_url;
              userSmallProfileIcon.alt = "UserImageProfileSmall";
            
              const userStatusOnline = document.createElement("div");
              userStatusOnline.id = item.id;
              //Uncomment code below once service is available.
              //userStatusOnline.className = `overlayUserStatus${item.status}`;
              userStatusOnline.className = `overlayUserStatusOffline`;
            
              const userPreferredName = document.createElement("div");
              userPreferredName.className = "UserPreferredName";
              userPreferredName.textContent = item.name;
            
              const userApartmentLabel = document.createElement("div");
              userApartmentLabel.className = "UserApartmentLable";
              //Change this to address once service is written
              userApartmentLabel.textContent = item.secondary_lable;
            
              const userCallingsLabel = document.createElement("div");
              userCallingsLabel.className = "UserCallingsLable";
              //Change this to callings when service is available.
              userCallingsLabel.textContent = item.roles;
            
              // Append the elements to the grid item
              userSmallProfileIconBoarder.appendChild(userSmallProfileIcon);
              userSmallProfileIconBoarder.appendChild(userStatusOnline);
              userObjectBoarder.appendChild(userSmallProfileIconBoarder);
              userObjectBoarder.appendChild(userPreferredName);
              userObjectBoarder.appendChild(userApartmentLabel);
              userObjectBoarder.appendChild(userCallingsLabel);
              gridItem.appendChild(userObjectBoarder);
            
              // Append the grid item to the grid container
              if(Authenticated === AuthState.Authenticated){
                gridContainer.appendChild(gridItem);
              }
          }
          LoadingHolder.innerHTML = '';
        })
        .catch(error => {
          LoadingHolder.innerHTML = '';
          console.error("There was a problem fetching the user data:", error);
        });
    });
	      return(
        <div>
          <div id='authPopUp'>
          {Authenticated !== AuthState.Authenticated && 
          <LoginPopupForm targetURL={`./directory`} />
                }
          </div>
            <header>
    	<div className="footCenter">
			<b> {OrganizationName} </b>
		</div>
        <div className="footCenter">
		Directory
	</div>
	</header>
    <div id="directory-grid">
		<div className="directory-item">
		  <div className="Directory_User_Object_Boarder">
						  <div className="directory_user_small_profile_icon_boarder">
							  <img className="directory_user_small_profile_icon" src="https://cdn-icons-png.flaticon.com/512/456/456212.png" alt="UserImageProfileSmall"></img>
							  <div id="CurrentUserLoggedIn" className="overlayUserStatusOnline"></div>
						  </div>
						  <div className="UserPreferredName"><t id="PrefferedName">Visitor</t></div>
						  <div className="UserApartmentLable">BYU Campus TMCB</div>
						  <div className="UserCallingsLable">CS 260 TA, Professor, Student</div>
					  </div>
		</div>
				  <div className="directory-item">
			<div className="Directory_User_Object_Boarder">
						  <div className="directory_user_small_profile_icon_boarder">
							  <img className="directory_user_small_profile_icon" src="https://media.licdn.com/dms/image/C4D03AQEsy3vazJSOpQ/profile-displayphoto-shrink_800_800/0/1597247840181?e=2147483647&amp;v=beta&amp;t=AfLvDe1FzLUdyDvPygpD_tV4VYFflHz7U9ae792EDs0" alt="UserImageProfileSmall"></img>
							  <div className="overlayUserStatusAway"></div>
						  </div>
						  <div className="UserPreferredName">Elias Sanabria</div>
						  <div className="UserApartmentLable">Old Academy #200</div>
						  <div className="UserCallingsLable">Ward Clerk</div>
					  </div>
            
		  </div>
	  </div>
    <div id='LoadingHolder'></div>
    
    
        </div>
            );
}