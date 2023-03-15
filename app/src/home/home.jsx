import React from 'react';

//import { Link, Route, Routes } from 'react-router-dom';
import './home.css';
import LoginPopupForm from '../authentication/PopupAuthenticationPrompt';
import { AuthState } from '../authentication/login/AuthState'

export function Home(props) {
  const Authenticated = props.Authenticated;
  const organizations=[
    { id: '6410b886773710f67ea6835b', OrganizationName: 'CS 260 Members', Description: 'This is group A', MemberSince: '03-01-2023', MyOrgRoles: 'Student'},
    //{ id: 2, OrganizationName: 'Group B', Description: 'This is group B', MemberSince: 5 , MyOrgRoles: 'TA'},
    //{ id: 3, OrganizationName: 'Group C', Description: 'This is group C', MemberSince: 3 , MyOrgRoles: 'TA'},
  ];
//Fetch Request:
React.useEffect(()=>{
  const LoadingHolder = document.getElementById('LoadingHolder');
  LoadingHolder.innerHTML ='<div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div></div>';
  //Fetch call
  

  LoadingHolder.hidden = true;
})
//fetch authorized user's associated groups given their username and put it into organizations object to then be added to the html page.


    return (<div>
      
        < div>
            <h1>My Groups</h1>
            <form>
            <label for="join-code">Join Code:</label>
            <input type="text" id="join-code" name="join-code" placeholder="Enter Join Code" required></input>
            <button type='submit'>Join Now</button>
            </form>
            <table className='organization-table-associated'>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Description</th>
                  <th>Member Since</th>
                  <th>My Roles</th>
                </tr>
              </thead>
              <tbody>
              <tr id='LoadingHolder'></tr>
              {Authenticated ===  AuthState.Authenticated && organizations.map(organization => (
                  <tr key={organization.id} onClick={() => { window.location.href=`/${organization.id}/directory`}}>
                  <td>{organization.OrganizationName}</td>
                  <td>{organization.Description}</td>
                  <td>{organization.MemberSince}</td>
                  <td>{organization.MyOrgRoles}</td>
                </tr>
                ))}
                
                {Authenticated !== AuthState.Authenticated && (
                  <tr>Please sign in to view your groups.</tr>
                )}
              </tbody>
            </table>
                    </div>
                </div>);
}