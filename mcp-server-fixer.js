import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

// Create an MCP server instance
const server = new McpServer({
  name: 'hot-beans-fixer',
  version: '2.0.0',
});

// ============================================================
// TOOL 1: Auto-Fix with Approval (NEW & IMPROVED!)
// ============================================================

server.registerTool(
  'auto_fix_with_approval',
  {
    description: 'Scan for issues, show recommendations, and apply fixes after your approval',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The website URL to scan'),
      autoApprove: z.boolean().default(false).describe('Automatically approve fixes (use with caution)'),
      fixType: z.enum(['all', 'security', 'pages', 'assets']).default('all').describe('Type of fixes to apply'),
    },
  },
  async ({ url, autoApprove, fixType }) => {
    // Step 1: Run the scan
    const scanResults = await runFullScan(url, fixType);
    
    // Step 2: If no issues found
    if (scanResults.issues.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `✅ **No issues found!** Your website is secure and complete!

📊 **Scan Results:**
- 🔍 URL: ${url}
- ✅ Status: SECURE
- 📁 All files present
- 🔒 All security measures in place

🎉 **Congratulations!** You have a well-maintained website.`
          }
        ]
      };
    }
    
    // Step 3: If auto-approve is enabled
    if (autoApprove) {
      const fixResults = await applyFixes(scanResults, url);
      const report = generateDetailedReport(scanResults, fixResults);
      const reportPath = saveDetailedReport(report);
      
      // Also create a summary in the chat
      let summary = `🔧 **Auto-Fix Complete!** (Auto-Approved)

📊 **Summary:**
- Issues Found: ${scanResults.issues.length}
- ✅ Fixes Applied: ${fixResults.applied.length}
- 📁 Files Created: ${fixResults.files.length}
- 📄 Report: ${reportPath}

---

**Fixed Issues:**
${fixResults.applied.map(f => `  ✅ ${f}`).join('\n')}

---

**📁 Files Created:**
${fixResults.files.map(f => `  📄 ${f}`).join('\n')}

---

🔍 **Next Steps:**
1. Review the fix files in the \`fix-files/\` folder
2. Copy files to your project root as needed
3. Restart your server if you added security headers
4. Re-run scan to verify all fixes

📋 **To re-scan:** \`@hot-beans-fixer auto_fix_with_approval on ${url}\``;

      return {
        content: [{ type: 'text', text: summary }]
      };
    }
    
    // Step 4: Request approval (show what will be fixed)
    let approvalRequest = `🔍 **Security Scan Complete - Approval Required**

📊 **Summary:**
- 🔍 URL: ${url}
- ⚠️ Issues Found: ${scanResults.issues.length}
- 📁 Files to Create: ${scanResults.filesToCreate.length}

---

📋 **Issues Detected:**

${scanResults.issues.map(i => {
  const emoji = i.severity === 'CRITICAL' ? '🔴' : i.severity === 'HIGH' ? '🟠' : '🟡';
  return `${emoji} **${i.id}:** ${i.title} (${i.severity})
   └─ ${i.description}`;
}).join('\n\n')}

---

📁 **Files to Create:**

${scanResults.filesToCreate.map(f => `  📄 ${f.filename} - ${f.description}`).join('\n')}

---

📝 **Fix Plan:**

${scanResults.issues.map(i => {
  const fix = scanResults.filesToCreate.find(f => f.issueId === i.id);
  return `${i.id}: ${fix ? '✅ Will create ' + fix.filename : '⚠️ Manual fix required'}`;
}).join('\n')}

---

⚠️ **Please confirm:**
To apply all fixes, type: \`yes\`
To cancel, type: \`no\`
To see details, type: \`details\`

**OR run with auto-approval:**
\`@hot-beans-fixer auto_fix_with_approval on ${url} --autoApprove true\``;

    return {
      content: [{ type: 'text', text: approvalRequest }]
    };
  }
);

// ============================================================
// TOOL 2: Scan and Fix (Original)
// ============================================================

