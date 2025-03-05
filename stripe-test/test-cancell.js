const stripe = require('stripe')('sk_test_51QvhQQEIpSl1xTDJZis1WD37KdtHZAeLu9zvt5q3I8M0Yv1OAezFzP7YzlHvICGVC77ALjDZjFT2eNjdWbMDpNKv00TGuCgk5C');



const CUSTOMER_ID = 'cus_RsJOFc6XJ2HAkU';
const SUBSCRIPTION_ID = 'sub_1QyYlIEIpSl1xTDJq4LC0ZbH';
const USER_ID = 'user_2tjAWdhWTFNoRc0T4leU2MjMstp';


async function testSubscriptionCancellation() {
    const customer = await stripe.customers.retrieve(CUSTOMER_ID);
    console.log(`Testing subscription cancellation for customer: ${customer.email}`);

    const canceledSubscription = await stripe.subscriptions.cancel(SUBSCRIPTION_ID);
    console.log(`Subscription cancelled: ${canceledSubscription.id}`);
    console.log("Check Supabase: status should be 'cancelled'");
}

testSubscriptionCancellation();