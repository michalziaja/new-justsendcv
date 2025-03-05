const stripe = require('stripe')('sk_test_51QvhQQEIpSl1xTDJZis1WD37KdtHZAeLu9zvt5q3I8M0Yv1OAezFzP7YzlHvICGVC77ALjDZjFT2eNjdWbMDpNKv00TGuCgk5C');



const CUSTOMER_ID = 'cus_RrhN656FttLcz4';
const SUBSCRIPTION_ID = 'sub_1QxxyqEIpSl1xTDJP5VJMPwE';
const USER_ID = 'user_2tjAWdhWTFNoRc0T4leU2MjMstp';

async function recreateSubscription() {
    try {
        const customer = await stripe.customers.retrieve(CUSTOMER_ID);
        console.log(`Recreating subscription for customer: ${customer.email}`);

        // Znajdź aktywny plan (price) - dostosuj do swojego planu
        const prices = await stripe.prices.list({
            active: true,
            limit: 1,
        });
        if (prices.data.length === 0) {
            throw new Error('No active prices found in your Stripe account');
        }
        const priceId = prices.data[0].id; // Użyj pierwszego dostępnego planu

        // Sprawdź istniejące metody płatności
        const paymentMethodId = 'sub_1QxweMEIpSl1xTDJVOvJNrfJ'; // Poprawna metoda
        
        await stripe.customers.update(CUSTOMER_ID, {
            invoice_settings: { default_payment_method: paymentMethodId },
        });

        // Utwórz nową subskrypcję
        const subscription = await stripe.subscriptions.create({
            customer: CUSTOMER_ID,
            items: [{ price: priceId }],
            metadata: { userId: USER_ID },
            billing_cycle_anchor: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // Ustaw cykl na jutro
        });

        console.log(`New subscription created: ${subscription.id}`);
        console.log(`Current period end: ${new Date(subscription.current_period_end * 1000).toISOString()}`);
        console.log('Update your Supabase database with the new stripe_subscription_id:', subscription.id);

        return subscription.id;
    } catch (error) {
        console.error('Error recreating subscription:', error);
    }
}

recreateSubscription();