# Hot Beans Web Development Company

A complete, professional website for a fictional web development company with automated deployment and testing.

Assignment 2: Level 3 Computing - CI/CD Website Deployment -please bear in mind if using this template website you will be expected to customise it! Comments in the code will be expected as will screen shots of the code and the completed website running in 2 browsers  - this is part of testing too - you can also use a platform like Figma (industry standard tool) to develop the wireframes and more :) 

Remember evidence is what is needed  - if you do not evidence your work properly expect a resubmission!
---

## Getting Started

### Run Locally

1. Clone this repository
2. Open `index.html` in your web browser

No build steps or dependencies required. you should investigate exactly what this part means  :)

### Staff Portal Demo

| Field    | Value                 |
| -------- | --------------------- |
| Email    | staff@hotbeansweb.com |
| Password | hotbeans2024          |

**Access URLs:**

- Login page: `staff-login.html`
- Dashboard: `staff-dashboard.html`

---

## Project Structure

```
hot-beans-web/
│
├── index.html              # Homepage
├── about.html              # Company information
├── services.html           # Services offered
├── trainees.html           # Current trainees
├── jobs.html               # Open positions
├── apply.html              # Job application form
├── staff-login.html        # Staff portal login
├── staff-dashboard.html    # Staff management area
│
├── style.css               # Main stylesheet
├── script.js               # JavaScript functionality
│
├── images/                 # Image assets
│
└── README.md               # Documentation
```

> Some pages may be incomplete. Feel free to add more as needed.

---

## Setup Instructions

Estimated time: 30 minutes

### Phase 1: Fork and Clone

**Step 1: Fork the Repository**

1. Go to: `https://github.com/Willxxx7/hot-beans-web`
2. Click the green "Fork" button (top-right)
3. Select your GitHub account
4. Your copy: `https://github.com/YOUR-USERNAME/hot-beans-web`

**Step 2: Install Required Software**

| Software | Download Link                 |
| -------- | ----------------------------- |
| VS Code  | https://code.visualstudio.com |
| Git      | https://git-scm.com           |

**Step 3: Configure Git**

Open VS Code terminal (`Ctrl + `` ) and run:

```bash
git --version
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
git config --global credential.helper manager-core
```

**Step 4: Clone Your Fork**

1. VS Code: `Ctrl+Shift+P` → Type "Git: Clone"
2. Paste: `https://github.com/YOUR-USERNAME/hot-beans-web.git`
3. Choose a folder → Click "Open"

**Step 5: Test Authentication**

1. Edit `index.html` (change any text)
2. Save file (`Ctrl+S`)
3. Open Source Control (`Ctrl+Shift+G`)
4. Click `+` next to index.html
5. Type a commit message → `Ctrl+Enter`
6. Click the cloud icon (↑) to push

**What happens next:**

- **Option A (Browser popup):** Click "Sign in with GitHub" → Authorize in browser
- **Option B (Device code):** Go to github.com/login/device → Enter the code shown

Success message: "✓ Published to: main"

---

### Phase 2: Live Website

**Enable GitHub Pages**

1. Go to your repository on GitHub.com
2. Click **Settings** → **Pages** (left sidebar)
3. Source: **Branch: main** → **Folder: / (root)**
4. Click **Save**
5. Wait 2 minutes
6. Your live URL: `https://YOUR-USERNAME.github.io/hot-beans-web`

**Add Automated Tests**

1. In your repository under Actions-click new workflow (green button), click **Add file** → **Create new file**
2. Filename: `.github/workflows/test.yml`
3. Copy and paste:

```yaml
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
```

4. Click **Commit new file**
5. Go to the **Actions** tab → Wait for green checkmarks

---

## Daily Workflow

Repeat these 5 steps every time you work:

| Step | Action              | Shortcut                            |
| ---- | ------------------- | ----------------------------------- |
| 1    | Pull latest changes | `Ctrl+Shift+G` → `...` → Pull |
| 2    | Edit your files     | Edit HTML/CSS/JS                    |
| 3    | Stage changes       | `Ctrl+Shift+G` → Click `+`     |
| 4    | Commit              | Type message →`Ctrl+Enter`       |
| 5    | Push                | Click cloud↑ arrow                 |

Your live site updates automatically after each push.

---

## Troubleshooting

| Issue                        | Solution                                         |
| ---------------------------- | ------------------------------------------------ |
| Authentication error         | Repeat the authentication step (browser popup)   |
| 404 on live site             | Check Pages settings: main branch + /root folder |
| Red X in Actions             | Fix HTML errors → Commit → Push again          |
| Broken images                | Use relative paths:`./images/filename.jpg`     |
| No Source Control in VS Code | File → Open Folder → Select your project       |
| Push rejected                | Pull latest changes first, then push             |

---

## Assessment Checklist

| Item                                     | Complete? |
| ---------------------------------------- | --------- |
| Repository forked to your account        | ☐        |
| VS Code shows all project files          | ☐        |
| Authentication working (push successful) | ☐        |
| GitHub Pages configured correctly        | ☐        |
| Actions tab shows green checkmarks       | ☐        |
| Live website loads in browser            | ☐        |

### Grading

| Result                     | Grade     |
| -------------------------- | --------- |
| All 6 items complete       | A* (100%) |
| 4-5 items complete         | B (70%)   |
| Less than 4 items complete | Fail      |

---

## Quick Reference

**Live URL:** `https://YOUR-USERNAME.github.io/hot-beans-web`

**Repository:** `https://github.com/YOUR-USERNAME/hot-beans-web`

**Test Status:** View in the Actions tab

---

## Learning Outcomes

- GitHub Pages deployment
- VS Code Git workflow
- CI/CD automated testing
- Git authentication setup
- Responsive web development
- Portfolio project creation

---

## Credits

- Template by: Willxxx7/hot-beans-web
- Assignment: Level 3 Computing - CI/CD Website Deployment -please bear in mind if using this template website you will be expected to customise it! Comments in the code will be expected as will screen shots of the code and the completed website running in 2 browsers  - this is part of testing too - you can also use a platform like Figma (industry standard tool) to develop the wireframes and more :) 

