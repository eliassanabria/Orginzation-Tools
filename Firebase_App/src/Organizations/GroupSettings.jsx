import React, { useState, useEffect } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useParams, Link, NavLink } from 'react-router-dom'
import { AuthState } from "../authentication/login/AuthState";
import { Card } from 'react-bootstrap';
import "./GroupSettings.css";
import { Spinner } from "../addons_React/Spinners/Spinner";

import "react-tabs/style/react-tabs.css";
import { Directory } from "../directory/directory";
import RoleManagementScreen from "./SettingsTabs/Roles/RolesManagement";
import ApprovalsTab from "./SettingsTabs/ApprovalsScreen/ApprovalsTab";
import SubGroupManagementScreen from "./SettingsTabs/Subgroups/SubGroupManagement";

const GroupSettings = (props) => {
    const authenticated = props.Authenticated;
    const socket = props.socket;
    const [rolesTabLabel, setRolesTabLabel] = useState('Roles');
    const [CanViewApprovalsScreen, setApprovalScreen] = useState(false);
    const [CanRemoveUsers, setCanRemoveUsers] = useState(false);
    const { groupID } = useParams();
    const [groupData, setGroupData] = useState({});
    const [subGroups, setSubGroups] = useState([]);
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


    const updateRolesTabLabel = (groupType) => {
        if (groupType === 'Business') {
            setRolesTabLabel('Role');
        } else if (groupType === 'Religious') {
            setRolesTabLabel('Calling');
        }
    };

    const fetchData = async () => {
        setLoader(true);
        // Replace the URLs with the actual API endpoints.
        const groupDataURL = `/api/groups/${groupID}/settings/general`;
        const subGroupsURL = ``
        const surveysURL = "https://api.example.com/surveys";

        try {
            const groupDataResponse = await fetch(groupDataURL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!groupDataResponse.ok) {
                const data = await groupDataResponse.json()
                alert(data.msg);
                window.location.href = '/groups'
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

            const subGroupsResponse = await fetch(subGroupsURL);
            const subGroups = await subGroupsResponse.json();
            setSubGroups(subGroups);

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
                    {CanViewSubgroups && (<Tab><Link className='blackLink' to={`/groups/${groupID}/settings/subgroups/manage`}>Subgroup Management</Link></Tab>)}
                    {CanViewRoles && (<Tab>{rolesTabLabel}s</Tab>)}
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
                        <ApprovalsTab socket={socket} approver={CanApproveJoinRequests} />
                    </TabPanel>)
                }

                {
                    CanViewSubgroups && (<TabPanel>
                        <></>
                    </TabPanel>)
                }

                {
                    CanViewRoles && (<TabPanel>
                        <h2>{rolesTabLabel}s:</h2>
                        <RoleManagementScreen Authenticated={authenticated} roleLabel={rolesTabLabel} CanViewRoles={CanViewRoles} CanEditRoles={permissions.CanEditRoles} CanCreateRoles={permissions.CanCreateRoles} CanDeleteRoles={permissions.CanDeleteRoles} groupID={groupID} />
                    </TabPanel>)
                }

                {
                    CanViewSurveys && (<TabPanel>
                        <h2>Surveys</h2>
                        <div className="alert alert-danger" role='alert'>This feature is is the works.</div>
                        <ul>
                            {surveys.map(survey => (
                                <li key={survey.id}>{survey.title}</li>
                            ))}
                        </ul>
                    </TabPanel>)
                }
                {CanRemoveUsers && (<TabPanel>
                    <h2>Manage Users:</h2>
                    <div className="alert alert-danger" role='alert'>This feature is is the works.</div>
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
