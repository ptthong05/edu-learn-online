/* global Feature, Scenario, AfterSuite, inject */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { createRequire } = require('node:module');
const { performance } = require('node:perf_hooks');


/* =========================================================
   PROJECT PATHS
========================================================= */

const projectRoot = path.resolve(
  __dirname,
  '../../../..'
);

const backendDir = path.join(
  projectRoot,
  'edu-learn-project',
  'backend'
);

const backendRequire = createRequire(
  path.join(
    backendDir,
    'package.json'
  )
);


/* =========================================================
   BACKEND DEPENDENCIES
========================================================= */

const sqlite3 =
  backendRequire('sqlite3');

const { open } =
  backendRequire('sqlite');

const jwt =
  backendRequire('jsonwebtoken');


/* =========================================================
   ENVIRONMENT
========================================================= */

const apiBaseUrl =
  process.env.API_BASE_URL ||
  'http://localhost:5000';

const frontendBaseUrl =
  process.env.FRONTEND_BASE_URL ||
  'http://localhost:3000';

const databasePath = path.join(
  backendDir,
  'database.sqlite'
);

const jwtSecret =
  process.env.JWT_SECRET ||
  'edulearn_super_secret_key_123!@#';


/* =========================================================
   TEST ACCOUNTS
========================================================= */

const credentials = {
  manager: {
    email:
      process.env.TEST_MANAGER_EMAIL ||
      'manager@edulearn.vn',

    password:
      process.env.TEST_MANAGER_PASSWORD ||
      'admin123'
  },

  user: {
    email:
      process.env.TEST_USER_EMAIL ||
      'tuan.nguyen@gmail.com',

    password:
      process.env.TEST_USER_PASSWORD ||
      'user123'
  }
};


/* =========================================================
   CODECEPTJS RUNTIME CHECK
========================================================= */

function ensureCodeceptRuntime() {
  if (
    typeof Feature !== 'function' ||
    typeof Scenario !== 'function' ||
    typeof AfterSuite !== 'function'
  ) {
    throw new Error(
      [
        'Không tìm thấy CodeceptJS runtime.',
        '',
        'Không chạy file test bằng node.',
        '',
        'Hãy chạy bằng:',
        'npx codeceptjs run tests/ORD-269/ORD-xxx_test.js'
      ].join('\n')
    );
  }
}


/* =========================================================
   GIT
========================================================= */

function getGitValue(
  args,
  fallback = 'unknown'
) {
  try {
    return execFileSync(
      'git',
      args,
      {
        cwd: projectRoot,
        encoding: 'utf8',
        stdio: [
          'ignore',
          'pipe',
          'ignore'
        ]
      }
    ).trim();
  } catch {
    return fallback;
  }
}


/* =========================================================
   FORMAT VALUE
========================================================= */

function valueToText(value) {
  if (value === undefined) {
    return '';
  }

  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}


/* =========================================================
   HTTP REQUEST
========================================================= */

async function requestJson(
  route,
  options = {}
) {
  const {
    timeoutMs = 15000,
    ...fetchOptions
  } = options;

  const controller =
    new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    timeoutMs
  );

  let body =
    fetchOptions.body;

  if (
    body &&
    typeof body !== 'string' &&
    !Buffer.isBuffer(body)
  ) {
    body =
      JSON.stringify(body);
  }

  try {
    const response =
      await fetch(
        `${apiBaseUrl}${route}`,
        {
          ...fetchOptions,

          body,

          signal:
            controller.signal,

          headers: {
            ...(
              body
                ? {
                    'Content-Type':
                      'application/json'
                  }
                : {}
            ),

            ...(
              fetchOptions.headers ||
              {}
            )
          }
        }
      );

    const rawBody =
      await response.text();

    let parsedBody =
      rawBody;

    if (rawBody) {
      try {
        parsedBody =
          JSON.parse(rawBody);
      } catch {
        // Response không phải JSON.
      }
    }

    return {
      status:
        response.status,

      headers:
        Object.fromEntries(
          response.headers.entries()
        ),

      body:
        parsedBody
    };
  } finally {
    clearTimeout(timer);
  }
}


/* =========================================================
   LOGIN
========================================================= */

async function login(
  email,
  password
) {
  return requestJson(
    '/api/auth/login',
    {
      method: 'POST',

      body: {
        email,
        password
      }
    }
  );
}


/* =========================================================
   AUTH HEADER
========================================================= */

function bearer(token) {
  return {
    Authorization:
      `Bearer ${token}`
  };
}


/* =========================================================
   DATABASE
========================================================= */