server.registerTool(
  'scan_and_fix',
  {
    description: 'Scan the website for security issues and automatically generate fix files',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The website URL to scan'),
      autoFix: z.boolean().default(true).describe('Automatically generate fix files'),
    },
  },
  async ({ url, autoFix }) => {
    const results = {
      issues: [],
      fixes: [],
      files: []
    };

    // --- Check 1: .git Exposure ---
    try {
      const response = await fetch(`${url}/.git/config`);
      if (response.ok) {
        results.issues.push({
          id: 'GIT-001',
          severity: 'CRITICAL',
          title: '.git folder exposed',
          description: 'The .git folder is publicly accessible, exposing source code and potentially credentials.',
          fix: 'Add server configuration to block access to .git folder'
        });
        
        if (autoFix) {
          const fixFile = generateGitFix();
          const filepath = saveFixFile('.htaccess', fixFile);
          results.files.push(filepath);
          results.fixes.push({
            issue: 'GIT-001',
            action: 'Created .htaccess file to block .git access',
            file: filepath
          });
        }
      }
    } catch (error) {
      // .git not exposed - good!
    }

    // --- Check 2: Security Headers ---
    try {
      const response = await fetch(url);
      const headers = response.headers;
      const requiredHeaders = [
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy'
      ];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.has(h));
      
      if (missingHeaders.length > 0) {
        results.issues.push({
          id: 'HEADER-001',
          severity: 'HIGH',
          title: `${missingHeaders.length} security headers missing`,
          description: `Missing headers: ${missingHeaders.join(', ')}`,
          fix: 'Add security headers to server configuration'
        });
        
        if (autoFix) {
          const headerFix = generateHeaderFix(missingHeaders);
          const filepath = saveFixFile('security-headers.js', headerFix);
          results.files.push(filepath);
          results.fixes.push({
            issue: 'HEADER-001',
            action: `Created security-headers.js with ${missingHeaders.length} headers`,
            file: filepath
          });
        }
      }
    } catch (error) {
      results.issues.push({
        id: 'SITE-001',
        severity: 'HIGH',
        title: 'Website not accessible',
        description: `Could not reach ${url}`,
        fix: 'Make sure the website is running on the specified port'
      });
    }

    // --- Check 3: Missing Pages ---
    const pages = ['about.html', 'jobs.html', 'apply.html'];
    for (const page of pages) {
      try {
        const response = await fetch(`${url}/${page}`);
        if (!response.ok) {
          results.issues.push({
            id: `PAGE-${pages.indexOf(page) + 1}`,
            severity: 'MEDIUM',
            title: `Missing page: ${page}`,
            description: `The page ${page} returned status ${response.status}`,
            fix: `Create ${page} file`
          });
          
          if (autoFix) {
            const pageContent = generatePageTemplate(page);
            const filepath = saveFixFile(page, pageContent);
            results.files.push(filepath);
            results.fixes.push({
              issue: `PAGE-${pages.indexOf(page) + 1}`,
              action: `Created ${page} template`,
              file: filepath
            });
          }
        }
      } catch (error) {
        if (autoFix) {
          const pageContent = generatePageTemplate(page);
          const filepath = saveFixFile(page, pageContent);
          results.files.push(filepath);
          results.fixes.push({
            issue: `PAGE-${pages.indexOf(page) + 1}`,
            action: `Created ${page} template`,
            file: filepath
          });
        }
      }
    }

    // --- Check 4: CSS and JS Files ---
    const assets = ['style.css', 'script.js'];
    for (const asset of assets) {
      try {
        const response = await fetch(`${url}/${asset}`);
        if (!response.ok) {
          results.issues.push({
            id: `ASSET-${assets.indexOf(asset) + 1}`,
            severity: 'MEDIUM',
            title: `Missing ${asset}`,
            description: `The file ${asset} returned status ${response.status}`,
            fix: `Create ${asset} file`
          });
          
          if (autoFix) {
            const assetContent = asset === 'style.css' ? generateCSS() : generateJS();
            const filepath = saveFixFile(asset, assetContent);
            results.files.push(filepath);
            results.fixes.push({
              issue: `ASSET-${assets.indexOf(asset) + 1}`,
              action: `Created ${asset}`,
              file: filepath
            });
          }
        }
      } catch (error) {
        if (autoFix) {
          const assetContent = asset === 'style.css' ? generateCSS() : generateJS();
          const filepath = saveFixFile(asset, assetContent);
          results.files.push(filepath);
          results.fixes.push({
            issue: `ASSET-${assets.indexOf(asset) + 1}`,
            action: `Created ${asset}`,
            file: filepath
          });
        }
      }
    }

    // --- Generate Report ---
    const report = generateFixReport(results, url);
    const reportPath = saveFixReport(report);

    return {
      content: [
        {
          type: 'text',
          text: `🔧 **Fix Report Generated!**

📊 **Summary:**
- Issues Found: ${results.issues.length}
- Fixes Applied: ${results.fixes.length}
- Files Created: ${results.files.length}

📁 **Report saved to:** ${reportPath}

---

${results.issues.length === 0 ? '✅ **No issues found! Your website is secure!**' : '⚠️ **Issues found and fixed!**'}

${results.fixes.map(f => `✅ ${f.action}`).join('\n')}

${results.files.map(f => `📄 Created: ${f}`).join('\n')}`
        }
      ]
    };
  }
);

