#!/usr/bin/env node

/**
 * Jira Integration CLI for EduLearn Project
 * Connects to Atlassian Jira Cloud REST API
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.jira
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
const JIRA_BOARD_ID = process.env.JIRA_BOARD_ID || '44';

if (!JIRA_API_TOKEN) {
  console.error('❌ Lỗi: JIRA_API_TOKEN chưa được cấu hình trong .env.jira');
  process.exit(1);
}

const authHeader = 'Basic ' + Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

async function jiraFetch(apiPath, options = {}) {
  const url = `${JIRA_HOST}${apiPath.startsWith('/') ? apiPath : '/' + apiPath}`;
  const headers = {
    'Authorization': authHeader,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Jira API HTTP ${res.status} ${res.statusText}: ${errorText}`);
  }
  return res.json();
}

// Convert Jira v3 Atlassian Document Format (ADF) to readable text
function adfToPlainText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(adfToPlainText).join('');
  if (node.text) return node.text;
  if (node.content) {
    const childText = node.content.map(adfToPlainText).join('');
    if (node.type === 'paragraph' || node.type === 'heading') return childText + '\n';
    if (node.type === 'bulletList' || node.type === 'orderedList') return childText + '\n';
    if (node.type === 'listItem') return '  • ' + childText;
    return childText;
  }
  return '';
}

async function getIssue(issueKey) {
  const data = await jiraFetch(`/rest/api/3/issue/${issueKey}`);
  const fields = data.fields || {};
  const description = adfToPlainText(fields.description);

  console.log(`\n======================================================================`);
  console.log(`  🎫 TICKET: ${data.key}`);
  console.log(`======================================================================`);
  console.log(`Summary:     ${fields.summary}`);
  console.log(`Loại:        ${fields.issuetype?.name || 'N/A'}`);
  console.log(`Trạng thái:  ${fields.status?.name || 'N/A'}`);
  console.log(`Ưu tiên:     ${fields.priority?.name || 'N/A'}`);
  console.log(`Người xử lý: ${fields.assignee?.displayName || 'Unassigned'}`);
  console.log(`Người tạo:   ${fields.reporter?.displayName || 'N/A'}`);
  console.log(`Tạo lúc:     ${fields.created}`);
  console.log(`Cập nhật:    ${fields.updated}`);
  if (description.trim()) {
    console.log(`\n--- Chi tiết mô tả (Description) ---`);
    console.log(description.trim());
  }
  console.log(`======================================================================\n`);
  return data;
}

async function listIssues(maxResults = 25) {
  const jql = `project = ${JIRA_PROJECT_KEY} ORDER BY created DESC`;
  const data = await jiraFetch('/rest/api/3/search/jql', {
    method: 'POST',
    body: JSON.stringify({
      jql,
      maxResults,
      fields: ['summary', 'status', 'issuetype', 'priority', 'assignee']
    })
  });
  const issues = data.issues || [];
  console.log(`\n📋 Danh sách ${issues.length} ticket gần nhất trong dự án [${JIRA_PROJECT_KEY}]:\n`);
  issues.forEach((i) => {
    const key = (i.key || '').padEnd(10);
    const status = `[${i.fields?.status?.name || 'Unknown'}]`.padEnd(15);
    const type = `(${i.fields?.issuetype?.name || 'Task'})`.padEnd(10);
    console.log(`${key} ${type} ${status} ${i.fields?.summary || ''}`);
  });
  console.log('');
  return issues;
}

async function getBacklog(maxResults = 50) {
  const data = await jiraFetch(`/rest/agile/1.0/board/${JIRA_BOARD_ID}/issue?maxResults=${maxResults}`);
  const issues = data.issues || [];
  console.log(`\n📌 Backlog Board ${JIRA_BOARD_ID} (${issues.length} issues):\n`);
  issues.forEach((i) => {
    const key = (i.key || '').padEnd(10);
    const status = `[${i.fields?.status?.name || 'Unknown'}]`.padEnd(15);
    console.log(`${key} ${status} ${i.fields?.summary || ''}`);
  });
  console.log('');
  return issues;
}

async function searchIssues(jqlQuery, maxResults = 30) {
  const data = await jiraFetch('/rest/api/3/search/jql', {
    method: 'POST',
    body: JSON.stringify({
      jql: jqlQuery,
      maxResults,
      fields: ['summary', 'status', 'issuetype', 'priority', 'assignee']
    })
  });
  const issues = data.issues || [];
  console.log(`\n🔍 Kết quả tìm kiếm JQL [${jqlQuery}] (${issues.length} issues):\n`);
  issues.forEach((i) => {
    const key = (i.key || '').padEnd(10);
    const status = `[${i.fields?.status?.name || 'Unknown'}]`.padEnd(15);
    const type = `(${i.fields?.issuetype?.name || 'Task'})`.padEnd(10);
    console.log(`${key} ${type} ${status} ${i.fields?.summary || ''}`);
  });
  console.log('');
  return issues;
}

async function addComment(issueKey, commentText) {
  const body = {
    body: {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: commentText
            }
          ]
        }
      ]
    }
  };
  const res = await jiraFetch(`/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
  console.log(`✓ Đã thêm comment thành công vào ticket ${issueKey}`);
  return res;
}

// CLI Routing
const [,, cmd, arg1, ...rest] = process.argv;

(async () => {
  try {
    switch (cmd) {
      case 'get':
      case 'issue':
        if (!arg1) {
          console.log('Cách dùng: node jira.js get <ISSUE_KEY> (ví dụ: node jira.js get ORD-247)');
          process.exit(1);
        }
        await getIssue(arg1.toUpperCase());
        break;

      case 'list':
        const limit = parseInt(arg1, 10) || 20;
        await listIssues(limit);
        break;

      case 'backlog':
        await getBacklog();
        break;

      case 'search':
        if (!arg1) {
          console.log('Cách dùng: node jira.js search "<JQL QUERY>" (ví dụ: node jira.js search "summary ~ Postman")');
          process.exit(1);
        }
        await searchIssues(arg1);
        break;

      case 'comment':
        const commentMsg = [arg1, ...rest].slice(1).join(' ') || rest.join(' ');
        if (!arg1 || !commentMsg) {
          console.log('Cách dùng: node jira.js comment <ISSUE_KEY> "<MESSAGE>"');
          process.exit(1);
        }
        await addComment(arg1.toUpperCase(), commentMsg);
        break;

      default:
        console.log(`
EduLearn Jira Integration CLI

Cách sử dụng:
  node jira.js get <ISSUE_KEY>          Xem chi tiết một ticket (vd: node jira.js get ORD-247)
  node jira.js list [LIMIT]             Danh sách tickets gần nhất trong project ORD
  node jira.js backlog                  Danh sách issues trên Backlog Board 44
  node jira.js search "<JQL>"           Tìm kiếm tickets bằng câu truy vấn JQL
  node jira.js comment <KEY> "<TEXT>"   Thêm comment vào ticket Jira
`);
        break;
    }
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
})();
