import React, { useState, useEffect } from "react";
import { Card, Button, Table } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { RiDeleteBinLine, RiCheckLine } from 'react-icons/ri';
import './Lists_Styles.css'
import ProposeSearchBar from "./RoleProposeSearchUser";
import Popup from "../../../../addons_React/Popups/popup";
import axios from "axios";

const ProposedMembersList = (props) => {
    const { mode, list, permissions, roleID, groupID, existingMemberList } = props;
    const [renderedElements, setRenderedElements] = useState([]);
    const [displayProposeSearch, setProposeSearch] = useState(false);
    const [displayNoMembersMessage, displayMessage] = useState(false);

    useEffect(() => {
        console.log("List is: ", list);
        if (list) {
            displayMessage(false);
            if (mode === 'card') {
                setRenderedElements(GenerateCardMode());
            } else {
                setRenderedElements(GenerateListMode());
            }
        } else {
            displayMessage(true);
        }

    }, [mode, list]);

    const handleApprove = async (member) => {
        console.log(`Approving proposal for ${member.userRef.pref_name}`);
        const token = localStorage.getItem('token');
        await axios.put(`/api/groups/${groupID}/settings/roles/update/${roleID}/approve/${member.userRef.id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            if (response.status === 200) {
                alert('Approval successful, role given to user.');
                window.location.reload();
            } else {
                alert('Failed to remove user from list.');
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const handleDelete = async (member) => {
        console.log(`Deleting proposal for ${member.userRef.pref_name}`);
        const token = localStorage.getItem('token');
        await axios.put(`/api/groups/${groupID}/settings/roles/update/${roleID}/void_proposal/${member.userRef.id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((response) => {
            if (response.status === 200) {
                alert('Successfully removed user from proposed list.');
                window.location.reload();
            } else {
                alert('Failed to remove user from list.');
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    const handleCall = (phone) => {
        window.open(`tel:${phone}`);
    }

    const handlePropose = () => {
        setProposeSearch(true);
    }
    const handleClosePropose = () => {
        setProposeSearch(false);
    }

    const GenerateCardMode = () => {
        if (list.length === 0) {
            return (<Card style={{ width: '12rem' }}>
                <Card.Body>
                    <Card.Img variant="top" src={`/Sillouet_Icon.png`} className="rounded-circle mx-auto d-block" style={{ width: '120px', height: '120px' }} />

                    <Card.Title >No users proposed for role</Card.Title>
                    <Card.Text>
                        {/* {item.leader && <>Proposed By:</>}<br /> {item.leader && item.leader.pref_name}<br />
                        {item.date && <>Proposed on:</>} {item.date && new Date(item.date._seconds * 1000).toLocaleDateString()} */}
                    </Card.Text>
                    {permissions.CanApproveRoleProposals && <Button variant="primary" disabled style={{ marginRight: '10px' }}><RiCheckLine /></Button>}
                    {permissions.CanApproveRoleProposals && <Button variant="danger" disabled style={{ marginRight: '10px' }}><RiDeleteBinLine /></Button>}
                    {<Button variant="success" disabled ><FiPhone /></Button>}
                </Card.Body>
            </Card>)
        }
        return (
            <div className="d-flex flex-wrap">
                {list.map((item, index) => (
                    <Card key={index} style={{ width: '12rem', margin: '10px' }}>
                        <Card.Body>
                            <Card.Img variant="top" src={item.userRef.profile_image_url} className="rounded-circle mx-auto d-block" style={{ width: '120px', height: '120px' }} />
                            <Card.Title >{item.userRef.pref_name}</Card.Title>
                            <Card.Text>
                                {item.leader && <>Proposed By:</>}<br /> {item.leader && item.leader.pref_name}<br />
                                {item.date && <>Proposed on:</>} {item.date && new Date(item.date._seconds * 1000).toLocaleDateString()}
                            </Card.Text>
                            {permissions.CanApproveRoleProposals && item.leader.id !== window.localStorage.getItem('id') && <Button variant="primary" disabled={item.leader.id === window.localStorage.getItem('id')} onClick={() => handleApprove(item)} style={{ marginRight: '10px' }}><RiCheckLine /></Button>}
                            {permissions.CanApproveRoleProposals && <Button variant="danger" onClick={() => handleDelete(item)} style={{ marginRight: '10px' }}><RiDeleteBinLine /></Button>}
                            {item.userRef.phone && <Button variant="success" onClick={() => handleCall(item.userRef.phone)}><FiPhone /></Button>}
                        </Card.Body>
                    </Card>
                ))}
            </div>
        );
    }

    const GenerateListMode = () => {
        if (list.length === 0) {
            return (
                <Table responsive striped bordered hover>
                    <thead>
                        <tr>
                            {permissions.CanViewRoleMemberDetails && (<th>Approved on:</th>)}
                            {permissions.CanViewRoleMemberDetails && (<th>Approved By:</th>)}
                            <th>Member</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr key={'0'}>
                            {permissions.CanViewRoleMemberDetails && <td></td>}
                            {permissions.CanViewRoleMemberDetails && <td></td>}
                            <td style={{ display: 'block', position: 'relative' }}>{'No users proposed for role'}</td>
                            <td></td>
                            {/* <td>
                                {permissions.CanRemoveUserRoles && <Button variant="danger" onClick={() => handleDelete(item)} style={{ marginRight: '10px' }}><RiDeleteBinLine /></Button>}
                                {item.userRef.phone && <Button variant="success" onClick={() => handleCall(item.userRef.phone)}><FiPhone /></Button>}
                            </td> */}
                        </tr>

                    </tbody>
                </Table>
            )
        }
        return (<div>
            <Table responsive striped bordered hover>
                <thead>
                    <tr>
                        {permissions.CanViewRoleMemberDetails && (<th>Proposed on:</th>)}
                        {permissions.CanViewRoleMemberDetails && (<th>Proposed By:</th>)}
                        <th>Member</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.map((item, index) => (
                        <tr key={index}>
                            {permissions.CanViewRoleMemberDetails && <td>{item.date && new Date(item.date._seconds * 1000).toLocaleDateString()}</td>}
                            {permissions.CanViewRoleMemberDetails && <td>{item.leader && item.leader.pref_name}</td>}
                            <td style={{ display: 'block', position: 'relative' }}>{(item.userRef.pref_name)}</td>
                            <td>
                                {permissions.CanApproveRoleProposals && (item.leader.id !== window.localStorage.getItem('id')) && <Button variant="primary" disabled={item.leader.id === window.localStorage.getItem('id')} onClick={() => handleApprove(item)} style={{ marginRight: '10px' }}><RiCheckLine /></Button>}
                                {permissions.CanApproveRoleProposals && <Button variant="danger" onClick={() => handleDelete(item)} style={{ marginRight: '10px' }}><RiDeleteBinLine /></Button>}
                                {item.userRef.phone && <Button variant="success" onClick={() => handleCall(item.userRef.phone)}><FiPhone /></Button>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
        );
    }

    return (
        <div>
            <h2>Proposed Members</h2>
            <div className="toggle-container">
                <Button variant="success" disabled={!permissions.CanProposeRoles} onClick={handlePropose}>Propose Member</Button>
            </div>
            <br />
            {!displayNoMembersMessage && (
                <div className="List-Container">
                    {renderedElements}
                </div>)}

            {displayProposeSearch && <Popup component={<ProposeSearchBar groupID={groupID} roleID={roleID} existingMemberList={existingMemberList} closeBtn={handleClosePropose} />} />}
        </div>
    );
}

export default ProposedMembersList;
