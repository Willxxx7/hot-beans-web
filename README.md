# Hot Beans Web Development Company Demo

A complete website for a fictional web development company.

## How to Run
1. Clone the repository
2. Open `index.html` in any browser

## Staff Portal Demo
For demonstration only:
- Open `staff-login.html`
- Email: `staff@hotbeansweb.com`
- Password: `hotbeans2024`

## Project Structure - not all pages are present you can check and add more as required
```
hot-beans-website/
├── index.html          # Homepage
├── about.html          # About page
├── services.html       # Services
├── trainees.html       # Trainee profiles
├── jobs.html          # Job listings
├── apply.html         # Application form
├── staff-login.html   # Staff login (demo)
├── staff-dashboard.html # Staff portal
├── style.css          # Main styles
├── script.js          # Main JavaScript
├── images/            # All images
└── README.md          # This file
```






More ininstructions to make it easier (read time around 30 mins) this will give a professional webdev setup!

📚 Level 3 Computing Assignment: COMPLETE CI/CD WEBSITE DEPLOYMENT
Lecturer's Template: https://github.com/Willxxx7/hot-beans-web
Total Time: 60 minutes | Result: Live portfolio website + automated tests + VS Code workflow

🎯 YOUR MISSION
Fork your lecturer's template → customize → deploy live website → setup professional CI/CD pipeline → VS Code auto-authentication.

PHASE 1: FORK → VS CODE → AUTO-AUTH (25 minutes)
STEP 1: FORK LECTURER'S REPO (2 minutes)
text
1. Go to: https://github.com/Willxxx7/hot-beans-web
2. Top-right → Green "Fork" button
3. Select YOUR GitHub account → "Create fork"
4. ✅ Your copy: https://github.com/YOUR_USERNAME/hot-beans-web
STEP 2: VS CODE + GIT SETUP (10 minutes)
2a) Install Prerequisites
text
❏ Download VS Code: https://code.visualstudio.com → Install → Restart
❏ Download Git: https://git-scm.com → Install → Restart Computer
❏ Login to github.com in browser (stay logged in)
2b) VS Code Git Configuration (Terminal - Ctrl+`)
text
Copy/paste these EXACT 4 commands ONE BY ONE:
bash
git --version
git config --global user.name "Your Full Name"
git config --global user.email "your.github@email.com"
git config --global credential.helper manager-core
text
✅ Expected: "git version 2.x.x" + no errors
2c) Clone Your Fork
text
1. VS Code → Ctrl+Shift+P → "Git: Clone" → Enter
2. Paste: https://github.com/YOUR_USERNAME/hot-beans-web.git
3. Choose Desktop folder → "Open"
✅ See index.html, css/, js/ folders in left panel
2d) TEST AUTO-AUTHENTICATION (CRITICAL)
text
1. Edit index.html (change any text) → Ctrl+S
2. Ctrl+Shift+G (Source Control)
3. Click "+" next to index.html (Stage)
4. Type: "Test auto authentication" → Ctrl+Enter (Commit)
5. Bottom status bar → Cloud↑ arrow (Push)
WHAT HAPPENS NEXT (2 OPTIONS):

OPTION A: Browser Popup (Normal)

text
VS Code: "Sign in with GitHub" → Click → Browser opens
github.com → Login → "Authorize VS Code" → Success!
OPTION B: Device Code (Corporate networks)

text
VS Code shows: "Enter code: ABCD-1234"
Browser → github.com/login/device → Paste code → Authorize
text
✅ SUCCESS: Status bar shows "✓ Published to: main"
✅ Your commit appears on GitHub.com
✅ Auto-auth complete FOREVER - no more passwords!
PHASE 2: LIVE WEBSITE + CI/CD TESTS (15 minutes)
STEP 3: ENABLE GITHUB PAGES
text
1. Browser → Your repo → Settings → "Pages" (left sidebar)
2. Source → Branch: main → Folder: / (root) → Save
3. Wait 2 minutes → Refresh
4. ✅ Live URL: https://YOUR_USERNAME.github.io/hot-beans-web
STEP 4: ADD AUTOMATED TESTS
text
1. Your repo → "Add file" → "Create new file"
2. Filename: `.github/workflows/test.yml` ← EXACT PATH
3. Copy/paste this ENTIRE code block:
text
name: CI/CD Website Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Test HTML Valid
      run: npx @html-validate/cli@latest .
    - name: Check Image Paths
      run: grep -r 'src=' *.html | grep -v 'data:' || true
    - name: Verify Pages Build
      run: |
        if [ -f "index.html" ]; then
          echo "✅ index.html exists in root"
        else
          echo "❌ No index.html - Pages will 404"
          exit 1
        fi
text
4. Bottom → "Commit new file"
5. Actions tab appears → Tests run → GREEN TICKS = PASS ✅
PHASE 3: DAILY PROFESSIONAL WORKFLOW (20 seconds)
text
REPEAT FOREVER - Your daily development cycle:

1️⃣ PULL (team sync): Ctrl+Shift+G → … → Pull
2️⃣ EDIT: index.html, css/style.css, images/
3️⃣ COMMIT: Ctrl+Shift+G → + (Stage) → Message → Ctrl+Enter
4️⃣ PUSH: Cloud↑ arrow → Auto-auth → Tests run
5️⃣ LIVE: https://YOUR_USERNAME.github.io/hot-beans-web updates!
✅ SUBMISSION CHECKLIST (Screenshot EVERY Item)
Item	Status	Screenshot
Your repo exists	☐	Main repo page
VS Code shows files	☐	Explorer panel
Auto-auth works	☐	"✓ Published to: main"
Pages = main + / (root)	☐	Settings → Pages
Actions = GREEN	☐	Latest test run
Live site loads	☐	Full browser window
🎯 ASSESSMENT RUBRIC (Teacher Auto-Grading)
text
🟢 6/6 Green = A* (100%) - Professional
🟡 4-5 Green = B (70%) - Good
🔴 <4 Green = U (Fail) - Broken pipeline
TEACHER CHECKS IN 30 SECONDS:

Actions tab green ticks? ✅

Live URL loads? ✅

Student confirms VS Code workflow? ✅

🚨 TROUBLESHOOTING
PROBLEM	SOLUTION
"GitHub Authentication Required"	Repeat Step 2d browser auth
404 Error	Pages must be main + / (root)
Actions RED	Fix HTML → Push again
Images broken	./images/pic.jpg (relative paths)
VS Code no Source Control	File → Open Folder → Select project
📱 MOBILE FRIENDLY WORKFLOW
text
Phone: Check live site + Actions tab
Laptop: VS Code edit → Push → Phone auto-updates!
🎓 LEARNING OUTCOMES ACHIEVED
text
✅ GitHub Pages deployment
✅ VS Code professional workflow
✅ CI/CD automated testing pipeline
✅ Auto-authentication (no passwords)
✅ Responsive web development
✅ SDLC planning + wireframes (Canva)
✅ Portfolio-ready project
Deadline: [INSERT DATE]
Submit: Live URL + 6 screenshots + GitHub repo link

Lecturer's template = YOUR BLUEPRINT FOR SUCCESS! Fork → Customize → Deploy → Shine! 🚀
