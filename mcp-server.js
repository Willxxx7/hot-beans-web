import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Create an MCP server instance
const server = new McpServer({
  name: 'hot-beans-security',
  version: '1.0.0',
});

// --- Tool 1: Check Website Status ---
server.registerTool(
  'check_website_status',
  {
    description: 'Check if the Hot Beans website is currently online',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The website URL to check'),
    },
  },
  async ({ url }) => {
    try {
      const response = await fetch(url);
      const isUp = response.ok;
      return {
        content: [
          {
            type: 'text',
            text: isUp 
              ? `✅ Website is UP! Status: ${response.status} ${response.statusText}`
              : `❌ Website is DOWN! Status: ${response.status} ${response.statusText}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Website is DOWN! Error: ${error.message}` }],
      };
    }
  }
);

// --- Tool 2: Check for Exposed .git Files ---
server.registerTool(
  'check_git_exposure',
  {
    description: 'Check if the .git folder is exposed (security risk)',
    inputSchema: {
      baseUrl: z.string().default('http://127.0.0.1:5500').describe('The website base URL'),
    },
  },
  async ({ baseUrl }) => {
    const filesToCheck = ['/.git/config', '/.git/HEAD'];
    const results = [];

    for (const file of filesToCheck) {
      try {
        const response = await fetch(`${baseUrl}${file}`);
        if (response.ok) {
          results.push({
            file,
            exposed: true,
            status: response.status,
            preview: (await response.text()).substring(0, 100),
          });
        } else {
          results.push({ file, exposed: false, status: response.status });
        }
      } catch (error) {
        results.push({ file, exposed: false, error: error.message });
      }
    }

    const exposedFiles = results.filter(r => r.exposed);
    const text = exposedFiles.length === 0
      ? '✅ No .git files exposed! Good security practice.'
      : `⚠️ WARNING: ${exposedFiles.length} .git file(s) exposed!\n${exposedFiles.map(r => `  - ${r.file} (Status: ${r.status})`).join('\n')}`;

    return { content: [{ type: 'text', text }] };
  }
);

// --- Tool 3: Check Security Headers ---
server.registerTool(
  'check_security_headers',
  {
    description: 'Check security headers like X-Frame-Options, CSP, HSTS',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The website URL to check'),
    },
  },
  async ({ url }) => {
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy',
    ];

    try {
      const response = await fetch(url);
      const headers = response.headers;

      const results = requiredHeaders.map(header => ({
        header,
        present: headers.has(header),
        value: headers.get(header) || 'Missing',
      }));

      const missing = results.filter(r => !r.present);
      const text = missing.length === 0
        ? '✅ All security headers are present!'
        : `⚠️ ${missing.length} security header(s) missing:\n${missing.map(r => `  - ${r.header}`).join('\n')}`;

      return { content: [{ type: 'text', text }] };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Error checking headers: ${error.message}` }],
      };
    }
  }
);

// --- Tool 4: Full Security Scan ---
server.registerTool(
  'full_security_scan',
  {
    description: 'Run a complete security scan on the Hot Beans website and return a detailed report',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The website URL to scan'),
    },
  },
  async ({ url }) => {
    const results = {
      status: { online: false, statusCode: null },
      headers: { present: [], missing: [] },
      gitExposure: { exposed: [], safe: [] }
    };

    // Check status
    try {
      const response = await fetch(url);
      results.status.online = response.ok;
      results.status.statusCode = response.status;
    } catch (error) {
      results.status.online = false;
      results.status.error = error.message;
    }

    // Check headers
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy',
    ];
    try {
      const response = await fetch(url);
      const headers = response.headers;
      for (const header of requiredHeaders) {
        if (headers.has(header)) {
          results.headers.present.push(header);
        } else {
          results.headers.missing.push(header);
        }
      }
    } catch (error) {
      results.headers.error = error.message;
    }

    // Check .git exposure
    const gitFiles = ['/.git/config', '/.git/HEAD'];
    for (const file of gitFiles) {
      try {
        const response = await fetch(`${url}${file}`);
        if (response.ok) {
          results.gitExposure.exposed.push(file);
        } else {
          results.gitExposure.safe.push(file);
        }
      } catch (error) {
        results.gitExposure.safe.push(file);
      }
    }

    // Build report
    const report = `
📋 HOT BEANS SECURITY SCAN REPORT
=================================
Website: ${url}
Timestamp: ${new Date().toLocaleString()}

✅ WEBSITE STATUS
   ${results.status.online ? `✅ Online (Status: ${results.status.statusCode})` : `❌ Offline (${results.status.error || 'Unknown error'})`}

🔒 SECURITY HEADERS
   Present: ${results.headers.present.length > 0 ? results.headers.present.join(', ') : 'None'}
   Missing: ${results.headers.missing.length > 0 ? results.headers.missing.join(', ') : 'None ✅'}

📁 .GIT EXPOSURE
   ${results.gitExposure.exposed.length > 0 ? `⚠️  EXPOSED: ${results.gitExposure.exposed.join(', ')}` : '✅ No .git files exposed'}

📊 SUMMARY
   ${results.gitExposure.exposed.length > 0 ? '⚠️  CRITICAL: .git folder exposed! Fix immediately.' : '✅ Good: No .git exposure detected.'}
   ${results.headers.missing.length > 0 ? `⚠️  WARNING: ${results.headers.missing.length} security headers missing.` : '✅ Good: All security headers present.'}
   ${!results.status.online ? '⚠️  Website is offline or unreachable.' : '✅ Website is accessible.'}
`;
    return { content: [{ type: 'text', text: report }] };
  }
);

// ============================================================
// 🆕 NEW TOOL 5: UX/UI Testing with Markdown Report
// ============================================================

server.registerTool(
  'run_ux_ui_tests',
  {
    description: 'Run UX/UI tests on the Hot Beans website and generate a Markdown report in the test-reports folder',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The website URL to test'),
      tests: z.array(z.string()).optional().describe('Specific tests to run (optional)'),
    },
  },
  async ({ url, tests }) => {
    // Run the UX/UI tests
    const results = await runUXUITests(url, tests);
    
    // Generate Markdown report
    const markdown = generateMarkdownReport(results, url);
    
    // Save to file
    const filepath = saveMarkdownReport(markdown);
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ UX/UI Tests completed!\n\n📊 Summary:\n- Total: ${results.length}\n- Passed: ${results.filter(r => r.status === 'PASS').length}\n- Failed: ${results.filter(r => r.status === 'FAIL').length}\n- Pass Rate: ${Math.round((results.filter(r => r.status === 'PASS').length / results.length) * 100)}%\n\n📁 Report saved to: ${filepath}`
        }
      ]
    };
  }
);