---

**Submission deadline:** 30th April 2026

**Submit:** Live URL + 6 screenshots + GitHub repo link

---

*Fork → Customize → Deploy → Shine* 🚀

---

## What to change after pasting:

| Find                        | Replace with                |
| --------------------------- | --------------------------- |
| `YOUR-USERNAME` (3 times) | Your actual GitHub username |
| `[INSERT DATE]`           | Your submission deadline    |
| `Your Name`               | Your full name              |
| `your-email@example.com`  | Your GitHub email           |








And some automation for the testing - do you understand it? make sure you explain it well, what it tests and how it does it - please ask if not sure :)

# Unit 6 Assignment 2: Automated Testing Guide for Students

---

## **⚠️ TRICKY PARTS (Fix These First!)**

| **Problem**             | **Fix**                                                            |
| ----------------------------- | ------------------------------------------------------------------------ |
| **Indentation**         | YAML needs **exactly 2 spaces** per level *(no tabs!)*            |
| **`npx` fails**       | GitHub has Node.js built-in - just use `npx` commands                  |
| **Private repo**        | Make repo **public** for free GitHub Actions minutes                |
| **No workflow runs**    | Must **commit + push** after adding `.github/workflows/tests.yml` |
| **`grep` scary**      | It just finds images - won't break anything                              |
| **Missing screenshots** | Take  **3 screenshots**: Workflow + HTML output + table              |

---

## **Step-by-Step: Automated Testing (C.P5 + C.M3)**

### **Step 1: Push Your Website to GitHub**

```bash
1. Create new repo: hotbeans-[yourname]
2. Upload: index.html, style.css, script.js, images/
3. Make repo PUBLIC (Settings → Danger Zone (scroll down along way :) then → Change visibility to PUBLIC) why have you done this? 
```

### **Step 2: Create the Workflow File**

```bash
1. Create folder: .github/workflows/
2. New file: tests.yml
3. **Copy-paste exactly** (watch indentation!):
```

---
what is this yaml file??
```yaml
name: Website Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Validate HTML
      run: npx @html-validate/cli@latest .
    - name: Check Images
      run: grep -r 'src=' *.html | grep -v 'data:' || true
    - name: Verify Homepage
      run: test -f index.html || { echo "index.html missing!"; exit 1; }
```

```bash
4. COMMIT: "Add automated tests"
5. PUSH to GitHub
```

### **Step 3: Watch It Run (30 seconds!)**

```bash
1. GitHub repo → Actions tab
2. See green "Website Tests" running  
3. Click for logs + screenshots
```

### **Step 4: Screenshot Evidence**

```bash
📸 **Take these 3 screenshots:**
1. Actions tab (green ticks)
2. HTML validation output
3. "All checks passed"
```

### **Step 5: Manual Testing Comparison**

```bash
**Do this FIRST (before CI/CD):**
✅ Chrome, Firefox, Edge
✅ Mobile (DevTools → Toggle device)
✅ Click all links/images  
✅ Test forms/buttons
✅ Time: 45 minutes ❌
```

---


## **Assignment 2 Write-up (Copy This!)**

## C.P5: Testing My Website

### Manual Testing (45 mins)

| Test        | Chrome | Firefox | Mobile        |
| ----------- | ------ | ------- | ------------- |
| Navigation  | ✅     | ✅      | ✅            |
| Images load | ✅     | ✅      | ❌ (1 broken) |
| Forms work  | ✅     | ✅      | ✅            |

**Issues found:** Mobile image path wrong

### Automated Testing (2 mins)

![Workflow Success]

**Results:** ✅ HTML valid, ✅ Images found, ✅ index.html exists

## C.M3: Optimisation Through CI/CD

**BEFORE CI/CD:**

- Manual testing: 45 mins per change
- Missed broken mobile image → Live bug

**AFTER CI/CD:**

- 2-minute automated tests
- Catches HTML errors instantly
- Prevents broken deploys

**Improvement:** Testing time **95% faster**, zero live bugs.

## **🎯 Distinction Tips**

```bash
✅ 3 screenshots (Actions + logs + table)
✅ Manual vs automated time comparison
✅ "95% faster" business impact statement  
✅ YAML code + workflow screenshot
✅ Live GitHub repo link
```

---

**Total time: 20 minutes setup → Distinction evidence forever!**    except yours will need to be more tests for the distinction and properly explained!🚀

**Submit:** Screenshots + write-up + GitHub link = **PMD guaranteed**.
