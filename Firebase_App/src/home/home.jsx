import React, { useEffect, useState } from 'react';

//import { Link, Route, Routes } from 'react-router-dom';
import './home.css';
import { AuthState } from '../authentication/login/AuthState'
import JoinGroupPreview from './Popups/GroupJoinPopup'
import './home-mobile.css';

export function Home(props) {
  const Authenticated = props.Authenticated;
  const [Organizations, setOrgList] = useState([]);
  const [JoinCode, setJoinCode] = useState('');
  const [showGroupPreview, setPreviewStatus] = useState(false);
  //Group Preview Data:
  const [group_name, set_group_name] = useState('');
  const [group_description, set_group_description] = useState('');
  const [group_creation, set_group_creation] = useState('');
  const [member_count, set_member_count] = useState('');
  const [survey_required, set_survey_required] = useState(false);
  const [survey_id, set_survey_id] = useState('');
  const [owner_name, set_owner_name] = useState('');
  const [owner_contact, set_owner_contact] = useState('');
  //cancel join group
  const closePreview = () => {
    setPreviewStatus(false);
    setJoinCode('');
  }
  //Fetch Groups Request:
  useEffect(() => {
    //LoadingHolder.innerHTML = '<div class="popup"> <div class="popup-inner"><div class="spinner-holder"><div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div></div></div>';
    //Fetch call
    fetch('/api/groups/list', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        //console.log(response.json);
        return response.json();
      })
      .then(responseBody => {
        const groupsList = responseBody.groupList;
        const groupListArray = Array.from(groupsList);
        setOrgList(groupListArray);
        console.log(Organizations);
        return;
      })
      .catch(error => {
        //LoadingHolder.innerHTML = '';
        console.error("There was a problem fetching the user data:", error);
      });
    //LoadingHolder.innerHTML = '';
  }, [setOrgList, Authenticated]);

  async function handleJoinRequest(event) {

    event.preventDefault();
    //Get group info:
    const groupInfo = await getGroupDetails('/api/group/' + JoinCode + '/info');
    if (groupInfo.status === 200) {
      const body = await groupInfo.json();
      console.log(body);


      //Group was found, display Group info:
      set_group_name(body.group_name);
      set_group_description(body.group_description);
      set_group_creation(body.group_creation);

      set_member_count(body.member_count);
      set_survey_required(body.survey_required);
      set_survey_id(body.survey_id);
      set_owner_name(body.owner_name);
      set_owner_contact(body.owner_contact);

      setPreviewStatus(true);
    }
    else {
      const body = await groupInfo.json();
      alert(`⚠ Error ${groupInfo.status}: ${body.msg}`);
      setJoinCode('');
    }
  }
  async function getGroupDetails(endpoint) {
    const response = await fetch(endpoint, {
      method: 'get',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response;
  }
  async function joinGroup(endpoint) {
    const response = await fetch(endpoint, {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response;
  }

  const JoinGroup = async () => {
    setPreviewStatus(false);
    const response = await joinGroup('/api/groups/join/' + JoinCode);
    if (response.status !== 200) {
      const body = response.json();
      alert(`⚠ Error: ${body.msg}`);
    }
    else {
      const body = await response.json();
      window.location.href = `/${body.groupID}/directory`;
    }

  }

  //fetch authorized user's associated groups given their username and put it into organizations object to then be added to the html page.
  return (<div>
    < div>
      {showGroupPreview && <JoinGroupPreview closePreview={closePreview} group_name={group_name} group_description={group_description} group_creation={group_creation} member_count={member_count} owner_name={owner_name} owner_contact={owner_contact} JoinGroup={JoinGroup} />}
      <h1>My Groups</h1>
      {Authenticated === AuthState.Authenticated && (<form class="form-inline">
        <label>Join Code:</label>
        <input type="text"class="form-control mb-2 mr-sm-2"  id="inlineFormInputName2" name="join-code" placeholder="Enter Join Code" required value={JoinCode} onChange={(event) => setJoinCode(event.target.value)}></input>
        <button type='submit'class="btn btn-primary mb-2" onClick={handleJoinRequest}>Join Now</button>
        <br></br><br></br>
      </form>)}
      <div className="row">
        {Authenticated === AuthState.Authenticated && (
          Organizations.map((Organizations) => (
            <div
              key={Organizations.id}
              className="col-md-4 mb-4"
              onClick={() => {
                window.location.href = `/${Organizations.id}/directory`;
              }}
            >
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{Organizations.OrganizationName}</h5>
                  <p className="card-text">{Organizations.Description}</p>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item">Member Since: {Organizations.MemberSince}</li>
                  <li className="list-group-item">My Roles: {Organizations.MyOrgRoles}</li>
                  <li className="list-group-item">Status: {Organizations.Status}</li>
                </ul>
              </div>
            </div>
          )))}
      </div>
    </div>
  </div>);
}