import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Button, Card, ButtonGroup } from "react-bootstrap";
import { Map } from "immutable";
import { Spinner } from "../../../addons_React/Spinners/Spinner";
import { useNavigate } from 'react-router-dom';
import Popup from "../../../addons_React/Popups/popup";
import RoleForm from "./RoleCreationModal";


const RoleManagementScreen = (props) => {
    const navigate = useNavigate();
    const {roleLabel, CanViewRoles, CanEditRoles, CanCreateRoles, CanDeleteRoles, groupID } = props;
    const [OrgRoles, setOrgRoles] = useState([]);
    const [isModalOpen, setModalOpen] = useState(false);
    const [roleDetails, setRoleDetails] = useState({ role_title: '', role_permissions: Map() });
    const [roleID, setRoleID] = useState(null);
    const [showSaveButton, setShowSaveButton] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [displayCreatePopup, setPopupCreate] = useState(false);

    const itemsPerPage = 10;
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    }
    const handleCloseCreate =(newGroupID)=>{
        if(newGroupID){
            //Call the modal preferences to setup the role permissions.
        }
        setPopupCreate(false);
    }
    useEffect(() => {
        async function fetchAllRolesOrg() {
            const response = await fetch(`/api/groups/${groupID}/settings/roles/all`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const roleData = await response.json();
            setOrgRoles(roleData.data);
        }
        fetchAllRolesOrg();
    }, []);

    const handleDetailsBtnClick = async (id) => {
        setRoleID(id);
        const response = await fetch(`/api/groups/${groupID}/settings/roles/${id}/details`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const detailsData = await response.json();
        setRoleDetails(detailsData);
        setModalOpen(true);
        setCurrentPage(1);
    }

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentPage(1);
        setShowSaveButton(false);
    }

    const handleSaveChanges = async () => {
        await fetch(`/api/groups/${groupID}/settings/roles/update/${roleID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(roleDetails)
        });
        setShowSaveButton(false);
    }

    const handleSwitchChange = (key, event) => {
        setRoleDetails(prevState => ({
            ...prevState,
            role_permissions: {
                ...prevState.role_permissions,
                [key]: event.target.checked
            }
        }));
        setShowSaveButton(true);
    }
    const numberOfPages = Math.ceil(Object.keys(roleDetails.role_permissions).length / itemsPerPage);

    // Determine the start and end indices of switches for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, Object.keys(roleDetails.role_permissions).length);

    // Get the switches for the current page
    const currentSwitches = Object.entries(roleDetails.role_permissions).slice(startIndex, endIndex);

    const renderRoles = () => {
        return OrgRoles.map(role => (
            <div className="col-md-4 mb-4" key={role.id}>
                <Card>
                    <Card.Body>
                        <Card.Title>{role.role_title} {role.is_base_role && <small><small><small><small>Base Membership Role</small></small></small></small>}</Card.Title>
                        <Button disabled={role.is_base_role} onClick={() => handleDetailsBtnClick(role.id)}>View Details</Button> <br /><br />
                        {CanViewRoles && !role.is_base_role && <div><Button variant="secondary" onClick={()=>{navigate(`/groups/${groupID}/settings/roles/${role.id}/lists`)}}>View Members</Button><br /><br /></div>}
                        {CanDeleteRoles && !role.is_base_role && CanEditRoles && <Button style={{ marginLeft: '25px' }} variant="danger">Delete Role</Button>}
                    </Card.Body>
                </Card>
            </div>
        ));
    }

    if(OrgRoles.length === 0){
        return <Spinner message={`Loading ${roleLabel}s ...`}/>
    }

    return (
        <div>
            {/* <div className="alert alert-danger" role='alert'>This feature is in the works, not all of the buttons work at this time.</div> */}
            {displayCreatePopup && (<Popup component={<RoleForm roleLable={roleLabel} groupID={groupID} handleClose={handleCloseCreate}/>}/>)}
            <h4>{roleLabel} Management:</h4>
            <div>
                {CanCreateRoles && (<div><Button onClick={()=>{setPopupCreate(true)}}>Add {roleLabel}</Button></div>)}
                <br />
            </div>
            <div className="row m-0 p-0" style={{ padding: '5px' }}>
            <Modal
                    isOpen={isModalOpen}
                    onRequestClose={handleCloseModal}
                    style={{
                        content: {
                            top: '50%',
                            left: '50%',
                            right: 'auto',
                            bottom: 'auto',
                            marginRight: '-50%',
                            transform: 'translate(-50%, -50%)',
                            maxHeight: '80%', // 70% of viewport height
                            overflow: 'auto',
                        },
                    }}

                >
                    <Button className='btn btn-danger' onClick={handleCloseModal} style={{ float: "right" }}>X</Button>
                    <h2>{roleDetails.role_title}</h2>
                    {currentSwitches.map(([key, value]) => (
                        <div key={key}>
                            <label style={{ marginRight: '5px' }}>{key}</label>
                            <input type="checkbox" checked={value} onChange={(e) => handleSwitchChange(key, e)} disabled={!CanEditRoles} />
                        </div>
                    ))}

                    <ButtonGroup>
                        {Array.from({ length: numberOfPages }, (_, i) => i + 1).map(page => (
                            <Button key={page} variant="secondary" onClick={() => handlePageChange(page)}>{page}</Button>
                        ))}
                    </ButtonGroup>
                    <br></br>
                    <br></br>
                    {showSaveButton && <Button onClick={handleSaveChanges}>Save Changes</Button>}
                </Modal>
                {renderRoles()}
            </div>
        </div>
    );
}

export default RoleManagementScreen;
