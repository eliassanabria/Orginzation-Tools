import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { Button, Card, ButtonGroup } from "react-bootstrap";
import { Map } from "immutable";
import { Spinner } from "../../../addons_React/Spinners/Spinner";
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import Popup from "../../../addons_React/Popups/popup";
import SubgroupForm from "./SubGroupCreationModal";
import { useParams, Link, NavLink } from 'react-router-dom'
import axios from "axios";
import { AuthState } from "../../../authentication/login/AuthState";


const SubGroupManagementScreen = (props) => {
    const { Authenticated } = props;
    const navigate = useNavigate();
    const { groupID } = useParams();
    const [permissions, setPermissions] = useState([]);
    const [subGroupList, setSubGroupLists] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState({ value: 'all', label: 'All' });
    const [displayCreatePopup, setCreatePopup] = useState(false);
    const fetchPermissions = async () => {
        if (Authenticated === AuthState.Authenticated) {
            await axios.get(`/api/groups/${groupID}/settings/permissions`)
                .then((result) => {
                    if (result.status === 200) {
                        setPermissions(result.data);
                    }
                })
        }
    }
    const fetchSubGroupsLists = async (categoryID = 'all') => {
        setSubGroupLists([]);
        await axios.get(`/api/groups/${groupID}/settings/subgroups/list/${categoryID}`)
            .then((response) => {
                if (response.status === 200) {
                    const subGroupList = response.data.list;
                    setSubGroupLists(subGroupList);
                }
            })
    }
    useEffect(() => {
        const fetchOrgSubCategories = async () => {
            await axios.get(`/api/groups/${groupID}/settings/subgroups/categories`)
                .then((response) => {
                    if (response.status === 200) {
                        console.log("Data: ", response.data);
                        const categories = response.data
                            .filter(category => category.visible || permissions?.CanViewHiddenSubgroups)
                            .map(category => ({ value: category.id, label: category.CategoryName }));
                        console.log('Categories:', categories);
                        setSubCategories([{ value: 'all', label: 'All' }, ...categories]);
                    }
                })
        }
        if (Authenticated === AuthState.Authenticated) {
            fetchPermissions();
            fetchOrgSubCategories();
        }

    }, [Authenticated]);

    useEffect(() => {
        if (permissions?.CanViewSubGroups) {
            fetchSubGroupsLists(selectedCategory.value);
        }
    }, [permissions, selectedCategory])

    const renderSubGroups = () => {
        const navToSubDetails = (id) =>{
            navigate(`/groups/${groupID}/subgroups/${id}/view`);
        }
        return subGroupList.map(subGroup => (
            <div className="col-md-4 mb-4" key={subGroup.id}>
                <Card key={subGroup.id}>
                    <Card.Body>
                        <Card.Title>{subGroup.group_title}</Card.Title>
                        <Button onClick={()=>navToSubDetails(subGroup.id)}>View</Button>
                    </Card.Body>
                </Card>
            </div>

        ))
    }
    const handleOpen = () => {
        setCreatePopup(true);
    }
    const handleClose = () => {
        setCreatePopup(false);
    }
    return (
        <div>
            <Button style={{ display: 'flex' }} className="btn btn-secondary" onClick={() => { window.history.back() }}>Back to Settings</Button>

            {displayCreatePopup && (<Popup component={<SubgroupForm handleClose={handleClose} groupID={groupID} />} />)}
            <h2>Manage Subgroups:</h2>
            {permissions.CanCreateSubGroups && (<><Button variant="success" onClick={handleOpen}  >Create Subgroup</Button><br /><br /></>)}
            <h5>Filter Subgroup Categories</h5>
            <Select
                options={subCategories}
                value={selectedCategory}
                onChange={selectedOption => setSelectedCategory(selectedOption)}
            />
            <br />
            {renderSubGroups()}
        </div>
    )
}

export default SubGroupManagementScreen;
