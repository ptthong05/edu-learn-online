'use strict';

const fs = require('fs');
const os = require('os');

const {
  assert,
  path,
  DB_PATH,
  sqlite3,
  open
} = require('./db-test-utils');


async function main() {

  const backupPath =
    path.join(
      os.tmpdir(),
      `ord336-backup-${Date.now()}.sqlite`
    );


  console.log(
    '=== ORD-336 - Backup & Recovery ==='
  );


  // TC01
  assert.ok(
    fs.existsSync(DB_PATH)
  );


  const sourceStat =
    fs.statSync(DB_PATH);


  assert.ok(
    sourceStat.size > 0
  );


  console.log(
    'PASS TC01 - database.sqlite tồn tại'
  );


  // TC02
  fs.copyFileSync(
    DB_PATH,
    backupPath
  );


  assert.ok(
    fs.existsSync(backupPath)
  );


  assert.equal(
    fs.statSync(backupPath).size,
    sourceStat.size
  );


  console.log(
    'PASS TC02 - Tạo backup thành công'
  );


  const originalDb =
    await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });


  const backupDb =
    await open({
      filename: backupPath,
      driver: sqlite3.Database
    });


  try {

    // TC03
    const originalIntegrity =
      await originalDb.get(
        'PRAGMA integrity_check;'
      );


    const backupIntegrity =
      await backupDb.get(
        'PRAGMA integrity_check;'
      );


    assert.equal(
      originalIntegrity.integrity_check,
      'ok'
    );


    assert.equal(
      backupIntegrity.integrity_check,
      'ok'
    );


    console.log(
      'PASS TC03 - Backup integrity = ok'
    );


    // TC04
    const originalUsers =
      await originalDb.get(
        'SELECT COUNT(*) AS count FROM users'
      );


    const backupUsers =
      await backupDb.get(
        'SELECT COUNT(*) AS count FROM users'
      );


    assert.equal(
      backupUsers.count,
      originalUsers.count
    );


    console.log(
      'PASS TC04 - Dữ liệu users khớp'
    );


    // TC05
    const originalTables =
      await originalDb.all(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);


    const backupTables =
      await backupDb.all(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);


    assert.deepEqual(
      backupTables.map(
        table => table.name
      ),
      originalTables.map(
        table => table.name
      )
    );


    console.log(
      'PASS TC05 - Schema backup khớp database gốc'
    );


    console.log('');
    console.log(
      'ORD-336 RESULT: PASS'
    );

    console.log(
      'Assertions: 5/5 PASS'
    );


  } finally {

    await originalDb.close();
    await backupDb.close();


    if (
      fs.existsSync(backupPath)
    ) {

      fs.unlinkSync(
        backupPath
      );

    }

  }

}


main().catch(error => {

  console.error('');
  console.error(
    'ORD-336 RESULT: FAIL'
  );

  console.error(error);

  process.exit(1);

});