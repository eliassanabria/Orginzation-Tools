import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

const SubgroupForm = (props) => {
  const { groupID, permissions, handleClose} = props;
  const [formFields, setFormFields] = useState({
    sub_group_type: '',
    group_title: '',
    roles_jurisdiction: [],
    roles_belonging: [],
  });
  const [orgCategories, setOrgCategories] = useState([]);

  useEffect(() => {
    const fetchOrgSubCategories = async () => {
      await axios.get(`/api/groups/${groupID}/settings/subgroups/categories`).then((response) => {
        if (response.status === 200) {
          console.log('Data:', response.data);
          const categories = response.data
            .filter((category) => category.visible || permissions?.CanViewHiddenSubgroups)
            .map((category) => ({ value: category.id, label: category.CategoryName }));
          console.log('Categories:', categories);
          setOrgCategories(categories);
        }
      });
    };
    fetchOrgSubCategories();
  }, [groupID, permissions]);

  const handleInputChange = (event) => {
    setFormFields({
      ...formFields,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`/api/groups/${groupID}/settings/subgroups/create`, formFields);
      if (response.status === 201) {
        console.log('Response', response.data);
        // Handle success or additional logic here
        alert('Successfully created subgroup!');
        window.location.reload();
      }
      handleClose();
    } catch (error) {
      // Handle error here
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <Modal show={true} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Create Subgroup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            
            <Form.Group controlId="group_title">
              <Form.Label>Group Title</Form.Label>
              <Form.Control type="text" name="group_title" value={formFields.group_title} onChange={handleInputChange} required />
            </Form.Group>
            <Form.Group controlId="sub_group_type">
              <Form.Label>Subgroup Type</Form.Label>
              <Form.Select name="sub_group_type" value={formFields.sub_group_type} onChange={handleInputChange} required>
                <option value="">Select Subgroup Type</option>
                {orgCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <br/>
            <Button variant="primary" type="submit">
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SubgroupForm;