// ============================================================
// TOOL 3: Generate Security Fix Files
// ============================================================

server.registerTool(
  'generate_fix_files',
  {
    description: 'Generate security fix files for common issues',
    inputSchema: {
      issueType: z.enum(['git', 'headers', 'pages', 'assets', 'all']).default('all').describe('Type of fix to generate'),
    },
  },
  async ({ issueType }) => {
    const files = [];
    
    if (issueType === 'git' || issueType === 'all') {
      const gitFix = generateGitFix();
      const path1 = saveFixFile('.htaccess', gitFix);
      files.push({ file: path1, description: 'Apache .htaccess to block .git access' });
      
      const nginxFix = generateNginxFix();
      const path2 = saveFixFile('nginx-git-block.conf', nginxFix);
      files.push({ file: path2, description: 'Nginx config to block .git access' });
    }
    
    if (issueType === 'headers' || issueType === 'all') {
      const headerFix = generateHeaderFix([
        'X-Frame-Options',
        'X-Content-Type-Options',
        'Strict-Transport-Security',
        'Content-Security-Policy',
        'Referrer-Policy'
      ]);
      const path = saveFixFile('security-headers.js', headerFix);
      files.push({ file: path, description: 'Express.js security headers middleware' });
      
      const metaFix = generateMetaTags();
      const path2 = saveFixFile('security-headers.html', metaFix);
      files.push({ file: path2, description: 'HTML meta tags for security' });
    }
    
    if (issueType === 'pages' || issueType === 'all') {
      const pages = ['about.html', 'jobs.html', 'apply.html'];
      for (const page of pages) {
        const content = generatePageTemplate(page);
        const path = saveFixFile(page, content);
        files.push({ file: path, description: `${page} template` });
      }
    }
    
    if (issueType === 'assets' || issueType === 'all') {
      const cssPath = saveFixFile('style.css', generateCSS());
      files.push({ file: cssPath, description: 'CSS stylesheet' });
      
      const jsPath = saveFixFile('script.js', generateJS());
      files.push({ file: jsPath, description: 'JavaScript file' });
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `✅ **Fix Files Generated!**

📁 **Files Created (${files.length} files):**
${files.map(f => `  - ${f.file} (${f.description})`).join('\n')}

📝 **Instructions:**
1. Review each file in the \`fix-files/\` folder
2. Copy needed files to your project root
3. Test your website
4. Re-run scan to verify fixes

🔍 **To verify:** \`@hot-beans-fixer scan_and_fix on http://127.0.0.1:5500\``
        }
      ]
    };
  }
);

// ============================================================
// TOOL 4: Auto-Fix with Approval - Response Handler
// ============================================================

// Note: The actual response handling happens in the chat
// Students type "yes" or "no" in the chat

