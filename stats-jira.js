const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(__dirname, '.env.jira');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}
loadEnv();

const JIRA_HOST = (process.env.JIRA_HOST || 'https://ptthongwww.atlassian.net').replace(/\/+$/, '');
const JIRA_EMAIL = process.env.JIRA_EMAIL || 'ptthong.www@gmail.com';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'ORD';
const authHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

async function getStats() {
  let nextPageToken = undefined;
  const maxResults = 100;
  let allIssues = [];

  while (true) {
    const bodyPayload = {
      jql: `project = ${JIRA_PROJECT_KEY}`,
      maxResults,
      fields: ['summary', 'status', 'issuetype', 'priority']
    };
    if (nextPageToken) {
      bodyPayload.nextPageToken = nextPageToken;
    }

    const res = await fetch(`${JIRA_HOST}/rest/api/3/search/jql`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyPayload)
    });

    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    const issues = data.issues || [];
    allIssues = allIssues.concat(issues);
    if (!data.nextPageToken || issues.length === 0) break;
    nextPageToken = data.nextPageToken;
  }

  const byStatus = {};
  const byType = {};
  const byTypeAndStatus = {};

  allIssues.forEach(i => {
    const st = i.fields?.status?.name || 'Unknown';
    const tp = i.fields?.issuetype?.name || 'Task';

    byStatus[st] = (byStatus[st] || 0) + 1;
    byType[tp] = (byType[tp] || 0) + 1;

    if (!byTypeAndStatus[tp]) byTypeAndStatus[tp] = {};
    byTypeAndStatus[tp][st] = (byTypeAndStatus[tp][st] || 0) + 1;
  });

  console.log(`\n======================================================`);
  console.log(`📊 THỐNG KÊ TOÀN DIỆN DỰ ÁN [${JIRA_PROJECT_KEY}]`);
  console.log(`======================================================`);
  console.log(`🔹 Tổng số Tickets / Test Cases: ${allIssues.length}`);
  console.log(`\n📈 THEO TRẠNG THÁI (STATUS):`);
  for (const [st, count] of Object.entries(byStatus)) {
    const percent = ((count / allIssues.length) * 100).toFixed(1);
    console.log(`  • [${st}]: ${count} (${percent}%)`);
  }

  console.log(`\n📂 THEO LOẠI CÔNG VIỆC (ISSUE TYPE):`);
  for (const [tp, count] of Object.entries(byType)) {
    console.log(`  • ${tp}: ${count}`);
    for (const [st, c] of Object.entries(byTypeAndStatus[tp])) {
      console.log(`      └─ [${st}]: ${c}`);
    }
  }

  // Danh sách các tickets chưa Done (nếu có)
  const pendingIssues = allIssues.filter(i => i.fields?.status?.name !== 'Done');
  console.log(`\n📌 DANH SÁCH TICKETS / TEST CASES CHƯA HOÀN THÀNH (${pendingIssues.length} tickets):`);
  if (pendingIssues.length === 0) {
    console.log('  🎉 TẤT CẢ CÁC TICKETS VÀ TEST CASES ĐÃ HOÀN THÀNH (DONE) 100%!');
  } else {
    pendingIssues.forEach(i => {
      console.log(`  • ${i.key.padEnd(10)} [${(i.fields?.status?.name || '').padEnd(12)}] (${i.fields?.issuetype?.name || ''}): ${i.fields?.summary}`);
    });
  }
  console.log(`======================================================\n`);
}

getStats().catch(e => console.error('❌ Lỗi:', e));
