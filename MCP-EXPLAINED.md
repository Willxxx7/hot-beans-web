# MCP, Custom Agents, and the Hot Beans Project

This guide is written for students who are learning how the Hot Beans site, the MCP servers, and the custom agent setup fit together.

It focuses on the parts that are easy to misunderstand.

---

## 1) The big picture

The project is a static website, which means the main site files are simple HTML, CSS, and JavaScript files such as:

- index.html
- about.html
- jobs.html
- apply.html
- style.css
- script.js

The website itself is just the front-end UI. It is not a full app server.

Then we add extra tools and logic that help us test and inspect the website in a more professional way.

These extra tools are exposed through a Model Context Protocol (MCP) server.

In plain English:

- the website is what students see in the browser
- the MCP server is a helper layer that gives the AI tools like "check if the site is online" or "scan for security issues"
- the custom agent is a specialist instruction set that tells the AI how to behave when using those tools

---

## 2) What is an MCP server?

An MCP server is a small program that exposes tools to the AI or the editor.

In this project, there are two examples:

- security server
- browser QA server

The security server handles tasks such as:

- checking if the website is online
- checking for exposed .git files
- checking security headers
- running a full scan
- running UX/UI tests

The browser QA server handles tasks such as:

- opening pages in a browser
- checking page titles
- clicking navigation links
- taking screenshots
- testing real browser behaviour

These are not “the website”. They are helper tools around the website.

---

## 3) Why does the tool name look like @hot-beans-security?

This is one of the trickiest bits.

The @ symbol is usually a namespace label. It tells the tool system:

- this tool belongs to a named group
- this is not just a random function
- it is part of a specific MCP server or custom tool collection

So when you see:

- @hot-beans-security
- @hot-beans-browser-qa

that does not mean there are two websites or two different app types.

It means the environment is showing the tools as belonging to different named providers.

Think of it like this:

- website = the pages the user visits
- server = the helper system that exposes the tools
- namespace = the label that groups those tools together

This is why the @ name can look more complicated than the real work being done.

---

## 4) The custom agent files explained

This project includes files such as:

- [.github/agents/hot-beans-security.agent.md](.github/agents/hot-beans-security.agent.md)
- [.github/agents/hot-beans-browser-qa.agent.md](.github/agents/hot-beans-browser-qa.agent.md)
- [.github/instructions/hot-beans-security.instructions.md](.github/instructions/hot-beans-security.instructions.md)
- [.github/prompts/hot-beans-security-check.prompt.md](.github/prompts/hot-beans-security-check.prompt.md)
- [.github/prompts/hot-beans-browser-qa-check.prompt.md](.github/prompts/hot-beans-browser-qa-check.prompt.md)

These files are important because they tell the assistant:

- what the project is about
- which tasks it should focus on
- how to behave when working on this website

### Agent file
The agent file defines a specialist role. For example:

- security agent = checks website health, headers, and exposed files
- browser QA agent = checks actual page behavior in the browser

### Instruction file
The instruction file gives general project rules.

It is useful when the agent is working on many files in the project, especially HTML, CSS, JS, and JSON.

### Prompt file
The prompt file is a shortcut for common tasks.

Instead of writing a full long instruction every time, the user can trigger a ready-made prompt such as:

- “Check the Hot Beans website is online”
- “Run the Browser QA checks”

---

## 5) Why the website was showing as offline

This happened because the site was not actually being served locally when the check ran.

The project is static, so the website must be started with a local server, such as:

- Python HTTP server
- VS Code Live Server
- a local Node-based static server

The earlier status check failed because the URL was being fetched without a running server.

So the real issue was not the website code itself. The real issue was:

- the browser requested a page
- nothing was listening on that address
- the request failed

This is a common beginner mistake: a project can exist on disk, but it is not “online” until something serves it.

---

## 6) Why the custom tools are useful

These tools are useful because they make the project feel more like a real QA workflow.

For example, the security server can answer questions such as:

- Is the site online?
- Are any .git files exposed?
- Are security headers present?
- Is the site passing a basic health check?

The browser QA server can answer questions like:

- Does the homepage actually load in a browser?
- Does the About page open?
- Can the navigation links be clicked?
- Is the page title correct?

This is different from just reading the files. It tests actual behaviour.

---

## 7) The tricky part: MCP vs actual website functionality

This is a very important distinction.

The website itself is not the MCP server.

The website is the target being checked.

The MCP server is the tool provider that allows the AI to ask questions about that website and run checks.

The browser QA server is not replacing the website.

It is just another interface for testing the website in a real browser.

A useful mental model is:

- website = target
- MCP server = assistant tools
- agent = specialist instructions
- browser = real rendering environment

---

## 8) Security concepts in this project

### .git exposure
The project checks whether files such as:

- /.git/config
- /.git/HEAD

can be accessed from the web.

If a .git folder is exposed, it can reveal repository information and create a serious security issue.

This is why the tool is relevant: it helps students understand that public web folders should not accidentally expose hidden Git metadata.

### Security headers
The project checks for headers such as:

- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- Content-Security-Policy
- Referrer-Policy

These headers help protect the site from common attacks and poor browser behaviour.

A site can look fine visually and still be weak from a security standpoint.

---

## 9) Why this project is a good learning example

This project combines several ideas that are common in professional web work:

- static web page development
- HTML, CSS, and JavaScript basics
- local serving and testing
- security checks
- browser testing
- AI tool integration through MCP
- custom agency-style workflows using agent instructions

Students are not just building a website. They are also learning how to:

- inspect a site properly
- test it in a realistic way
- think about security
- structure automation tools around a project

---

## 10) Common mistakes students make

### Mistake 1: thinking the website is “live” as soon as the files are saved
It is not live until it is being served and accessible from a browser.

### Mistake 2: thinking @ names are random
They are namespace labels that group tools from a named provider.

### Mistake 3: thinking the MCP server is the website
The website and the MCP server are separate layers.

### Mistake 4: expecting everything to work without starting the helper server
The custom server must be running before the AI can use its tools.

### Mistake 5: ignoring the browser testing layer
A site can load in code but still fail in the browser because of CSS, JS, navigation, or interaction issues.

---

## 11) Quick student workflow

A practical way to use this project is:

1. Start the static site locally.
2. Run the security server.
3. Run the browser QA server if needed.
4. Use the security agent for checks.
5. Use the browser QA agent for page behaviour.
6. Fix the issue in the relevant HTML, CSS, or JS file.
7. Re-test and confirm the result.

---

## 12) Final takeaway

The main lesson is this:

A website is not just a set of files. It is a whole environment that includes:

- content files
- browser rendering
- local serving
- security checks
- QA testing
- agent instructions
- tool namespaces

That is why this project is a strong example of how real web work is structured, especially when AI tools and automation are added on top.

If you understand this, the “@hot-beans-security” and “@hot-beans-browser-qa” labels stop being mysterious and become part of a clear workflow.

---

## 13) Useful references inside this project

- [mcp-server.js](mcp-server.js)
- [browser-qa-server.js](browser-qa-server.js)
- [package.json](package.json)
- [.github/instructions/hot-beans-security.instructions.md](.github/instructions/hot-beans-security.instructions.md)
- [.github/agents/hot-beans-security.agent.md](.github/agents/hot-beans-security.agent.md)
- [.github/agents/hot-beans-browser-qa.agent.md](.github/agents/hot-beans-browser-qa.agent.md)

---

## 14) One-line summary

This project teaches students that a website, a tool server, and an agent are three different layers, and that the hardest part is understanding how they connect.
