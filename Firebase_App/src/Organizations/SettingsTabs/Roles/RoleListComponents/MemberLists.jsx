import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom'
import ProposedMembersList from "./ProposedMembersList";
import ExistingMembersList from "./ExistingMembersList";
import { Button } from "react-bootstrap";
import axios from "axios";
import './Lists_Styles.css'
import { AuthState } from "../../../../authentication/login/AuthState";
const RoleLists = (props) => {

    const { Authenticated } = props;
    const { groupID, roleID } = useParams();
    const [members, setMembers] = useState([]);
    const [proposedMembers, setProposedMembers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [roleDetails, setRoleDetails] = useState({});
    const [combinedMemberIDs, setCombinedIDs] = useState([])
    const [ViewMode, setViewMode] = useState('table'); // Set the initial value to 'table'

    // Fetch data from API
    // CanViewRoleMemberDetails
    useEffect(() => {
        const fetchMembers = async () => {
            const response = await fetch(`/api/groups/${groupID}/settings/roles/lists/${roleID}/Members`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            } else {
                setMembers([]);
                console.info('No members Found')
            }

        };

        const fetchProposedMembers = async () => {
            const response = await fetch(`/api/groups/${groupID}/settings/roles/lists/${roleID}/ProposedMembers`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Proposed:", data)
                setProposedMembers(data);
            }
            else {
                setProposedMembers([]);
                console.info('No proposed members Found')
            }

        };
        if(permissions.length !== 0){
            fetchProposedMembers().catch((error)=>{
            console.warn('No Proposed Users found')
        });
        fetchMembers().catch((error)=>{
            console.warn('No Users found')

        });
        }
        
    }, [permissions, Authenticated]);

    useEffect(() => {
        const fetchPermissions = async () => {
            if (Authenticated === AuthState.Authenticated) {
                //Fetch permissions:
                await axios.get(`/api/groups/${groupID}/settings/permissions`)
                .then((result)=>{
                    if(result.status === 200){
                        setPermissions(result.data);
                        console.log(permissions);
                    }
                })
            }
        }
        fetchPermissions();
    }, [Authenticated]);

    console.log("Permissions", permissions);

    useEffect(() => {
        const fetchGroupDetails = async () => {
            console.log("Fetching permissions");
            const response = await fetch(`/api/groups/${groupID}/settings/roles/${roleID}/details`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            console.log('Details', data);
            setRoleDetails(data);
        };
        
        if(permissions.length !== 0){
            fetchGroupDetails();
        }
        
    }, [Authenticated]);
    useEffect(() => {
        if (permissions.CanViewProposedRoles) {
            if (members && proposedMembers) {
                //there is a list of both members
                //make a list of IDs from both lists, the id is located in each object in the array.userRef.id
                const memberIds = members.map(member => member.userRef.id);
                const proposedMemberIds = proposedMembers.map(proposedMember => proposedMember.userRef.id);
                const combinedIds = [...memberIds, ...proposedMemberIds];
                console.log(combinedIds);  // Log the combined list of IDs
                setCombinedIDs(combinedIds)
            }
        }
    }, [members, proposedMembers, permissions])


    const handleToggleChange = () => {
        if (ViewMode === 'table') {
            setViewMode('card');
        } else {
            setViewMode('table');
        }
    };
    return (
        <div>
            <div>
                <div style={{display:'flex'}}>
                <Button style={{display:'flex'}} className="btn btn-secondary" onClick={()=>{window.history.back()}}>Settings</Button>

                 <h2>{roleDetails.role_title}</h2>

                </div>
                <div className="toggle-container">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="flexSwitchCheckDefault"
                            onChange={handleToggleChange} // Call handleToggleChange when the switch value changes
                            checked={ViewMode === 'card'} // Set the switch checked state based on ViewMode
                        />
                        <label className="form-check-label" htmlFor="flexSwitchCheckDefault">
                            Table / Grid View
                        </label>
                    </div>
                </div>


            </div>
            {permissions.CanViewRoles && (
                <ExistingMembersList list={members} mode={ViewMode} groupID={groupID} roleID={roleID} permissions={permissions} />
            )}

            <br />

            {permissions.CanViewProposedRoles && (
                <ProposedMembersList list={proposedMembers} mode={ViewMode} permissions={permissions} groupID={groupID} roleID={roleID} existingMemberList={combinedMemberIDs} />
            )}
        </div>
    );
};

export default RoleLists;
