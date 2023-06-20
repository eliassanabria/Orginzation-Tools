import React, { useState, useEffect } from "react";
import { Table } from 'react-bootstrap';
import { useParams } from 'react-router-dom'
import ProposedMembersList from "./ProposedMembersList";

const RoleLists = (props) => {
    const { Authenticated } = props;
    const { groupID, roleID } = useParams();
    const [members, setMembers] = useState([]);
    const [proposedMembers, setProposedMembers] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [ViewMode, setViewMode] = useState('card');
    // Fetch data from API
    //CanViewRoleMemberDetails
    useEffect(() => {
        
        const fetchMembers = async () => {
            const response = await fetch(`/api/groups/${groupID}/settings/roles/lists/${roleID}/members`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setMembers(data);
        };

        const fetchProposedMembers = async () => {
            const response = await fetch(`/api/groups/${groupID}/settings/roles/lists/${roleID}/proposed_members`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setProposedMembers(data);
        };

        fetchProposedMembers();
        fetchMembers();


    }, [permissions, Authenticated]);
    useEffect(()=>{
        const fetchPermissions = async () => {
            console.log("Fetching permissions")
            const response = await fetch(`/api/groups/${groupID}/settings/permissions`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            console.log('Permissions',data);
            setPermissions(data);
        }
        fetchPermissions();

    },[])
    console.log(permissions)
    // Generate tables
    const generateTable = (data) => (
        
        <Table striped bordered hover>
            <thead>
                <tr>
                    <th>Member</th>
                    {permissions.CanViewRoleMemberDetails && <th>Date</th>}
                    {permissions.CanViewRoleMemberDetails && <th>Leader</th>}
                </tr>
            </thead>
            <tbody>
                {data.map((item, index) => (
                    <tr key={index}>
                        <td>{item.userRef.pref_name}</td>
                        {item.date && <td>{new Date(item.date._seconds * 1000).toLocaleDateString()}</td>}
                        {item.leader && <td>{item.leader.pref_name}</td>}
                        
                    </tr>
                ))}
            </tbody>
        </Table>
    );

    return (
        <div>
            <h2>Members</h2>
            {permissions && generateTable(members)}

            
            {permissions.CanViewProposedRoles && (<ProposedMembersList list={proposedMembers} mode={ViewMode} permissions={permissions}/>)}
        </div>
    );
};

export default RoleLists;