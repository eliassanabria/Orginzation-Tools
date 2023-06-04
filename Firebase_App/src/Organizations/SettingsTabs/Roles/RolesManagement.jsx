import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Button, Card } from "react-bootstrap";

const RoleManagementScreen = (props) => {
    const { Authenticated, roleLabel, CanViewRoles, CanEditRoles, CanCreateRoles, CanDeleteRoles, groupID } = props;
    const [OrgRoles, setOrgRoles] = useState([]);

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

    const renderRoles = () => {
        return OrgRoles.map(role => {
            return (
                <div className="col-md-4 mb-4">
                    <Card key={role.id}>
                        <Card.Body>
                            <Card.Title>{role.role_title} {role.is_base_role && <small><small><small><small>Base Membership Role</small></small></small></small>}</Card.Title>
                            <Button disabled={role.is_base_role} >View Details</Button> <br></br><br></br>
                            {CanEditRoles && !role.is_base_role && <div><Button variant="primary">Add / Remove Members</Button><br></br><br></br></div>}
                            {CanViewRoles && !role.is_base_role && <Button variant="secondary">View Members</Button>}
                            {CanDeleteRoles && !role.is_base_role && <Button style={{ marginLeft: '25px' }} variant="danger">Delete Role</Button>}
                        </Card.Body>
                    </Card>
                </div>
            )
        });
    }

    return (
        <div>
            <h4>{roleLabel} Management:</h4>
            <div>
                {CanCreateRoles && (<div><Button>Add {roleLabel}</Button></div>)}
                <br></br>
            </div>
            <div className="row m-0 p-0" style={{ padding: '5px' }}>
                {renderRoles()}
            </div>
        </div>
    );
}

export default RoleManagementScreen;
