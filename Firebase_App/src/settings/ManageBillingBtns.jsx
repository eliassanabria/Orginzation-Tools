import React from 'react';

function ManageBillingButton() {
  const handleManageBilling = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('No authorization token found.');
      return;
    }

    try {
      const response = await fetch('/api/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const session = await response.json();
        window.location.href = session.url;
      } else {
        alert('Failed to create customer portal session.');
      }
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      alert('Failed to create customer portal session.');
    }
  };

  return (
    <button type="button" onClick={handleManageBilling}>
      Manage billing
    </button>
  );
}

export default ManageBillingButton;
