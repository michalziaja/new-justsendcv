const stripe = require('stripe')('sk_test_51QvhQQEIpSl1xTDJZis1WD37KdtHZAeLu9zvt5q3I8M0Yv1OAezFzP7YzlHvICGVC77ALjDZjFT2eNjdWbMDpNKv00TGuCgk5C');
// test-failed-payment.js


const CUSTOMER_ID = 'cus_RsJOFc6XJ2HAkU';
const SUBSCRIPTION_ID = 'sub_1QyYlIEIpSl1xTDJq4LC0ZbH';
const USER_ID = 'user_2tjAWdhWTFNoRc0T4leU2MjMstp';


async function testFailedPayment() {
    const customer = await stripe.customers.retrieve(CUSTOMER_ID);
    console.log(`Testing failed payment for customer: ${customer.email}`);

    const paymentMethodId = 'pm_1QxxypEIpSl1xTDJvMsurMmi'; // Nieudana metoda
    await stripe.customers.update(CUSTOMER_ID, { invoice_settings: { default_payment_method: paymentMethodId } });

    const invoice = await stripe.invoices.create({
        customer: CUSTOMER_ID,
        subscription: SUBSCRIPTION_ID,
        auto_advance: true,
    });

    try {
        await stripe.invoices.pay(invoice.id, { payment_method: paymentMethodId });
        console.warn('Payment unexpectedly succeeded');
    } catch (payError) {
        console.log(`Expected failure: ${payError.message}`);
        console.log("Check Supabase: status should be 'payment_pending'");
    }
}

testFailedPayment();