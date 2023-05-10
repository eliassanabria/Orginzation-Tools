import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Card } from "react-bootstrap";
import axios from "axios";

const SubscriptionForm = ({ uid }) => {
    const [loading, setLoading] = useState(false);
    const stripe = useStripe();
    const elements = useElements();
    const getAuthToken = () => {
        return localStorage.getItem("token");
      };
      
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            const { data: { customerId } } = await axios.post("/api/create-customer", { uid }, {
                headers: {
                  Authorization: `Bearer ${getAuthToken()}`
                }
              });
              
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: elements.getElement(CardElement),
            });

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }
            const { data: { subscription } } = await axios.post("/api/create-subscription", {
                customerId,
                paymentMethodId: paymentMethod.id,
                priceId: "price_1N5sdsIHkGHu4JAVQtc3jWaM",
              }, {
                headers: {
                  Authorization: `Bearer ${getAuthToken()}`
                }
              });

            console.log("Subscription created:", subscription);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div>
            <Card>
                <form onSubmit={handleSubmit}>

                    <CardElement />
                    <button type="submit" disabled={!stripe || loading}>
                        Subscribe
                    </button>
                </form>
            </Card>
        </div>

    );
};

export default SubscriptionForm;
