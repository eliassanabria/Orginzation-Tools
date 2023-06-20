import { Card, Button } from 'react-bootstrap';
import Modal from "react-modal";
import { Spinner } from '../../../addons_React/Spinners/Spinner';
import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom'


const ApprovalsTab = (props) => {
    Modal.setAppElement("#root");
    const socket = props.socket;
    const CanApproveJoinRequests = props.approver;
    const { groupID } = useParams();
    const [displayLoader, setLoader] = useState(false);
    const [ApprovalImagePreview, setApprovalImagePreview] = useState('https://cdn-icons-png.flaticon.com/512/456/456212.png')
    const [usersNeedingApproval, setUsersNeedingApproval] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userVitals, setUserVitals] = useState(null);
    const usersNeedingApprovalURL = `/api/groups/${groupID}/settings/approvals/list`;
    useEffect(() => { fetchData(); setLoader(true) },[])
    const fetchData = async () => {
        try {
            const usersNeedingApprovalResponse = await fetch(usersNeedingApprovalURL, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const usersNeedingApproval = await usersNeedingApprovalResponse.json();
            setUsersNeedingApproval(usersNeedingApproval.approvalListResult);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoader(false);
        }
        setLoader(false);
    }
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
            setApprovalImagePreview(userVitals.profile_image_url);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching user vitals data:", error);
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

    return (<div>
        

        <Modal
            isOpen={isModalOpen}
            onRequestClose={handleModalClose}
            contentLabel="User Vitals Data"
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    maxHeight: '70%', // 70% of viewport height
                },
            }}
        >
            {selectedUser && (
                <>
                    <img src={ApprovalImagePreview} className="rounded-circle mx-auto d-block" style={{ width: '120px', height: '120px' }}></img>
                    <h2>{selectedUser.name} wants to join</h2>
                    {userVitals ? (
                        <ul>
                            {Object.entries(userVitals.details).map(([key, value]) => (
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
        {displayLoader && <Spinner message={'Loading Approvals List'}/>}
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
    </div>)
}

export default ApprovalsTab;