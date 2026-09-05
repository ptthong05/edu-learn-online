'use strict';

const {
  assert,
  openDb
} = require('./db-test-utils');


async function main() {

  const db = await openDb();

  const runId = Date.now();


  try {

    console.log(
      '=== ORD-334 - NOT NULL & CHECK Constraints ==='
    );


    // TC01
    const columns =
      await db.all(
        `PRAGMA table_info('users');`
      );


    const email =
      columns.find(
        c => c.name === 'email'
      );

    const password =
      columns.find(
        c => c.name === 'password'
      );


    assert.ok(
      email &&
      Number(email.notnull) === 1
    );

    assert.ok(
      password &&
      Number(password.notnull) === 1
    );


    console.log(
      'PASS TC01 - email/password có NOT NULL'
    );


    // TC02
    let nullRejected = false;

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
          `ord334-null-${runId}`,
          'ORD334',
          null,
          'hash',
          'USER',
          'active',
          new Date().toISOString()
        ]
      );

    } catch (error) {

      nullRejected =
        /not null constraint failed/i
          .test(error.message);

    }


    assert.equal(
      nullRejected,
      true
    );

    console.log(
      'PASS TC02 - Email NULL bị từ chối'
    );


    // TC03
    let negativePriceRejected = false;

    try {

      await db.run(
        `
        INSERT INTO courses
        (id, title, price, status)
        VALUES (?, ?, ?, ?)
        `,
        [
          `ord334-course-${runId}`,
          'Invalid Price',
          -1,
          'published'
        ]
      );

    } catch (error) {

      negativePriceRejected =
        /check constraint failed/i
          .test(error.message);

    }


    assert.equal(
      negativePriceRejected,
      true
    );

    console.log(
      'PASS TC03 - price < 0 bị CHECK từ chối'
    );


    // TC04
    let invalidRoleRejected = false;

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
          `ord334-role-${runId}`,
          'Invalid Role',
          `ord334_${runId}@test.com`,
          'hash',
          'INVALID_ROLE',
          'active',
          new Date().toISOString()
        ]
      );

    } catch (error) {

      invalidRoleRejected =
        /check constraint failed/i
          .test(error.message);

    }


    assert.equal(
      invalidRoleRejected,
      true
    );


    console.log(
      'PASS TC04 - Role không hợp lệ bị từ chối'
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
      'ORD-334 RESULT: PASS'
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
    'ORD-334 RESULT: FAIL'
  );

  console.error(error);

  process.exit(1);

});