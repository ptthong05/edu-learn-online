const { getDatabase } = require('./db');

async function verifyCoupon() {
  try {
    const db = await getDatabase();
    const coupon = await db.get("SELECT id, code, discount, max_discount, min_order_amount FROM coupons WHERE code = 'GGGG'");
    console.log('Current coupon data in database:');
    console.log(JSON.stringify(coupon, null, 2));
    
    // Test the calculation
    const orderAmount = 1988000;
    const calculatedDiscount = Math.round(orderAmount * coupon.discount / 100);
    const cappedDiscount = coupon.max_discount > 0 ? Math.min(calculatedDiscount, coupon.max_discount) : calculatedDiscount;
    
    console.log('\nCalculation test:');
    console.log('Order amount:', orderAmount);
    console.log('Discount %:', coupon.discount);
    console.log('Calculated discount (10%):', calculatedDiscount);
    console.log('Max discount:', coupon.max_discount);
    console.log('Final discount (capped):', cappedDiscount);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}



verifyCoupon();