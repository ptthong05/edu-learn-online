'use strict';

const {
  assert,
  openDb
} = require('./db-test-utils');


async function main() {

  const db = await openDb();

  const runId = Date.now();

  const user1 =
    `ord332_u1_${runId}`;

  const user2 =
    `ord332_u2_${runId}`;

  const email =
    `ord332_${runId}@edulearn.test`;


  try {

    console.log(
      '=== ORD-332 - UNIQUE Constraints ==='
    );


    // TC01
    const userIndexes =
      await db.all(
        `PRAGMA index_list('users');`
      );

    assert.ok(
      userIndexes.some(
        index =>
          Number(index.unique) === 1
      )
    );

    console.log(
      'PASS TC01 - users có UNIQUE index'
    );


    await db.run(
      'BEGIN TRANSACTION'
    );


    // Tạo user đầu tiên
    await db.run(
      `
      INSERT INTO users
      (
        id,
        full_name,
        email,
        password,
        role,
        status,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user1,
        'ORD 332 User 1',
        email,
        'hash-test',
        'USER',
        'active',
        new Date().toISOString()
      ]
    );


    // TC02 - email trùng phải bị reject
    let duplicateRejected = false;

    try {

      await db.run(
        `
        INSERT INTO users
        (
          id,
          full_name,
          email,
          password,
          role,
          status,
          created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user2,
          'ORD 332 User 2',
          email,
          'hash-test',
          'USER',
          'active',
          new Date().toISOString()
        ]
      );

    } catch (error) {

      duplicateRejected =
        /unique constraint failed/i
          .test(error.message);

    }


    assert.equal(
      duplicateRejected,
      true
    );

    console.log(
      'PASS TC02 - users.email từ chối dữ liệu trùng'
    );


    await db.run(
      'ROLLBACK'
    );


    // TC03
    const couponInfo =
      await db.all(
        `PRAGMA table_info('coupons');`
      );

    assert.ok(
      couponInfo.some(
        column =>
          column.name === 'code' &&
          Number(column.notnull) === 1
      )
    );

    console.log(
      'PASS TC03 - coupons.code là trường bắt buộc'
    );


    // TC04
    const couponIndexes =
      await db.all(
        `PRAGMA index_list('coupons');`
      );

    assert.ok(
      couponIndexes.some(
        index =>
          Number(index.unique) === 1
      )
    );

    console.log(
      'PASS TC04 - coupons có UNIQUE index'
    );


    // TC05
    const integrity =
      await db.get(
        'PRAGMA integrity_check;'
      );

    assert.equal(
      integrity.integrity_check,
      'ok'
    );

    console.log(
      'PASS TC05 - Database integrity = ok'
    );


    console.log('');
    console.log(
      'ORD-332 RESULT: PASS'
    );

    console.log(
      'Assertions: 5/5 PASS'
    );


  } catch (error) {

    try {
      await db.run('ROLLBACK');
    } catch (_) {}

    throw error;

  } finally {

    await db.close();

  }
}


main().catch(error => {

  console.error('');
  console.error(
    'ORD-332 RESULT: FAIL'
  );

  console.error(error);

  process.exit(1);

});