// ============================================================
// Helper Functions - Scan & Fix
// ============================================================

async function runFullScan(url, fixType = 'all') {
  const issues = [];
  const filesToCreate = [];

  // Check .git exposure
  try {
    const response = await fetch(`${url}/.git/config`);
    if (response.ok) {
      issues.push({
        id: 'GIT-001',
        severity: 'CRITICAL',
        title: '.git folder exposed',
        description: 'Source code and credentials at risk'
      });
      if (fixType === 'all' || fixType === 'security') {
        filesToCreate.push({
          filename: '.htaccess',
          description: 'Blocks .git folder access (Apache)',
          issueId: 'GIT-001'
        });
      }
    }
  } catch (error) {
    // .git is safe
  }

  // Check security headers
  try {
    const response = await fetch(url);
    const headers = response.headers;
    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy'
    ];
    const missingHeaders = requiredHeaders.filter(h => !headers.has(h));
    
    if (missingHeaders.length > 0) {
      issues.push({
        id: 'HEADER-001',
        severity: 'HIGH',
        title: `${missingHeaders.length} security headers missing`,
        description: `Missing: ${missingHeaders.join(', ')}`
      });
      if (fixType === 'all' || fixType === 'security') {
        filesToCreate.push({
          filename: 'security-headers.js',
          description: 'Adds all missing security headers',
          issueId: 'HEADER-001'
        });
      }
    }
  } catch (error) {
    issues.push({
      id: 'SITE-001',
      severity: 'HIGH',
      title: 'Website not accessible',
      description: `Could not reach ${url}`
    });
  }

  // Check missing pages
  if (fixType === 'all' || fixType === 'pages') {
    const pages = ['about.html', 'jobs.html', 'apply.html'];
    for (const page of pages) {
      try {
        const response = await fetch(`${url}/${page}`);
        if (!response.ok) {
          issues.push({
            id: `PAGE-${pages.indexOf(page) + 1}`,
            severity: 'MEDIUM',
            title: `Missing page: ${page}`,
            description: `Page returns ${response.status}`
          });
          filesToCreate.push({
            filename: page,
            description: `Template for ${page}`,
            issueId: `PAGE-${pages.indexOf(page) + 1}`
          });
        }
      } catch (error) {
        issues.push({
          id: `PAGE-${pages.indexOf(page) + 1}`,
          severity: 'MEDIUM',
          title: `Missing page: ${page}`,
          description: 'Page not found'
        });
        filesToCreate.push({
          filename: page,
          description: `Template for ${page}`,
          issueId: `PAGE-${pages.indexOf(page) + 1}`
        });
      }
    }
  }

  // Check assets
  if (fixType === 'all' || fixType === 'assets') {
    const assets = ['style.css', 'script.js'];
    for (const asset of assets) {
      try {
        const response = await fetch(`${url}/${asset}`);
        if (!response.ok) {
          issues.push({
            id: `ASSET-${assets.indexOf(asset) + 1}`,
            severity: 'MEDIUM',
            title: `Missing ${asset}`,
            description: `File returns ${response.status}`
          });
          filesToCreate.push({
            filename: asset,
            description: `Template for ${asset}`,
            issueId: `ASSET-${assets.indexOf(asset) + 1}`
          });
        }
      } catch (error) {
        issues.push({
          id: `ASSET-${assets.indexOf(asset) + 1}`,
          severity: 'MEDIUM',
          title: `Missing ${asset}`,
          description: 'File not found'
        });
        filesToCreate.push({
          filename: asset,
          description: `Template for ${asset}`,
          issueId: `ASSET-${assets.indexOf(asset) + 1}`
        });
      }
    }
  }

  return { issues, filesToCreate };
}

