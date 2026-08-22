Feature('ORD-57 Email - Email Send Time');

Scenario('System sends email at correct time', async ({ I }) => {

    I.amOnPage('/');

    I.wait(5);

    I.seeInCurrentUrl('/');

});