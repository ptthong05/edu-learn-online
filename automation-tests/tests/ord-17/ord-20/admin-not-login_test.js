Feature('ORD-20 - Access Admin Without Login');

Scenario('Guest cannot access admin page', ({ I }) => {

    I.amOnPage('/admin');

    I.see('Đăng nhập');

});