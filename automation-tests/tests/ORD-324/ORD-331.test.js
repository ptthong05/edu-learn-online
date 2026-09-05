'use strict';

const {
  assert,
  openDb
} = require('./db-test-utils');

async function main() {

  const db = await openDb();

  try {

    console.log(
      '=== ORD-331 - Foreign Key & Data Integrity ==='
    );

    // TC01 - Foreign Key phải được bật
    const fk = await db.get(
      'PRAGMA foreign_keys;'
    );

    assert.equal(
      fk.foreign_keys,
      1
    );

    console.log(
      'PASS TC01 - PRAGMA foreign_keys = ON'
    );


    // TC02 - orders.user_id phải tham chiếu users.id
    const orderFKs = await db.all(
      'PRAGMA foreign_key_list(orders);'
    );

    assert.ok(
      orderFKs.some(
        fk =>
          fk.table === 'users' &&
          fk.from === 'user_id' &&
          fk.to === 'id'
      )
    );

    console.log(
      'PASS TC02 - orders.user_id -> users.id tồn tại'
    );


    // TC03 - Insert order với user không tồn tại phải bị reject
    const fakeOrderId =
      `ORD331_INVALID_${Date.now()}`;

    let rejected = false;

    try {

      await db.run(
        `
        INSERT INTO orders
        (
          id,
          user_id,
          total,
          subtotal,
          payment_method,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          fakeOrderId,
          'USER_KHONG_TON_TAI_ORD331',
          100000,
          100000,
          'banking',
          'pending',
          new Date().toISOString()
        ]
      );

    } catch (error) {

      rejected =
        /foreign key constraint failed/i
          .test(error.message);
    }

    assert.equal(
      rejected,
      true
    );

    console.log(
      'PASS TC03 - FK từ chối user_id không tồn tại'
    );


    // Cleanup nếu có dữ liệu ngoài mong đợi
    await db.run(
      'DELETE FROM orders WHERE id = ?',
      [fakeOrderId]
    );


    // TC04 - Không được có orphan order
    const orphanOrders = await db.all(`
      SELECT o.id
      FROM orders o
      LEFT JOIN users u
        ON u.id = o.user_id
      WHERE o.user_id IS NOT NULL
        AND u.id IS NULL
    `);

    assert.equal(
      orphanOrders.length,
      0
    );

    console.log(
      'PASS TC04 - Không có orphan orders'
    );


    // TC05 - Integrity check
    const integrity = await db.get(
      'PRAGMA integrity_check;'
    );

    assert.equal(
      integrity.integrity_check,
      'ok'
    );

    console.log(
      'PASS TC05 - PRAGMA integrity_check = ok'
    );


    console.log('');
    console.log(
      'ORD-331 RESULT: PASS'
    );
    console.log(
      'Assertions: 5/5 PASS'
    );

  } finally {

    await db.close();

  }
}


main().catch(error => {

  console.error('');
  console.error(
    'ORD-331 RESULT: FAIL'
  );

  console.error(error);

  process.exit(1);

});