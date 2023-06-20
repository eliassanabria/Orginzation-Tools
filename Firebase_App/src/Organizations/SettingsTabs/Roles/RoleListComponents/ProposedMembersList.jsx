import React, { useState, useEffect } from "react";
import { Card, Button, Table } from 'react-bootstrap';
import { FiPhone } from 'react-icons/fi';
import { RiDeleteBinLine, RiCheckLine } from 'react-icons/ri';


const ProposedMembersList = (props) => {
    const { mode, list, permissions} = props;
    const [renderedElements, setRenderedElements] = useState([]);

    useEffect(() => {
        if(list){
            if (mode === 'card') {
            setRenderedElements(GenerateCardMode());
        } else {
            setRenderedElements(GenerateListMode());
        }
        }
        
    }, [mode, list]);

    const handleApprove = (member) => {
        console.log(`Approving proposal for ${member.userRef.pref_name}`);
        // Your logic for approving a proposal
    }

    const handleDelete = (member) => {
        console.log(`Deleting proposal for ${member.userRef.pref_name}`);
        // Your logic for deleting a member
    }

    const handleCall = (phone) => {
        window.open(`tel:${phone}`);
    }

    const GenerateCardMode = () => {
        return (list.map((item, index) => (
            <Card key={index} style={{ width: '12rem' }}>
                <Card.Body>
                <Card.Img variant="top" src={item.userRef.profile_image_url} className="rounded-circle mx-auto d-block" style={{ width: '120px', height: '120px' }} />
                    <Card.Title >{item.userRef.pref_name}</Card.Title>
                    <Card.Text>
                        {item.leader && <>Proposed By:</>}<br /> {item.leader && item.leader.pref_name}<br />
                        {item.date && <>Proposed on:</>} {item.date && new Date(item.date._seconds * 1000).toLocaleDateString()}
                    </Card.Text>
                    {permissions.CanApproveRoleProposals && <Button variant="primary" onClick={() => handleApprove(item)} style={{marginRight:'10px'}}><RiCheckLine /></Button>}
                    {permissions.CanApproveRoleProposals && <Button variant="danger" onClick={() => handleDelete(item)} style={{marginRight:'10px'}}><RiDeleteBinLine /></Button>}
                    {item.userRef.phone && <Button variant="success" onClick={() => handleCall(item.userRef.phone)}><FiPhone /></Button>}
                </Card.Body>
            </Card>
        )));
    }

    const GenerateListMode = () => {
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
                            <td style={{display:'block', position:'relative'}}>{(item.userRef.pref_name)}</td>
                            <td>
                            {permissions.CanApproveRoleProposals && <Button variant="primary" onClick={() => handleApprove(item)} style={{marginRight:'10px'}}><RiCheckLine /></Button>}
                    {permissions.CanApproveRoleProposals && <Button variant="danger" onClick={() => handleDelete(item)} style={{marginRight:'10px'}}><RiDeleteBinLine /></Button>}
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

            {renderedElements}
        </div>
    );
}

export default ProposedMembersList;
