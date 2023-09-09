import React, { useEffect } from 'react';

const StripePricingTable = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/pricing-table.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div>
        <section>
            Please note that you only need to have an active subscription if you plan to manage a group.
        </section>
        <section><small>When you subscribe for services, please make sure that you use the same email address that you created with Org Tools. Payment servers will update your account once payment is completed by updating your account with your associated email address.</small></section>
        <stripe-pricing-table
      pricing-table-id=""
      publishable-key=""
    ></stripe-pricing-table>
    </div>
  );
};

export default StripePricingTable;