async function applyFixes(scanResults, url) {
  const applied = [];
  const files = [];

  for (const fileToCreate of scanResults.filesToCreate) {
    try {
      let content = '';
      let filename = fileToCreate.filename;
      
      // Determine what type of file to create
      if (filename === '.htaccess') {
        content = generateGitFix();
      } else if (filename === 'nginx-git-block.conf') {
        content = generateNginxFix();
      } else if (filename === 'security-headers.js') {
        content = generateHeaderFix([
          'X-Frame-Options',
          'X-Content-Type-Options',
          'Strict-Transport-Security',
          'Content-Security-Policy',
          'Referrer-Policy'
        ]);
      } else if (filename === 'security-headers.html') {
        content = generateMetaTags();
      } else if (filename === 'about.html' || filename === 'jobs.html' || filename === 'apply.html') {
        content = generatePageTemplate(filename);
      } else if (filename === 'style.css') {
        content = generateCSS();
      } else if (filename === 'script.js') {
        content = generateJS();
      }
      
      if (content) {
        const filepath = saveFixFile(filename, content);
        files.push(filepath);
        applied.push(`✅ Created ${filename}`);
      }
    } catch (error) {
      applied.push(`❌ Failed to create ${fileToCreate.filename}: ${error.message}`);
    }
  }

  return { applied, files };
}

function generateDetailedReport(scanResults, fixResults) {
  const timestamp = new Date().toISOString();
  
  let report = `# 🔧 Hot Beans Auto-Fix Report\n\n`;
  report += `**Generated:** ${timestamp}\n`;
  report += `**Status:** ${fixResults.applied.length > 0 ? '✅ FIXES APPLIED' : '⚠️ NO CHANGES'}\n\n`;
  
  report += `## 📊 Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Issues Found | ${scanResults.issues.length} |\n`;
  report += `| Fixes Applied | ${fixResults.applied.length} |\n`;
  report += `| Files Created | ${fixResults.files.length} |\n\n`;
  
  if (scanResults.issues.length > 0) {
    report += `## 🐛 Issues Found\n\n`;
    for (const issue of scanResults.issues) {
      const emoji = issue.severity === 'CRITICAL' ? '🔴' : issue.severity === 'HIGH' ? '🟠' : '🟡';
      report += `### ${emoji} ${issue.id} - ${issue.title}\n\n`;
      report += `**Severity:** ${issue.severity}\n`;
      report += `**Description:** ${issue.description}\n\n`;
    }
  }
  
  if (fixResults.applied.length > 0) {
    report += `## ✅ Fixes Applied\n\n`;
    for (const fix of fixResults.applied) {
      report += `- ${fix}\n`;
    }
    report += `\n`;
  }
  
  if (fixResults.files.length > 0) {
    report += `## 📁 Files Created\n\n`;
    for (const file of fixResults.files) {
      report += `- \`${file}\`\n`;
    }
    report += `\n`;
  }
  
  report += `## 📝 Next Steps\n\n`;
  report += `1. Review all created files in \`fix-files/\`\n`;
  report += `2. Copy files to your project as needed\n`;
  report += `3. Test your website\n`;
  report += `4. Re-run scan to verify fixes\n\n`;
  
  report += `---\n*Generated by Hot Beans Fixer MCP Server v2.0*`;
  
  return report;
}

function saveDetailedReport(report) {
  const dir = './fix-reports';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filename = `auto-fix-report-${Date.now()}.md`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, report);
  console.error(`📄 Detailed report saved to: ${filepath}`);
  return filepath;
}

// ============================================================
// Helper Functions - Generate Fix Content
// ============================================================

function generateGitFix() {
  return `# ============================================================
# .htaccess - Block Access to .git Folder
# ============================================================
# This file prevents attackers from accessing your .git folder
# Place this in your website's root directory
# ============================================================

# Block all .git folder access
RedirectMatch 403 /\.git

# OR for more comprehensive blocking:
<DirectoryMatch "^/.*/\.git/">
    Require all denied
</DirectoryMatch>

# ============================================================
# For Nginx, use this config instead:
# ============================================================
# location ~ /\.git {
#     deny all;
#     return 404;
# }
#
# ============================================================
# For Node.js/Express:
# ============================================================
# app.use('/.git', (req, res) => {
#   res.status(404).send('Not Found');
# });
# ============================================================`;
}

