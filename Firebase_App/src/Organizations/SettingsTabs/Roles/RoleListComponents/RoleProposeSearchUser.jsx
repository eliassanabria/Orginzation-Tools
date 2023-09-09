import React, { useEffect, useState } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { Button, Card, FormControl, InputGroup, Table } from 'react-bootstrap';
import { Spinner } from 'react-bootstrap';

const ProposeSearchBar = (props) => {
    const { groupID, roleID, existingMemberList, closeBtn } = props;
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [displaySpinner, setSpinnerDisp] = useState(false);
    const [isProposing, setIsProposing] = useState(false);

    useEffect(() => {
        try {
            fetchUsers();

        } catch (error) {
            console.error('Failed to get directory');
            setSpinnerDisp(false)
        }
    }, []);

    const fetchUsers = async () => {
        setSpinnerDisp(true);
        const result = await axios.get(`/api/groups/${groupID}/directory`);
        if(!result.ok){
            console.error('Failed to fetch directory');
            setSpinnerDisp(false);
        }
        console.log("users:", result.data.data);
        const filteredUsers = result.data.data.filter(user => !existingMemberList.includes(user.id));
        console.log("Filtered: ", filteredUsers);
        setUsers(filteredUsers);
        setSpinnerDisp(false);
    }

    const handleSearch = (e) => {
        setSearch(e.target.value);
    }

    const handleSelect = (user) => {
        setSelectedUser(user);
    }
    const backToList = () => {
        setSelectedUser(null);
    }

    const handlePropose = async () => {
        setIsProposing(true);
        await axios.put(`/api/groups/${groupID}/settings/roles/update/${roleID}/propose/${selectedUser.id}`).then((response) => {
            setIsProposing(false);
            if (response.status === 200) {
                alert('Successfully proposed user to role.');
                window.location.reload();
            } else {
                alert('Failed to propose');
            }
        }).catch((error) => {
            setIsProposing(false);
            console.log(error);
        });
    }


    const filteredUsers = !search ? users : users.filter(user =>
    (user.first_name.toLowerCase().includes(search.toLowerCase()) ||
        user.last_name.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div>
            <InputGroup className="mb-3">
                <FormControl
                    placeholder="Search by name"
                    aria-label="Search by name"
                    aria-describedby="basic-addon2"
                    onChange={handleSearch}
                />
            </InputGroup>

            {!selectedUser && <div style={{ overflowX: 'auto', maxHeight: '400px' }}>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th></th>
                            <th>First Name</th>
                            <th>Last Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displaySpinner && (
                            <><tr><td><Spinner /></td><td>Loading</td><td>Directory</td></tr></>
                        )}


                        {filteredUsers.map(user => (
                            <tr key={user.id} onClick={() => handleSelect(user)}>
                                <td><img src={user.profile_image_url} alt={user.firstName} style={{ width: "40px", height: "40px" }} /></td>
                                <td>{user.first_name}</td>
                                <td>{user.last_name}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>}
            <br />
            {selectedUser && (
                <Card style={{ width: '18rem' }}>
                    <Card.Body>
                        <Card.Img src={selectedUser.profile_image_url} style={{ height: '150px', width: '150px' }} />
                        <Card.Title>{selectedUser.first_name} {selectedUser.last_name}</Card.Title>
                        <Card.Subtitle>{selectedUser.roles}</Card.Subtitle>
                        <br />
                        <Button variant="success" onClick={handlePropose} disabled={isProposing}>
                            {isProposing ? (<Spinner animation="border" size="sm" />) : null} Propose
                        </Button>
                        <Button variant='secondary' onClick={backToList} style={{ alignItems: 'center', marginLeft: '40px' }} >View List</Button>
                    </Card.Body>
                </Card>
            )}
            <br />
            <Button variant='secondary' onClick={closeBtn}>Close</Button>
        </div>
    );
}

export default ProposeSearchBar;
