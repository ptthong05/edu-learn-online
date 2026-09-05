'use strict';

const {
  assert,
  openDb
} = require('./db-test-utils');


async function main() {

  const db = await openDb();


  try {

    console.log(
      '=== ORD-335 - Performance & Index ==='
    );


    // TC01
    const courseIndexes =
      await db.all(
        `PRAGMA index_list('courses');`
      );


    const courseNames =
      courseIndexes.map(
        i => i.name
      );


    assert.ok(
      courseNames.includes(
        'idx_courses_category_id'
      )
    );

    assert.ok(
      courseNames.includes(
        'idx_courses_status'
      )
    );


    console.log(
      'PASS TC01 - Course indexes tồn tại'
    );


    // TC02
    const orderIndexes =
      await db.all(
        `PRAGMA index_list('orders');`
      );


    const orderNames =
      orderIndexes.map(
        i => i.name
      );


    assert.ok(
      orderNames.includes(
        'idx_orders_user_id'
      )
    );

    assert.ok(
      orderNames.includes(
        'idx_orders_status'
      )
    );


    console.log(
      'PASS TC02 - Order indexes tồn tại'
    );


    // TC03
    const plan =
      await db.all(
        `
        EXPLAIN QUERY PLAN
        SELECT *
        FROM courses
        WHERE category_id = ?
        `,
        ['cat-1']
      );


    const planText =
      plan
        .map(
          row =>
            Object.values(row)
              .join(' ')
        )
        .join(' ')
        .toLowerCase();


    assert.ok(
      planText.includes(
        'idx_courses_category_id'
      ) ||
      planText.includes(
        'using index'
      )
    );


    console.log(
      'PASS TC03 - Query planner sử dụng index'
    );


    // TC04
    const start =
      process.hrtime.bigint();


    await db.all(
      `
      SELECT *
      FROM courses
      WHERE category_id = ?
      `,
      ['cat-1']
    );


    const elapsedMs =
      Number(
        process.hrtime.bigint() -
        start
      ) / 1e6;


    assert.ok(
      elapsedMs < 1000
    );


    console.log(
      `PASS TC04 - Query ${elapsedMs.toFixed(3)}ms < 1000ms`
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
      'ORD-335 RESULT: PASS'
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
    'ORD-335 RESULT: FAIL'
  );

  console.error(error);

  process.exit(1);

});