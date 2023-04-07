import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom'
import { AuthState } from '../authentication/login/AuthState'
import SocketContext from '../SocketContext';
//import { Socket, UserStatusChangeEvent } from '../addons_React/socketCommunicator';

import '../loaderContainer.css';
import '../authentication/AuthPopup.css';
import './directory.css';

export function Directory(props) {
  //const socket = useContext(SocketContext);
  const { Authenticated, socket } = props;

  React.useEffect(() => {
    socket.addHandler(handleUserStatusChange);
    return () => {
      socket.removeHandler(handleUserStatusChange);
    }
  });

  function handleUserStatusChange(event) {
    // Select all div elements with class "directory-item"
    const directoryItems = document.querySelectorAll(".directory-item");

    // Loop through each div element with class "directory-item"
    directoryItems.forEach((directoryItem) => {
      // Select the div element with the dynamic id within the current directory-item
      const currentUserLoggedIn = document.getElementById(event.userID);

      // Check if the element exists before changing its class
      if (currentUserLoggedIn) {
        // Change the class of the element
        currentUserLoggedIn.className = event.status;
      }
    });
  }


  //const Authenticated = props.Authenticated;
  //Extract Group ID
  const { id } = useParams();
  const [OrganizationName, setOrgName] = useState(localStorage.getItem('Recent-Org-Directory-Name') || 'Organization Name');


  useEffect(() => {


    const gridContainer = document.getElementById("directory-grid");
    const LoadingHolder = document.getElementById('LoadingHolder');
    gridContainer.innerHTML = '';
    //Clear the directory grid if page is refreshed. This eliminates duplicate members from showing up.
    LoadingHolder.innerHTML = '<div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div></div>';
    if (Authenticated !== AuthState.Authenticated) {
      gridContainer.innerHTML = "Please log in to view this directory";
      LoadingHolder.innerHTML = '';
      //gridContainer.appendChild();
      return;
    }
    //console.log("Grid is :" + gridContainer);

    fetch("/api/" + id + '/membership/validate', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (response.status === 412) {
          //console.log("412 missing data");

          //get surveyIDs
          response.json().then(responseBody => {
            const survey_array = Array.from(responseBody.data);
            const confirmed = window.confirm("Looks like you have " + survey_array.length + " surveys before you can access this page.\nClick continue to take the survey!", "Continue");
            if (confirmed) {
              window.location.href = ('/' + id + '/surveys/' + survey_array[0]);
            }
          });
          return;
        } else {

        }
      })

    const apiUrl = "/api/" + id + '/directory';
    //var directoryCell = gridContainer.children[0];
    //gridContainer = "";
    // Call the API and get the response
    fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          alert("403, please join this group to view directory.\nTo join, please contact the group admin from a join code.");
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(responseBody => {
        const users = Array.from(responseBody.data); // Create an array from the JSON data
        //console.log(users); // This will log an array of user objects to the console
        setOrgName(responseBody.OrgName);
        //console.log("There are " + users.length + " from api call");

        for (let i = 0; i < users.length; i++) {
          const item = users[i];

          // Create a grid item element
          const gridItem = document.createElement("div");
          gridItem.className = "directory-item";
          //gridItem.id = item.id;
          gridItem.onclick = function () {
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
          if (Authenticated === AuthState.Authenticated) {
            gridContainer.appendChild(gridItem);
          }
        }
        LoadingHolder.innerHTML = '';
      })
      .catch(error => {
        LoadingHolder.innerHTML = '';
        console.error("There was a problem fetching the user data:", error);
      });
    console.log("Successful fetch of data");
  },[Authenticated, socket]);
  return (
    <div>
      <div id='authPopUp'>

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
