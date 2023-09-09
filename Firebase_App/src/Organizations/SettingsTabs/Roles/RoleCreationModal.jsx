import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Switch from 'react-bootstrap/Switch';
import axios from 'axios';

const RoleForm = ({ roleLable, groupID, handleClose }) => {
  const [formFields, setFormFields] = useState({
    role_title: '',
    display_title: true,
    is_over_subgroup: false,
    sub_group_link_jurisdiction: '',
    is_belong_subgroup: false,
    sub_group_link_belong: '',
    is_read_only: false,
    is_leadership: false
  });

  const [subGroups, setSubGroups] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        const token = localStorage.getItem('token');
      const response = await axios.get(`/api/groups/${groupID}/settings/subgroups/list/all`,{
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubGroups(response.data.list);
    };

    fetchData();
  }, [groupID]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const response = await axios.post(`/api/groups/${groupID}/settings/roles/create`, formFields,{
        headers: { Authorization: `Bearer ${token}` }
      });
    if(response.status === 201){
        console.log('Response', response.data);

    }
    handleClose(null);
  };

  const handleInputChange = (event) => {
    setFormFields({
      ...formFields,
      [event.target.name]: event.target.value,
    });
  };

  const handleSwitchChange = (field) => {
    setFormFields({
      ...formFields,
      [field]: !formFields[field],
    });
  };

  return (
    <Modal show={true} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create new {roleLable}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="role_title">
            <Form.Label>{roleLable} Title</Form.Label>
            <Form.Control type="text" name="role_title" required onChange={handleInputChange} />
          </Form.Group><br></br>
          <Form.Group controlId="display_title">
            <Form.Label>Display Title Label</Form.Label>
            <Form.Check type="switch" checked={formFields.display_title} name="display_title" onChange={() => handleSwitchChange('display_title')} />
          </Form.Group><br></br>
          <Form.Group controlId="is_over_subgroup">
            <Form.Label>Is {roleLable} over subgroup?</Form.Label>
            <Form.Check type="switch" name="is_over_subgroup" checked={formFields.is_over_subgroup} onChange={() => handleSwitchChange('is_over_subgroup')} />
          </Form.Group><br></br>
          {formFields.is_over_subgroup && (
          <>
          <Form.Group controlId="sub_group_link_jurisdiction">
              <Form.Label>Select Subgroup</Form.Label>
              <Form.Select name="sub_group_link_jurisdiction" required onChange={handleInputChange}>
              <option value="">Select Subgroup</option>
                {subGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.group_title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group controlId="is_leadership">
            <Form.Label>Is {roleLable} a leadership position?</Form.Label>
            <Form.Check type="switch" name="is_leadership"  onChange={() => handleSwitchChange('is_leadership')} />
          </Form.Group>
            <br></br>
          </>
          )}
          <Form.Group controlId="is_belong_subgroup">
            <Form.Label>Is {roleLable} apart of subgroup?</Form.Label>
            <Form.Check type="switch" name="is_belong_subgroup" onChange={() => handleSwitchChange('is_belong_subgroup')} />
          </Form.Group><br></br>
          {formFields.is_belong_subgroup && (
            <>
            <Form.Group controlId="sub_group_link_belong">
              <Form.Label>Select Subgroup</Form.Label>
              <Form.Select name="sub_group_link_belong" required onChange={handleInputChange}>
              <option value="">Select Subgroup</option>

                {subGroups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.group_title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group><br></br>
            </>
            
          )}
          <Form.Group controlId="is_read_only">
            <Form.Label>Make {roleLable} Permanent?</Form.Label>
            <Form.Check type="switch" name="is_read_only"  onChange={() => handleSwitchChange('is_read_only')} />
          </Form.Group><br></br><br></br>
          <Button variant="primary" type="submit">
            Create
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RoleForm;