// ============================================================
// UX/UI Test Runner Functions
// ============================================================

/**
 * Run UX/UI tests on the website
 */
async function runUXUITests(url, specificTests = null) {
  console.error('🧪 Running UX/UI tests...');
  
  // Define test cases
  const allTests = [
    {
      id: 'TC-001',
      name: 'Homepage Load',
      description: 'Verify homepage loads successfully',
      testFn: async () => {
        const response = await fetch(url);
        return response.ok;
      }
    },
    {
      id: 'TC-002',
      name: 'Navigation - About Page',
      description: 'Verify About page navigation works',
      testFn: async () => {
        const response = await fetch(`${url}/about.html`);
        return response.ok;
      }
    },
    {
      id: 'TC-003',
      name: 'Navigation - Jobs Page',
      description: 'Verify Jobs page navigation works',
      testFn: async () => {
        const response = await fetch(`${url}/jobs.html`);
        return response.ok;
      }
    },
    {
      id: 'TC-004',
      name: 'Apply Form Submission',
      description: 'Verify application form submits correctly',
      testFn: async () => {
        const response = await fetch(`${url}/apply.html`);
        return response.ok;
      }
    },
    {
      id: 'TC-005',
      name: 'CSS Loading',
      description: 'Verify CSS file loads correctly',
      testFn: async () => {
        const response = await fetch(`${url}/style.css`);
        return response.ok;
      }
    },
    {
      id: 'TC-006',
      name: 'JavaScript Loading',
      description: 'Verify JavaScript file loads correctly',
      testFn: async () => {
        const response = await fetch(`${url}/script.js`);
        return response.ok;
      }
    },
    {
      id: 'TC-007',
      name: 'Security Headers Present',
      description: 'Verify all security headers are present',
      testFn: async () => {
        const response = await fetch(url);
        const headers = response.headers;
        const requiredHeaders = ['X-Frame-Options', 'X-Content-Type-Options', 'Strict-Transport-Security', 'Content-Security-Policy', 'Referrer-Policy'];
        return requiredHeaders.every(h => headers.has(h));
      }
    }
  ];
  
  // Filter tests if specific ones requested
  const testsToRun = specificTests 
    ? allTests.filter(t => specificTests.includes(t.id))
    : allTests;
  
  const results = [];
  
  for (const test of testsToRun) {
    const startTime = Date.now();
    try {
      const passed = await test.testFn();
      const duration = Date.now() - startTime;
      
      results.push({
        ...test,
        status: passed ? 'PASS' : 'FAIL',
        duration: `${duration}ms`,
        error: passed ? null : 'Test failed'
      });
      
      console.error(`  ${passed ? '✅' : '❌'} ${test.id}: ${test.name} (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({
        ...test,
        status: 'ERROR',
        duration: `${duration}ms`,
        error: error.message
      });
      console.error(`  ⚠️ ${test.id}: ${test.name} - ERROR: ${error.message}`);
    }
  }
  
  return results;
}

/**
 * Generate Markdown report from test results
 */
function generateMarkdownReport(results, url) {
  const timestamp = new Date().toISOString();
  const total = results.length;
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  const passRate = Math.round((passed / total) * 100);
  
  let markdown = `# 🧪 UX/UI Test Report\n\n`;
  markdown += `**Website:** Hot Beans Web\n`;
  markdown += `**URL:** ${url}\n`;
  markdown += `**Date:** ${timestamp}\n`;
  markdown += `**Tester:** AI Test Runner (MCP Server)\n\n`;
  
  // Summary
  markdown += `## 📊 Test Summary\n\n`;
  markdown += `| Metric | Value |\n`;
  markdown += `|--------|-------|\n`;
  markdown += `| Total Tests | ${total} |\n`;
  markdown += `| ✅ Passed | ${passed} |\n`;
  markdown += `| ❌ Failed | ${failed} |\n`;
  markdown += `| ⚠️ Errors | ${errors} |\n`;
  markdown += `| 📈 Pass Rate | ${passRate}% |\n\n`;
  
  // Detailed results
  markdown += `## 📋 Test Results\n\n`;
  markdown += `| Test ID | Test Name | Description | Status | Duration | Error |\n`;
  markdown += `|---------|-----------|-------------|--------|----------|-------|\n`;
  
  for (const test of results) {
    const statusEmoji = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
    const error = test.error || '-';
    markdown += `| ${test.id} | ${test.name} | ${test.description} | ${statusEmoji} ${test.status} | ${test.duration} | ${error} |\n`;
  }
  
  // Issues section
  const failures = results.filter(r => r.status === 'FAIL' || r.status === 'ERROR');
  if (failures.length > 0) {
    markdown += `\n## 🐛 Issues Found\n\n`;
    for (const failure of failures) {
      markdown += `### ${failure.id} - ${failure.name}\n\n`;
      markdown += `**Issue:** ${failure.error}\n\n`;
      markdown += `**Description:** ${failure.description}\n\n`;
      markdown += `**Fix Recommendation:** \n`;
      markdown += `- [ ] Investigate the issue\n`;
      markdown += `- [ ] Fix the code\n`;
      markdown += `- [ ] Re-run test\n\n`;
    }
  }
  
  // Recommendations
  markdown += `\n## 💡 Recommendations\n\n`;
  if (passRate === 100) {
    markdown += `✅ All tests passed! The website is functioning correctly.\n\n`;
    markdown += `**Next steps:**\n`;
    markdown += `- Consider adding more tests for edge cases\n`;
    markdown += `- Test on different browsers\n`;
    markdown += `- Run security scan with \`full_security_scan\` tool\n`;
  } else {
    markdown += `⚠️ ${failed + errors} test(s) failed or had errors. Please review the issues above.\n\n`;
    markdown += `**Recommended actions:**\n`;
    markdown += `- Fix the failing tests\n`;
    markdown += `- Re-run the test suite\n`;
    markdown += `- Update test cases if needed\n`;
  }
  
  markdown += `\n## 📁 Report Location\n\n`;
  markdown += `This report has been saved to: \`./test-reports/ux-ui-test-${Date.now()}.md\`\n`;
  
  return markdown;
}

/**
 * Save Markdown report to file
 */
function saveMarkdownReport(markdown) {
  const dir = './test-reports';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filename = `ux-ui-test-${Date.now()}.md`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, markdown);
  console.error(`📄 Report saved to: ${filepath}`);
  return filepath;
}

// --- Start the server ---
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🔥 Hot Beans Security MCP Server running on stdio');
console.error('📋 Available tools:');
console.error('  - check_website_status');
console.error('  - check_git_exposure');
console.error('  - check_security_headers');
console.error('  - full_security_scan');
console.error('  - run_ux_ui_tests 🆕');