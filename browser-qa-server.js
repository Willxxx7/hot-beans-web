import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const server = new McpServer({
  name: 'hot-beans-browser-qa',
  version: '1.0.0',
});

let browser;

async function getBrowser() {
  if (!browser) {
    browser = await chromium.launch({ headless: true });
  }
  return browser;
}

async function withPage(url, callback) {
  const b = await getBrowser();
  const page = await b.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    return await callback(page);
  } finally {
    await page.close();
  }
}

server.registerTool(
  'open_page',
  {
    description: 'Open a page and return the title and basic page metadata',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The page URL to open'),
    },
  },
  async ({ url }) => {
    try {
      const result = await withPage(url, async (page) => {
        return {
          title: await page.title(),
          url: page.url(),
          status: await page.evaluate(() => document.readyState),
        };
      });

      return {
        content: [{ type: 'text', text: `✅ Page loaded successfully\nTitle: ${result.title}\nURL: ${result.url}\nState: ${result.status}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Failed to open page: ${error.message}` }],
      };
    }
  }
);

server.registerTool(
  'check_page_title',
  {
    description: 'Check whether a page title matches the expected value',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The page URL to test'),
      expectedTitle: z.string().describe('The expected page title'),
    },
  },
  async ({ url, expectedTitle }) => {
    try {
      const result = await withPage(url, async (page) => {
        const title = await page.title();
        return { title, matches: title === expectedTitle };
      });

      return {
        content: [{
          type: 'text',
          text: result.matches
            ? `✅ Title matches expected value: ${result.title}`
            : `❌ Title mismatch. Expected: ${expectedTitle} | Actual: ${result.title}`,
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Failed to check page title: ${error.message}` }],
      };
    }
  }
);

server.registerTool(
  'click_link',
  {
    description: 'Navigate to a link by selector and report the new URL',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The page URL to open'),
      selector: z.string().describe('CSS selector for the link or button to click'),
    },
  },
  async ({ url, selector }) => {
    try {
      const result = await withPage(url, async (page) => {
        await page.click(selector);
        return {
          newUrl: page.url(),
          title: await page.title(),
        };
      });

      return {
        content: [{
          type: 'text',
          text: `✅ Link clicked successfully\nNew URL: ${result.newUrl}\nTitle: ${result.title}`,
        }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Failed to click selector: ${error.message}` }],
      };
    }
  }
);

server.registerTool(
  'take_screenshot',
  {
    description: 'Take a screenshot of a page and save it in the project screenshots folder',
    inputSchema: {
      url: z.string().default('http://127.0.0.1:5500').describe('The page URL to capture'),
      filename: z.string().default('hot-beans-page.png').describe('Output screenshot filename'),
    },
  },
  async ({ url, filename }) => {
    try {
      const outputsDir = path.join(process.cwd(), 'screenshots');
      if (!fs.existsSync(outputsDir)) {
        fs.mkdirSync(outputsDir, { recursive: true });
      }

      const fullPath = path.join(outputsDir, filename);

      await withPage(url, async (page) => {
        await page.screenshot({ path: fullPath, fullPage: true });
      });

      return {
        content: [{ type: 'text', text: `✅ Screenshot saved to: ${fullPath}` }],
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `❌ Failed to take screenshot: ${error.message}` }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('🔥 Hot Beans Browser QA MCP Server running on stdio');
console.error('📋 Available tools:');
console.error('  - open_page');
console.error('  - check_page_title');
console.error('  - click_link');
console.error('  - take_screenshot');
