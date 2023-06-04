import React, { useEffect, useState, useContext, useMemo } from 'react';
import { useParams, NavLink } from 'react-router-dom'
import { Megaphone } from 'react-bootstrap-icons';

import { Container, Row, Col, Card, ButtonGroup, Button } from 'react-bootstrap';
import './Dashboard.css'
import OrganizationAnnouncements from './OrganizationAnnouncements';
import Feed from './Feed';
import UpcomingEvents from './UpcomingEvents';
import MyAppointments from './MyAppointments';
import MyAssignments from './MyAssignments';
import { AuthState } from '../../authentication/login/AuthState';
import Popup from '../../addons_React/Popups/popup';
import BroadcastMessage from '../BroadcastMessages';
import { Spinner } from '../../addons_React/Spinners/Spinner';
const GroupDashboard = (props) => {
  const [profile_image_url, setProfileURL] = useState(localStorage.getItem('profile_image_url') || 'https://cdn-icons-png.flaticon.com/512/456/456212.png');
  const authState = props.Authenticated;
  const socket = props.socket;
  const [displayBroadcastPopup, setBroadcastPopup] = useState(false);
  const { groupID } = useParams();
  const [OrgName, setOrgName] = useState('Group Name');
  const [OrgSubStatus, setSubStatus] = useState('Trial');
  const [permissions, setPermissions] = useState({});
  const [CanSendPushToOrganizations, setPushPermission] = useState(false);
  const [perf_name, setPrefName] = useState('User Name');
  const [roles, setUserRolesDisp] = useState('User Roles');
  const [displayLoader, setLoader] = useState(false);
  const [ApprovalStatus, setApprovalStatus] = useState(false);
  const [Message, setMessage] = useState('Loading...');
  const [Action, setAction] = useState(null);
  //Get the user's enrollment, info, and permissions list for the dashboard to render properly based on roles.
  //Get enrollment status to then prevent other components from loading until the user is fully enrolled.
  //If the user is not approved yet, disable all buttons except leave group, re-label button to cancel join request, and hide the other buttons in the group.
  useEffect(() => {
    if (authState === AuthState.Authenticated) {
      //Get Group details:
      fetch(`/api/groups/${groupID}/details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Do something with the data
          console.log(data);
          setOrgName(data.OrgName);
          setSubStatus(data.OrgSubStatus);
        })
        .catch(error => {
          // Handle any errors that occurred during the request
          console.error('There was a problem with the fetch operation:', error);
        });


    }
  }, [authState]);
  useEffect(() => {
    if (authState === AuthState.Authenticated) {
      //Get user permissions for this group
      fetch(`/api/groups/${groupID}/permissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Do something with the data
          //console.log(data);
          //setPermissions(data);
          setPushPermission(data.permissions.CanSendPushToOrganizations);
          console.log(CanSendPushToOrganizations);
        })
        .catch(error => {
          // Handle any errors that occurred during the request
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  }, [authState]);

  useEffect(() => {
    if (authState === AuthState.Authenticated) {
      //Get user enrollment for this group
      fetch(`/api/groups/${groupID}/enrollment`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(response => {
          if (response.status === 202) {
            response.json().then((responseBody) => {
              const message = responseBody.msg;
              console.warn(message);
              setMessage(message);
              setLoader(true);
              setApprovalStatus(false);
              function BackBtn() {
                return (
                  <button type="button" class="btn btn-secondary" onClick={() => window.location.href = `/groups`}>Back to Groups</button>
                )
              };
              setAction(BackBtn);
            })
          }
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Do something with the data
          console.log(data);
          setPrefName(data.pref_name);
          setUserRolesDisp(data.roles);
        })
        .catch(error => {
          // Handle any errors that occurred during the request
          console.error('There was a problem with the fetch operation:', error);
        });
    }
  }, [authState, ApprovalStatus]);

  React.useEffect(() => {
    socket.addHandler(handleApproval);
    return () => {
      socket.removeHandler(handleApproval);
    }
  });
  function handleApproval(event) {
    if (event.success === true) {
      setMessage('Approval Recieved!');
      setApprovalStatus(true);
      setAction(null);
      //alert('Approval Recieved!');
      setLoader(false);

    }
  }
  const toggleBroadcasts = () => {
    setBroadcastPopup(true)
  }
  const closeBroadcasts = () => {
    setBroadcastPopup(false);
  }
  if (authState !== AuthState.Authenticated) {
    return (<div>Please log in to continue<br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br></div>)
  }
  return (
    <Container fluid>
      {displayLoader && <Spinner action={Action} message={Message} />}

      {displayBroadcastPopup && (<Popup component={<BroadcastMessage authState={authState} close={closeBroadcasts} socket={socket} groupID={groupID} />} />)}
      <Row className="mb-4">
        <Col>
          <h2 className="text-center">{OrgName}</h2>
          <p className='text-center'> <small>({OrgSubStatus})</small></p>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6} lg={8} className="text-left mb-3 mb-md-0">
          <p>
            <img src={profile_image_url} alt="Profile Picture" className="profile-picture-dash" id='profileImage' />
            <strong>{perf_name}</strong>
            <br />
            <em>{roles}</em>
          </p>
        </Col>
        <Col md={6} lg={4} className="text-right">
          <ButtonGroup className="button-group">
            <NavLink className='nav-link' to={`/groups/${groupID}/directory`}>
              <Button variant='primary' className='rounded-btn' style={{ marginRight: '20px' }}>
                Directory <i className="fa fa-address-book-o" style={{ fontSize: "22px" }}></i>
              </Button>
            </NavLink>
            <NavLink className='nav-link' to={`/groups/${groupID}/settings`}>
              <Button variant="secondary" className='rounded-btn' style={{ marginRight: '20px' }}>
                <i className="fas fa-cog fa-lg" style={{ color: 'white' }}></i>
              </Button>
            </NavLink>
            <NavLink className='nav-link'>
              {CanSendPushToOrganizations && (
                <Button variant="info" onClick={toggleBroadcasts} className='rounded-btn' style={{ marginRight: '20px' }}>
                  <Megaphone />
                </Button>
              )}
            </NavLink>
            <NavLink className='nav-link'>
              <Button variant="danger" disabled className='rounded-btn'>Leave Group</Button>
            </NavLink>

          </ButtonGroup>
        </Col>
      </Row>
      <Row>

        <Col xs={12} md={6} lg={4}>

          <Card className="mb-4">
            <Card.Header>Organization Announcements</Card.Header>
            <Card.Body>
              <OrganizationAnnouncements groupID={groupID} />
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Header>My Assignments</Card.Header>
            <Card.Body>
              <MyAssignments />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} lg={4}>
          <Card className="mb-4">
            <Card.Header>Feed</Card.Header>
            <Card.Body>
              <Feed />
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} md={{ order: 'first' }} lg={4}>
          <Card className="mb-4">
            <Card.Header>Upcoming Events</Card.Header>
            <Card.Body>
              <UpcomingEvents />
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Header>My Appointments</Card.Header>
            <Card.Body>
              <MyAppointments />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default GroupDashboard;
