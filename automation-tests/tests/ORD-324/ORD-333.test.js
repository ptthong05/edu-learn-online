'use strict';

const {
  assert,
  openDb
} = require('./db-test-utils');


async function main() {

  const db = await openDb();

  const runId = Date.now();

  const catId =
    `ord333-cat-${runId}`;


  try {

    console.log(
      '=== ORD-333 - Transaction & Rollback ==='
    );


    // TC01
    await db.run(
      'BEGIN TRANSACTION'
    );

    await db.run(
      'INSERT INTO categories (id, name) VALUES (?, ?)',
      [
        catId,
        'ORD 333 Transaction Test'
      ]
    );


    const insideTx =
      await db.get(
        'SELECT id FROM categories WHERE id = ?',
        [catId]
      );


    assert.equal(
      insideTx.id,
      catId
    );

    console.log(
      'PASS TC01 - Dữ liệu tồn tại trong transaction'
    );


    // TC02
    await db.run(
      'ROLLBACK'
    );


    const afterRollback =
      await db.get(
        'SELECT id FROM categories WHERE id = ?',
        [catId]
      );


    assert.equal(
      afterRollback,
      undefined
    );

    console.log(
      'PASS TC02 - ROLLBACK hoàn tác dữ liệu'
    );


    // TC03
    await db.run(
      'BEGIN TRANSACTION'
    );


    await db.run(
      'INSERT INTO categories (id, name) VALUES (?, ?)',
      [
        catId,
        'ORD 333 Atomicity'
      ]
    );


    let duplicateRejected = false;


    try {

      await db.run(
        'INSERT INTO categories (id, name) VALUES (?, ?)',
        [
          catId,
          'Duplicate PK'
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
      'PASS TC03 - Duplicate PK bị từ chối'
    );


    // TC04
    await db.run(
      'ROLLBACK'
    );


    const atomicityCheck =
      await db.get(
        'SELECT id FROM categories WHERE id = ?',
        [catId]
      );


    assert.equal(
      atomicityCheck,
      undefined
    );


    console.log(
      'PASS TC04 - Transaction đảm bảo atomicity'
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
      'ORD-333 RESULT: PASS'
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
    'ORD-333 RESULT: FAIL'
  );

  console.error(error);

  process.exit(1);

});