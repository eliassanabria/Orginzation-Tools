import React,{useEffect, useState} from 'react';

//import { Link, Route, Routes } from 'react-router-dom';
import './home.css';
import { AuthState } from '../authentication/login/AuthState'
export function Home(props) {
  const Authenticated = props.Authenticated;
  const [Organizations, setOrgList] = useState([] || []);
//Fetch Request:
useEffect(()=>{
  const LoadingHolder = document.getElementById('LoadingHolder');
  //LoadingHolder.innerHTML ='<div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div>';
  //Fetch call
  fetch('/api/groups/list',{
    headers:{
    'Authorization': `Bearer ${localStorage.getItem('token')}`
}})
.then(response =>{
  if(!response.ok){
    throw new Error("Network response was not ok");
  }
  //console.log(response.json);
  return response.json();
})
.then(responseBody =>{
  setOrgList(Array.from(responseBody.groupList));
  console.log(Organizations);
  return;
})
.catch(error => {
  LoadingHolder.innerHTML = '';
  console.error("There was a problem fetching the user data:", error);
});
LoadingHolder.innerHTML = '';
}, [setOrgList]);
//fetch authorized user's associated groups given their username and put it into organizations object to then be added to the html page.

    return (<div>
      
        < div>
            <h1>My Groups</h1>
            <form>
            <label>Join Code:</label>
            <input type="text" id="join-code" name="join-code" placeholder="Enter Join Code" required></input>
            <button type='submit'>Join Now</button>
            <br></br><br></br>
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
              
              {Authenticated ===  AuthState.Authenticated && Organizations.map(Organizations => (
                  <tr key={Organizations.id} onClick={() => { window.location.href=`/${Organizations.id}/directory`}}>
                  <td>{Organizations.OrganizationName}</td>
                  <td>{Organizations.Description}</td>
                  <td>{Organizations.MemberSince}</td>
                  <td>{Organizations.MyOrgRoles}</td>
                </tr>
                ))}
                <tr id='LoadingHolder'><div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div></tr>
                
                {Authenticated !== AuthState.Authenticated && (
                  <tr>Please sign in to view your groups.</tr>
                )}
              </tbody>
            </table>
                    </div>
                </div>);
}