import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button, Container, Row, Col, Card, CardDeck } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import MemberCard from '../../../../addons_React/MemberCard';

const SubgroupDetails = (props) => {
    const { groupID, subgroupID } = useParams();
    const [groupType, setGroupType] = useState({});
    const [groupTypeString, setGroupTypeString] = useState('Loading...');
    const [groupDetails, setGroupDetails] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const result = await axios.get(`/api/groups/${groupID}/subgroups/${subgroupID}/details`);
            if (result.status === 200) {
                const data = result.data;
                console.log(data);
                setGroupDetails(data);
            }
            else {
                console.error("Failed to get subgroup details");
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        const fetchPermissions = async () => {
            const permissions = await axios.get(`/api/groups/${groupID}/settings/permissions`);
            if (permissions.status === 200) {
                setPermissions(permissions.data);
            }
        }
        fetchPermissions();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            const categories = await axios.get(`/api/groups/${groupID}/settings/subgroups/categories`);
            if (categories.status === 200) {
                console.log("Categories:", categories.data);
                const { data } = categories;
                const groupType = data.find(category => category.id === groupDetails.sub_group_type);
                if (groupType) {
                    console.log("Group Type:", groupType);
                    setGroupType(groupType);
                    setGroupTypeString(groupType.CategoryName);
                }
            }
        };
        fetchCategories();
    }, [permissions, groupDetails]);

    useEffect(() => {
        const fetchMembers = async () => {
            const response = await axios.get(`/api/groups/${groupID}/subgroups/${subgroupID}/members`);
            if (response.status === 200) {
                setMembers(response.data);
            }
        }
        fetchMembers();
    }, []);

    return (
        <>
  <h2>
    <Button variant="secondary" onClick={()=>{window.history.back()}}>{'<<'}</Button> {groupDetails.group_title} <sub><small><small>{groupTypeString}</small></small></sub>
  </h2>
  <Container fluid>
    <Row>
      <Col className="border-right">
        <div className="p-3 border">
          <h4>Details Panel</h4>
          <p>{groupDetails.group_description}</p>
        </div>
      </Col>
      <Col className="border-right">
        <div className="p-3 border">
          <h4>Leadership Panel</h4>
          {/* Here we have added a list for the leadership panel */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {/* {permissions.map(permission => 
              <Card key={permission.id}>
                <Card.Body>
                  <Card.Title>{permission.name}</Card.Title>
                </Card.Body>
              </Card>
            )} */}
          </div>
        </div>
      </Col>
      <Col>
        <div className="p-3 border">
          <h4>Announcements</h4>
          <p>Here are the announcements...</p>
        </div>
      </Col>
    </Row>
    <Row>
      <Col>
        <div className="p-3 border mt-4">
          <h4>Members</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {members.map(member => 
              <MemberCard 
                key={member.id} 
                member={member} 
              />
            )}
          </div>
        </div>
      </Col>
    </Row>
  </Container>
</>

    )
}

export default SubgroupDetails;