async function withDatabase(
  callback
) {
  const database =
    await open({
      filename:
        databasePath,

      driver:
        sqlite3.Database
    });

  try {
    await database.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
    `);

    return await callback(
      database
    );
  } finally {
    await database.close();
  }
}


/* =========================================================
   UNIQUE USER
========================================================= */

function uniqueUser(
  prefix = 'uat'
) {
  const seed =
    `${Date.now()}` +
    `${Math.floor(
      Math.random() * 1000
    )}`;

  return {
    full_name:
      `Test ${prefix.toUpperCase()}`,

    email:
      `${prefix}.${seed}@edulearn.test`,

    phone:
      `09${seed.slice(-8)}`,

    password:
      'Test@1234'
  };
}


/* =========================================================
   EXPIRED JWT
========================================================= */

function expiredToken(
  payload = {}
) {
  return jwt.sign(
    {
      id:
        'expired-test-user',

      email:
        'expired@edulearn.test',

      role:
        'USER',

      status:
        'active',

      ...payload
    },

    jwtSecret,

    {
      expiresIn: -10
    }
  );
}


/* =========================================================
   CREATE JIRA SUITE
========================================================= */

function createJiraSuite({
  ticket,
  title
}) {
  ensureCodeceptRuntime();

  Feature(
    `${ticket} - ${title}`
  );

  const results = [];
  const cleanupTasks = [];
  const cleanupErrors = [];


  /* =======================================================
     REPORT PATH
  ======================================================= */

  const reportDirectory =
    path.join(
      projectRoot,
      'automation-tests',
      'output',
      'ORD-269'
    );

  const markdownReport =
    path.join(
      reportDirectory,
      `${ticket}-report.md`
    );

  const jsonReport =
    path.join(
      reportDirectory,
      `${ticket}-results.json`
    );


  /* =======================================================
     CLEANUP
  ======================================================= */

  function deferCleanup(
    callback
  ) {
    if (
      typeof callback !==
      'function'
    ) {
      throw new TypeError(
        'deferCleanup yêu cầu callback là function.'
      );
    }

    cleanupTasks.unshift(
      callback
    );
  }


  /* =======================================================
     SCENARIO WRAPPER
  ======================================================= */

  function scenario(
    metadata,
    callback
  ) {
    if (
      !metadata ||
      !metadata.id ||
      !metadata.name
    ) {
      throw new Error(
        'Scenario phải có metadata.id và metadata.name.'
      );
    }

    if (
      typeof callback !==
      'function'
    ) {
      throw new TypeError(
        `${metadata.id}: callback phải là function.`
      );
    }

    const normalizedMetadata = {
      inputs: '',
      steps: [],
      expected: '',
      evidence: '',
      ...metadata
    };

    if (
      !Array.isArray(
        normalizedMetadata.steps
      )
    ) {
      normalizedMetadata.steps = [
        valueToText(
          normalizedMetadata.steps
        )
      ];
    }


    Scenario(
      `${normalizedMetadata.id} ` +
      `[${ticket}] ` +
      `${normalizedMetadata.name}`,

      async () => {
        const startedAt =
          performance.now();

        try {

          /*
           * Lấy actor I từ CodeceptJS container.
           *
           * API/Database test không cần I
           * vẫn có thể chạy bình thường.
           *
           * UI test sẽ sử dụng I nếu
           * CodeceptJS cung cấp actor.
           */

          let I;

          if (
            typeof inject ===
            'function'
          ) {
            const injected =
              inject();

            if (injected) {
              I =
                injected.I;
            }
          }


          const actual =
            await callback({
              I,

              requestJson,

              login,

              bearer,

              withDatabase,

              uniqueUser,

              expiredToken,

              credentials,

              apiBaseUrl,

              frontendBaseUrl,

              databasePath,

              jwtSecret,

              deferCleanup
            });


          results.push({
            ...normalizedMetadata,

            actual:
              valueToText(actual),

            status:
              'PASSED',

            durationMs:
              Number(
                (
                  performance.now() -
                  startedAt
                ).toFixed(2)
              )
          });

        } catch (error) {

          results.push({
            ...normalizedMetadata,

            actual:
              error &&
              error.message
                ? error.message
                : String(error),

            status:
              'FAILED',

            durationMs:
              Number(
                (
                  performance.now() -
                  startedAt
                ).toFixed(2)
              )
          });

          throw error;
        }
      }
    );
  }


  /* =======================================================
     AFTER SUITE
  ======================================================= */

  AfterSuite(
    async () => {

      /* ---------------------------------------------------
         CLEAN TEST DATA
      --------------------------------------------------- */

      for (
        const cleanup
        of cleanupTasks
      ) {
        try {
          await cleanup();
        } catch (error) {
          cleanupErrors.push(
            error &&
            error.message
              ? error.message
              : String(error)
          );
        }
      }


      /* ---------------------------------------------------
         RESULT
      --------------------------------------------------- */

      const testedAt =
        new Date().toISOString();

      const passed =
        results.filter(
          result =>
            result.status ===
            'PASSED'
        ).length;

      const failed =
        results.filter(
          result =>
            result.status ===
            'FAILED'
        ).length;


      /* ---------------------------------------------------
         GIT ENV
      --------------------------------------------------- */

      const branch =
        getGitValue([
          'rev-parse',
          '--abbrev-ref',
          'HEAD'
        ]);

      const commit =
        getGitValue([
          'rev-parse',
          '--short',
          'HEAD'
        ]);


      /* ---------------------------------------------------
         MARKDOWN
      --------------------------------------------------- */

      const lines = [
        `# Báo cáo ${ticket} - ${title}`,

        '',

        '- **Story cha:** ORD-269',

        '- **Sprint:** Sprint 7 - UAT & Regression',

        `- **Nhánh:** ${branch}`,

        `- **Commit:** ${commit}`,

        `- **Node.js:** ${process.version}`,

        `- **Hệ điều hành:** ` +
          `${os.platform()} ` +
          `${os.release()}`,

        '- **Người thực hiện:** Trương Văn Long',

        `- **Ngày test:** ${testedAt}`,

        `- **Frontend:** ${frontendBaseUrl}`,

        `- **Backend:** ${apiBaseUrl}`,

        `- **Database:** ${databasePath}`,

        `- **Kết quả:** ` +
          `${passed}/${results.length} PASSED, ` +
          `${failed} FAILED`,

        '',

        '## Tổng hợp',

        '',

        '| Test Case | Nội dung | Trạng thái | Thời gian |',

        '|---|---|---:|---:|',

        ...results.map(
          result =>
            `| ${result.id} | ` +
            `${result.name} | ` +
            `${result.status} | ` +
            `${result.durationMs} ms |`
        ),

        ''
      ];


      /* ---------------------------------------------------
         TEST DETAILS
      --------------------------------------------------- */

      for (
        const result
        of results
      ) {
        lines.push(
          `## ${result.id}: ${result.name}`,

          '',

          `- **Mã Jira:** ${ticket}`,

          `- **Dữ liệu test:** ` +
            `${valueToText(
              result.inputs
            )}`,

          '- **Các bước thực hiện:**',

          ...result.steps.map(
            (step, index) =>
              `  ${index + 1}. ${step}`
          ),

          `- **Kết quả mong đợi:** ` +
            `${valueToText(
              result.expected
            )}`,

          `- **Kết quả thực tế:** ` +
            `${valueToText(
              result.actual
            )}`,

          `- **Trạng thái:** ` +
            `${result.status}`,

          `- **Thời gian:** ` +
            `${result.durationMs} ms`,

          `- **Bằng chứng:** ` +
            `${
              result.evidence ||
              (
                `${ticket}-report.md ` +
                'và output CodeceptJS'
              )
            }`,

          ''
        );
      }


      /* ---------------------------------------------------
         CLEANUP RESULT
      --------------------------------------------------- */

      lines.push(
        '## Dọn dữ liệu kiểm thử',

        '',

        cleanupErrors.length === 0
          ? '- Thành công.'
          : (
              '- Có lỗi: ' +
              cleanupErrors.join('; ')
            ),

        ''
      );


      /* ---------------------------------------------------
         CREATE DIRECTORY
      --------------------------------------------------- */

      fs.mkdirSync(
        reportDirectory,
        {
          recursive: true
        }
      );


      /* ---------------------------------------------------
         WRITE MARKDOWN
      --------------------------------------------------- */

      fs.writeFileSync(
        markdownReport,

        `${lines.join('\n')}\n`,

        'utf8'
      );


      /* ---------------------------------------------------
         WRITE JSON
      --------------------------------------------------- */

      fs.writeFileSync(
        jsonReport,

        `${JSON.stringify(
          {
            ticket,

            title,

            parent:
              'ORD-269',

            tester:
              'Trương Văn Long',

            testedAt,

            environment: {
              branch,

              commit,

              node:
                process.version,

              platform:
                `${os.platform()} ` +
                `${os.release()}`,

              frontendBaseUrl,

              apiBaseUrl,

              databasePath
            },

            summary: {
              total:
                results.length,

              passed,

              failed
            },

            cleanupErrors,

            results
          },

          null,
          2
        )}\n`,

        'utf8'
      );


      /* ---------------------------------------------------
         CONSOLE OUTPUT
      --------------------------------------------------- */

      console.log(
        `${ticket} report: ` +
        markdownReport
      );

      if (
        cleanupErrors.length > 0
      ) {
        console.warn(
          'Cleanup warnings: ' +
          cleanupErrors.join('; ')
        );
      }
    }
  );


  /* =======================================================
     RETURN
  ======================================================= */

  return {
    scenario
  };
}


/* =========================================================
   EXPORT
========================================================= */

module.exports = {
  createJiraSuite
};