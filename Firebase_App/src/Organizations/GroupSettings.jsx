import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useParams, Link, NavLink } from 'react-router-dom'
import { AuthState } from "../authentication/login/AuthState";
import { Card, Container, Row, Col, Button } from 'react-bootstrap';
import Modal from "react-modal";
import "./GroupSettings.css";
import { Spinner } from "../addons_React/Spinners/Spinner";

import "react-tabs/style/react-tabs.css";
import { Directory } from "../directory/directory";
import RoleManagementScreen from "./SettingsTabs/Roles/RolesManagement";

const GroupSettings = (props) => {
    Modal.setAppElement("#root");

    const usersNeedingApprovalDummyData = [
        {
            uid: "user1",
            name: "John Doe",
            email: "john.doe@example.com",
            registrationDate: "2023-04-01",
        },
        {
            uid: "user2",
            name: "Jane Smith",
            email: "jane.smith@example.com",
            registrationDate: "2023-04-05",
        },
        {
            uid: "user3",
            name: "Bob Johnson",
            email: "bob.johnson@example.com",
            registrationDate: "2023-04-10",
        },
    ];

    const authenticated = props.Authenticated;
    const socket = props.socket;
    const [rolesTabLabel, setRolesTabLabel] = useState('Roles');

    const [CanViewApprovalsScreen, setApprovalScreen] = useState(false);
    const [CanRemoveUsers, setCanRemoveUsers] = useState(false);
    const { groupID } = useParams();
    const [groupData, setGroupData] = useState({});
    const [usersNeedingApproval, setUsersNeedingApproval] = useState([]);
    const [subGroups, setSubGroups] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState();
    const [surveys, setSurveys] = useState([]);
    const [requiresApproval, setRequiresApproval] = useState(false);
    const [surveyRequired, setSurveyRequired] = useState(false);
    const [approvalToggleDisabled, setApprovalToggleDisabled] = useState(true);
    const [surveyToggleDisabled, setSurveyToggleDisabled] = useState(true);
    const [displayLoader, setLoader] = useState(false);
    const [CanApproveJoinRequests, setApprovalRequets] = useState(false);
    const [CanViewSubgroups, setSubGroupVis] = useState(false);
    const [CanViewRoles, setRolesTabVis] = useState(false);
    const [CanViewSurveys, setSurveysVis] = useState(false);
    const [CanViewDirectory, setDirVis] = useState(false);
    useEffect(() => {
        if (authenticated === AuthState.Authenticated) {
            fetchData();
        }
        else if (authenticated !== AuthState.Unknown) {
            //alert(`Please sign in to view settings`);
            //window.location.href=`/home`
        }
    }, [authenticated, socket]);
    const handleUserCardClick = async (uid) => {
        console.log(`UID: ${uid}`)
        const selectedUser = usersNeedingApproval.find(user => user.uid === uid);
        setSelectedUser(selectedUser);
        const userVitalsDataURL = `/api/groups/${groupID}/settings/approvals/viewrequest/${uid}`;

        try {
            const userVitalsResponse = await fetch(userVitalsDataURL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const userVitalsData = await userVitalsResponse.json();
            setUserVitals(userVitalsData);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching user vitals data:", error);
        }
    };

    const updateRolesTabLabel = (groupType) => {
        if (groupType === 'Business') {
            setRolesTabLabel('Roles');
        } else if (groupType === 'Religious') {
            setRolesTabLabel('Callings');
        }
    };

    const handleApprove = (uid) => {
        //Send approval via socket:

        console.log(`Approving user with UID: ${uid}`);
        socket.sendApproval(groupID, uid)
        setUsersNeedingApproval(prevUsers => {
            return prevUsers.filter(user => user.uid !== uid);
        });
        setIsModalOpen(false);
    };
    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userVitals, setUserVitals] = useState(null);

    const fetchData = async () => {
        setLoader(true);
        // Replace the URLs with the actual API endpoints.
        const groupDataURL = `/api/groups/${groupID}/settings/general`;
        const usersNeedingApprovalURL = `/api/groups/${groupID}/settings/approvals/list`;
        const subGroupsURL = ``
        const rolesURL = "https://api.example.com/roles";
        const surveysURL = "https://api.example.com/surveys";

        try {
            const groupDataResponse = await fetch(groupDataURL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (groupDataResponse.status === 401) {
                const data = await groupDataResponse.json()
                alert(data.msg);
                window.location.href = '/home'
            }
            const groupData = await groupDataResponse.json();
            updateRolesTabLabel(groupData.group_type);

            // console.log(`Permissions:`+JSON.stringify(groupData.permissions))
            const permisisons = JSON.parse(JSON.stringify(groupData.UserPermissions));

            console.log(permisisons.CanViewApprovalsScreen);
            setApprovalScreen(permisisons.CanViewApprovalsScreen);
            setCanRemoveUsers(permisisons.CanRemoveUsers);
            setGroupData(groupData);
            // Set the initial values and the enabled/disabled state based on the API response
            setRequiresApproval(groupData.requiresApproval);
            setSurveyRequired(groupData.surveyRequired);
            setApprovalToggleDisabled(groupData.approvalToggle);
            setSurveyToggleDisabled(groupData.surveyToggle);
            setApprovalRequets(permisisons.CanApproveRequests);
            setDirVis(permisisons.CanViewDirectory);
            setRolesTabVis(permisisons.CanViewRoles);
            setSubGroupVis(permisisons.CanViewSubGroups);
            setSurveysVis(permisisons.CanViewSurveys);
            setPermissions(permisisons);
            const usersNeedingApprovalResponse = await fetch(usersNeedingApprovalURL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const usersNeedingApproval = await usersNeedingApprovalResponse.json();
            setUsersNeedingApproval(usersNeedingApproval.approvalListResult);



            const subGroupsResponse = await fetch(subGroupsURL);
            const subGroups = await subGroupsResponse.json();
            setSubGroups(subGroups);

            const rolesResponse = await fetch(rolesURL);
            const roles = await rolesResponse.json();
            setRoles(roles);

            const surveysResponse = await fetch(surveysURL);
            const surveys = await surveysResponse.json();
            setSurveys(surveys);

            setRequiresApproval(groupData.requiresApproval);
            setSurveyRequired(groupData.surveyRequired);

        } catch (error) {
            console.error("Error fetching data:", error);
            setLoader(false);
        }
        setLoader(false);
    };
    const handleApprovalToggle = () => {
        setRequiresApproval(!requiresApproval);
    };

    const handleSurveyRequiredToggle = () => {
        setSurveyRequired(!surveyRequired);
    };

    return (
        <div id="TabsListCustom">
            <Tabs>
                {displayLoader && <Spinner />}

                <TabList className='TabsListCustom'>
                    <Tab>Settings</Tab>
                    {CanViewApprovalsScreen && (<Tab>Approvals</Tab>)}
                    {CanViewSubgroups && (<Tab>Subgroups</Tab>)}
                    {CanViewRoles && (<Tab>{rolesTabLabel}</Tab>)}
                    {CanViewSurveys && (<Tab>Surveys</Tab>)}
                    {CanRemoveUsers && (<Tab>Manage Members</Tab>)}
                    {CanViewDirectory && (<Tab>
                        <Link className='blackLink' to={`/groups/${groupID}/directory`}>Directory</Link>
                    </Tab>)}
                    <Tab><b style={{ display: "inline-block", marginRight: "10px", marginLeft: '10px' }}>
                        <NavLink className='nav-link' to={`/groups/${groupID}/dashboard`}>
                            <i className="fas fa-chart-bar fa-lg" style={{ color: '#0a2a52' }}></i> Dashboard
                        </NavLink>
                    </b></Tab>
                </TabList>

                <TabPanel>
                    <h2>Group Settings</h2>
                    <p>Group Name: {groupData.group_name}</p>
                    <p>Group Join Code: {groupData.group_join_code}</p>
                    <p>Group Creation Date: {groupData.group_creation_date}</p>
                    <p>Group Leader:</p>
                    <div className="customCard" >
                        <Card.Img variant="top" src={groupData.group_owner_profile_imageURL} className="rounded-circle mx-auto d-block" style={{ width: '150px', height: '150px' }} />
                        <Card.Body>
                            <Card.Title>{groupData.group_owner_pref_name}</Card.Title>
                            <a href={`mailto:${groupData.group_owner_email}`} className="btn btn-primary">Email</a>
                        </Card.Body>
                    </div>
                    <p>Group Type: {groupData.group_type}</p>
                    <p>
                        Requires Approval:
                        <input
                            type="checkbox"
                            checked={requiresApproval}
                            onChange={handleApprovalToggle}
                            disabled={approvalToggleDisabled}
                        />
                    </p>
                    <p>
                        Survey Required:
                        <input
                            type="checkbox"
                            checked={surveyRequired}
                            onChange={handleSurveyRequiredToggle}
                            disabled={surveyToggleDisabled}
                        />
                    </p>
                    {/* Implement the dropdown for survey selection here */}
                </TabPanel>

                {CanViewApprovalsScreen && (
                    <TabPanel>
                        <Modal
                            isOpen={isModalOpen}
                            onRequestClose={handleModalClose}
                            contentLabel="User Vitals Data">
                            {selectedUser && (
                                <>
                                    <h2>{selectedUser.name} wants to join</h2>
                                    {userVitals ? (
                                        <ul>
                                            {Object.entries(userVitals).map(([key, value]) => (
                                                <li key={key}>{`${key}: ${value}`}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Loading user vitals data...</p>
                                    )}

                                    <Button variant="success" disabled={!CanApproveJoinRequests} onClick={() => handleApprove(selectedUser.uid)}>Approve</Button>
                                    <Button variant="danger" onClick={handleModalClose}>Close</Button>
                                </>
                            )}
                        </Modal>

                        <h3>Users Needing Approval</h3>

                        <div className="grid-container">

                            {usersNeedingApproval.length > 0 ? (
                                usersNeedingApproval.map(user => (

                                    <div key={user.uid} className="customCard">
                                        <Card.Body>
                                            <Card.Title>{user.name}</Card.Title>
                                            <Card.Img variant="top" src={user.profile_image_url} className="rounded-circle mx-auto d-block" style={{ width: '150px', height: '150px' }} />
                                            <Button
                                                variant="primary"
                                                onClick={() => handleUserCardClick(user.uid)}
                                            >
                                                View Details
                                            </Button>
                                        </Card.Body>
                                    </div>
                                ))
                            ) : (
                                <p>No users needing approval</p>
                            )}
                        </div>



                    </TabPanel>)
                }

                {
                    CanViewSubgroups && (<TabPanel>
                        <h2>Subgroups</h2>
                        <ul>
                            {subGroups.map(subGroup => (
                                <li key={subGroup.id}>{subGroup.name}</li>
                            ))}
                        </ul>
                    </TabPanel>)
                }

                {
                    CanViewRoles && (<TabPanel>
                        <h2>{rolesTabLabel}:</h2>
                        <RoleManagementScreen Authenticated={authenticated} roleLabel={rolesTabLabel} CanViewRoles={CanViewRoles} CanEditRoles={permissions.CanEditRoles} CanCreateRoles={permissions.CanCreateRoles} CanDeleteRoles={permissions.CanDeleteRoles} groupID={groupID}/>
                    </TabPanel>)
                }

                {
                    CanViewSurveys && (<TabPanel>
                        <h2>Surveys</h2>
                        <ul>
                            {surveys.map(survey => (
                                <li key={survey.id}>{survey.title}</li>
                            ))}
                        </ul>
                    </TabPanel>)
                }
                {CanRemoveUsers && (<TabPanel>
                    <h2>Manage Users:</h2>

                </TabPanel>)}
                {
                    CanViewDirectory && (<TabPanel>
                        <Directory />
                    </TabPanel>)
                }
            </Tabs >
        </div >
    );
};

export default GroupSettings;