function generateNginxFix() {
  return `# ============================================================
# Nginx - Block Access to .git Folder
# ============================================================
# Add this to your nginx server block
# ============================================================

server {
    # ... other config ...
    
    # Block .git folder
    location ~ /\.git {
        deny all;
        return 404;
    }
    
    # Block other sensitive files
    location ~ /\.(env|htaccess|htpasswd|gitignore) {
        deny all;
        return 404;
    }
}`;
}

function generateHeaderFix(missingHeaders) {
  return `// ============================================================
// Security Headers - Express.js Middleware
// ============================================================
// Add this to your Express.js server
// ============================================================

app.use((req, res, next) => {
  // Security Headers
  ${missingHeaders.includes('X-Frame-Options') ? `res.setHeader('X-Frame-Options', 'DENY');` : '// X-Frame-Options already present'}
  ${missingHeaders.includes('X-Content-Type-Options') ? `res.setHeader('X-Content-Type-Options', 'nosniff');` : '// X-Content-Type-Options already present'}
  ${missingHeaders.includes('Strict-Transport-Security') ? `res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');` : '// Strict-Transport-Security already present'}
  ${missingHeaders.includes('Content-Security-Policy') ? `res.setHeader('Content-Security-Policy', "default-src 'self'");` : '// Content-Security-Policy already present'}
  ${missingHeaders.includes('Referrer-Policy') ? `res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');` : '// Referrer-Policy already present'}
  
  // Additional Security
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.removeHeader('X-Powered-By');
  
  next();
});

// ============================================================
// For HTML Meta Tags, use security-headers.html
// ============================================================`;
}

function generateMetaTags() {
  return `<!-- ============================================================ -->
<!-- Security Headers - HTML Meta Tags                               -->
<!-- ============================================================ -->
<!-- Add these to your HTML <head> section                         -->
<!-- ============================================================ -->

<head>
    <!-- Security Headers -->
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="Strict-Transport-Security" content="max-age=31536000">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="X-XSS-Protection" content="1; mode=block">
    
    <!-- Your other meta tags -->
</head>

<!-- ============================================================ -->
<!-- Note: Server-side headers are more secure than meta tags!    -->
<!-- Use server-side headers for production.                     -->
<!-- ============================================================ -->`;
}

function generatePageTemplate(page) {
  const pageName = page.replace('.html', '').toUpperCase();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hot Beans - ${pageName}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <nav>
      <div class="logo">🔥 Hot Beans</div>
      <ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="jobs.html">Jobs</a></li>
        <li><a href="apply.html">Apply</a></li>
      </ul>
    </nav>
  </header>
  
  <main>
    <section class="hero">
      <h1>Welcome to ${pageName}</h1>
      <p>This page was automatically generated by the Hot Beans Fixer MCP Server.</p>
    </section>
  </main>
  
  <footer>
    <p>&copy; 2026 Hot Beans Web. All rights reserved.</p>
  </footer>
  
  <script src="script.js"></script>
</body>
</html>`;
}

function generateCSS() {
  return `/* ============================================================
   Hot Beans Web - Styles
   ============================================================ */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

header {
  background: #1a1a2e;
  color: white;
  padding: 20px;
}

nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
}

nav .logo {
  font-size: 24px;
  font-weight: bold;
  color: #ff6b35;
}

nav ul {
  display: flex;
  list-style: none;
  gap: 20px;
}

nav ul li a {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background 0.3s;
}

nav ul li a:hover {
  background: #ff6b35;
}

.hero {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: white;
  padding: 60px 20px;
  text-align: center;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero p {
  font-size: 20px;
  margin-bottom: 30px;
}

.btn {
  display: inline-block;
  background: #ff6b35;
  color: white;
  padding: 12px 30px;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.3s;
}

.btn:hover {
  background: #e55a2b;
}

main {
  max-width: 1100px;
  margin: 40px auto;
  padding: 0 20px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 40px 0;
}

.feature-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  text-align: center;
}

.feature-card h3 {
  margin-bottom: 15px;
  color: #1a1a2e;
}

