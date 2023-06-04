import React, { useEffect, useState } from 'react';

import { Link, Route, Routes } from 'react-router-dom';
import './home.css';
import { AuthState } from '../authentication/login/AuthState'
import JoinGroupPreview from './Popups/GroupJoinPopup'
import './home-mobile.css';
import { Spinner } from '../addons_React/Spinners/Spinner';
import { Card, Button, Form } from 'react-bootstrap';
import { CSSTransition } from 'react-transition-group';

export function Home(props) {
  const [showJoinForm, setShowJoinForm] = useState(false);

  const [displayLoader, setLoader] = useState(false);
  const Authenticated = props.Authenticated;
  const [Organizations, setOrgList] = useState(null);
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
    if (Authenticated !== AuthState.Authenticated) {
      //Check if user is Authenticated, if they are not, don't even try to make the request.
      return;
    }
    setLoader(true);
    //Fetch call
    fetch('/api/groups/list', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        if (!response.ok) {
          setLoader(false);
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
        setLoader(false);
        return;
      })
      .catch(error => {
        setLoader(false);
        console.error("There was a problem fetching the user data:", error);
      });

  }, [Authenticated]);



  if (!Organizations && Authenticated !== AuthState.Authenticated) {
    return (<div>
      <h1>Groups:</h1>
      <div>
        Please log in to view groups...
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        <br></br>

      </div>
    </div>);
  }

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
    setLoader(true);
    setPreviewStatus(false);
    const response = await joinGroup('/api/groups/join/' + JoinCode);
    if (response.status !== 200) {
      const body = response.json();
      alert(`⚠ Error: ${body.msg}`);
      setLoader(false);

    }
    else {
      const body = await response.json();
      setLoader(false);

      window.location.href = `groups/${body.groupID}/directory`;
    }

  }

  //fetch authorized user's associated groups given their username and put it into organizations object to then be added to the html page.
  return (<div>
    <div>
    {displayLoader && <Spinner />}
      {showGroupPreview && <JoinGroupPreview closePreview={closePreview} group_name={group_name} group_description={group_description} group_creation={group_creation} member_count={member_count} owner_name={owner_name} owner_contact={owner_contact} JoinGroup={JoinGroup} />}
      <h1>My Groups</h1>
      {Authenticated === AuthState.Authenticated && (<div className="col-md-4 mb-4">
        <Card>
          <Card.Body>
            <Card.Title>Join a Group</Card.Title>
            <Button
              className="btn btn-primary mb-2"
              onClick={() => setShowJoinForm(!showJoinForm)}
            >
              <i className="fas fa-plus"></i>
            </Button>
            <CSSTransition
              in={showJoinForm}
              timeout={300}
              classNames="fade"
              unmountOnExit
            >
              <Form onSubmit={handleJoinRequest}>
                <Form.Group controlId="joinCode">
                  <Form.Label>Join Code:</Form.Label>
                  <Form.Control
                    type="text"
                    name="join-code"
                    placeholder="Enter Join Code"
                    required
                    value={JoinCode}
                    onChange={(event) =>
                      setJoinCode(event.target.value)
                    }
                  />
                </Form.Group>
                <Button type="submit" className="btn btn-primary">
                  Join Now
                </Button>
              </Form>
            </CSSTransition>
          </Card.Body>
        </Card>
      </div>)}
      <div className="row m-0 p-0">
        {Authenticated === AuthState.Authenticated && Organizations && (
          Organizations.map((org) => (
            <div key={org.id} className="col-md-4 mb-4">
              <Card >
                <Card.Body>
                  <Card.Title>{org.OrganizationName}</Card.Title>
                  <Card.Text>{org.Description}</Card.Text>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item">Member Since: {org.MemberSince}</li>
                    <li className="list-group-item">My Roles: {org.MyOrgRoles}</li>
                    <li className="list-group-item">Status: {org.Status}</li>
                  </ul>
                  <Card.Body>
                    <Link to={`/groups/${org.id}/dashboard`} className="btn btn-primary">
                      View Dashboard
                    </Link>
                  </Card.Body>
                </Card.Body>
              </Card>
            </div>
          ))
        )}
        
      </div>
    </div>

  </div>);
}