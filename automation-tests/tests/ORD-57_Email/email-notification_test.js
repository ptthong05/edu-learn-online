Feature('ORD-57 Email - Notification');

Scenario('System notification page available', async ({ I }) => {

    I.amOnPage('/');

    I.wait(3);

    I.see('DO DRIVE ORD');

});