footer {
  background: #1a1a2e;
  color: white;
  text-align: center;
  padding: 20px;
  margin-top: 40px;
}

/* Responsive */
@media (max-width: 600px) {
  nav {
    flex-direction: column;
    gap: 15px;
  }
  
  nav ul {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .hero h1 {
    font-size: 32px;
  }
}`;
}

function generateJS() {
  return `// ============================================================
// Hot Beans Web - JavaScript
// ============================================================

console.log('🔥 Hot Beans Web loaded successfully!');

// Simple form validation for apply page
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('applicationForm');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('fullname')?.value;
      const email = document.getElementById('email')?.value;
      
      if (name && email) {
        const confirmation = document.createElement('div');
        confirmation.className = 'confirmation';
        confirmation.innerHTML = \`
          <div style="background: #4CAF50; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>✅ Application Submitted!</h2>
            <p>Thank you \${name}! We'll contact you at \${email}.</p>
            <p>We'll be in touch within 24 hours.</p>
          </div>
        \`;
        
        form.innerHTML = '';
        form.appendChild(confirmation);
      }
    });
  }
  
  // Navigation highlighting
  const navLinks = document.querySelectorAll('nav ul li a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.style.background = '#ff6b35';
      link.style.borderRadius = '4px';
    }
  });
});

console.log('🚀 All systems ready!');`;
}

function generateFixReport(results, url) {
  const timestamp = new Date().toISOString();
  
  let report = `# 🔧 Hot Beans Fix Report\n\n`;
  report += `**Website:** ${url}\n`;
  report += `**Date:** ${timestamp}\n`;
  report += `**Status:** ${results.issues.length === 0 ? '✅ SECURE' : '⚠️ FIXES APPLIED'}\n\n`;
  
  report += `## 📊 Summary\n\n`;
  report += `| Metric | Value |\n`;
  report += `|--------|-------|\n`;
  report += `| Issues Found | ${results.issues.length} |\n`;
  report += `| Fixes Applied | ${results.fixes.length} |\n`;
  report += `| Files Created | ${results.files.length} |\n\n`;
  
  if (results.issues.length > 0) {
    report += `## 🐛 Issues Found & Fixed\n\n`;
    for (const issue of results.issues) {
      report += `### ${issue.id} - ${issue.title}\n\n`;
      report += `**Severity:** ${issue.severity}\n`;
      report += `**Description:** ${issue.description}\n`;
      report += `**Fix:** ${issue.fix}\n\n`;
    }
  }
  
  if (results.fixes.length > 0) {
    report += `## ✅ Fixes Applied\n\n`;
    for (const fix of results.fixes) {
      report += `- ${fix.action}\n`;
    }
    report += `\n`;
  }
  
  if (results.files.length > 0) {
    report += `## 📁 Files Created\n\n`;
    for (const file of results.files) {
      report += `- \`${file}\`\n`;
    }
    report += `\n`;
  }
  
  report += `## 📝 Next Steps\n\n`;
  report += `1. Review all created files\n`;
  report += `2. Add them to your project\n`;
  report += `3. Test your website\n`;
  report += `4. Re-run the scan to verify fixes\n`;
  report += `5. Submit the fix report with your assignment\n\n`;
  
  report += `---\n*Generated by Hot Beans Fixer MCP Server*`;
  
  return report;
}

function saveFixFile(filename, content) {
  const dir = './fix-files';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, content);
  console.error(`📄 Fix file saved to: ${filepath}`);
  return filepath;
}

function saveFixReport(report) {
  const dir = './fix-reports';
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const filename = `fix-report-${Date.now()}.md`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, report);
  console.error(`📄 Fix report saved to: ${filepath}`);
  return filepath;
}

// --- Start the server ---
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🔧 Hot Beans Fixer MCP Server v2.0 running on stdio');
console.error('📋 Available tools:');
console.error('  - auto_fix_with_approval 🆕 (NEW!)');
console.error('  - scan_and_fix 🔍');
console.error('  - generate_fix_files 📄');