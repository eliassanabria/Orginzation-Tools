import React, { useState, useEffect } from 'react';
import { Card, Button, Accordion } from 'react-bootstrap';
import { AuthState } from '../../authentication/login/AuthState';
import axios from 'axios';
import './pricing.css'

const PricingPages = (props) => {
    const { Authenticated } = props;
    const [plans, setPlans] = useState([
        {
            "id": 1,
            "name": "Free Plan",
            "description": "Access all benefits included with the groups you join.",
            "includes":['View Group Dashboard', 'Access Group Tools'],
            "price": 0.00,
            "currency": 'usd',
            "period_short": 'month',
            "period": 'Included with Account'
        },
        {
            "id": 2,
            "name": "Premium Plan",
            "description": "Get full access to all premium features of OrgTools app! This includes push notification announcements, and the ablility to see who is online. Future developments like appointemnt mananging within organizations, feeds, calendars, and assignments too.",
            "includes":['Organization Wide Notifications', 'Role Filters', 'Customizable Join Codes', 'Organization Wide Surveys', 'Max of 200 Group Members'],
            "price": 14.00,
            "currency": 'usd',
            "period_short": 'month',
            "period": '1 month'

        },
        {
            "id": 3,
            "name": "Premium Plan",
            "description": "Get full access to all premium features of OrgTools app! This includes push notification announcements, and the ablility to see who is online. Future developments like appointemnt mananging within organizations, feeds, calendars, and assignments too.",
            "includes":['Organization Wide Notifications', 'Role Filters', 'Customizable Join Codes', 'Organization Wide Surveys', 'Max of 200 Group Members'],
            "price": 42.00,
            "currency": 'usd',
            "period_short": 'quarter',
            "period": '3 months'

        },
        {
            "id": 4,
            "name": "Premium Plan",
            "description": "Get full access to all premium features of OrgTools app! This includes push notification announcements, and the ablility to see who is online. Future developments like appointemnt mananging within organizations, feeds, calendars, and assignments too.",
            "includes":['Organization Wide Notifications', 'Role Filters', 'Customizable Join Codes', 'Organization Wide Surveys', 'Max of 200 Group Members'],
            "price": 150.00,
            "currency": 'usd',
            "period_short": 'yr',
            "period": '12 months'

        }
    ]
    );
    const [showAdditionalTier, setShowAdditionalTier] = useState(false);

    useEffect(() => {
        axios.get('/api/pricing')
            .then(response => {
                setPlans(response.data);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    }, []);

    const handleToggleAdditionalTier = () => {
        setShowAdditionalTier(!showAdditionalTier);
    };

    return (
        <div>
            <h1>Subscription Pricing</h1>
            {Authenticated !== AuthState.Authenticated && (<p className="disclaimer">Please log in to subscribe.</p>)}

            <h2>Group Plans</h2>
            <div className="pricing-grid">
                {plans.map((plan) => (
                    <Card key={plan.id}>
                        <Card.Body>
                            <Card.Title>{plan.name}</Card.Title><Card.Subtitle>${plan.price} / {plan.period_short}  (<small>Every {plan.period}</small>)</Card.Subtitle>
                            <Card.Text>
                                {plan.description}
                                <br/>
                                <small>Features:</small>
                                <ul>
                                    {plan.includes.map((item, index) => (
                                        <li key={index}>{item}</li>
                                    ))}
                                </ul>
                            </Card.Text>
                            <Button variant="primary" disabled={Authenticated === AuthState.Unauthenticated}>{Authenticated === AuthState.Unauthenticated &&(<>Log in to Subscribe</>)}{Authenticated === AuthState.Authenticated &&(<>Subscribe</>)}</Button>
                        </Card.Body>
                    </Card>
                ))}
                <Accordion>

                </Accordion>
            </div>

            <h2>Personal Plans (Coming Soon)</h2>
            <p>Personal plans will be available in mid-2024.</p>
            <div className="pricing-table">
                {/* You could include code here for future personal plans, similar to the one above */}
            </div>

        </div>
    );
}

export default PricingPages;