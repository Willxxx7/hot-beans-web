import requests
import time
import smtplib
import os
import json
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

# --- COLOR CODES FOR TERMINAL ---
class Colors:
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

# --- CONFIGURATION ---
TARGET_URL = "http://127.0.0.1:5500"
CHECK_INTERVAL = 60
LOG_TO_FILE = True
DASHBOARD_FILE = "security_dashboard.html"

# --- EMAIL CONFIGURATION ---
EMAIL_ENABLED = False
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
EMAIL_ADDRESS = "your_email@gmail.com"
EMAIL_PASSWORD = "your_app_password"
ALERT_RECIPIENT = "owner@hotbeansweb.com"

# --- PREVIOUS STATE TRACKING ---
previous_state = {
    "site_up": None,
    "missing_headers": [],
    "exposed_files": []
}

# --- SECURITY CHECKS ---
def check_missing_security_headers(url):
    print(f"{Colors.BLUE}\n[+] Checking headers on {url}...{Colors.END}")
    try:
        response = requests.get(url, timeout=5)
        headers = response.headers
        
        missing_headers = []
        
        if "X-Frame-Options" not in headers:
            missing_headers.append("X-Frame-Options (Clickjacking protection)")
        if "X-Content-Type-Options" not in headers:
            missing_headers.append("X-Content-Type-Options (MIME sniffing protection)")
        if "Strict-Transport-Security" not in headers:
            missing_headers.append("Strict-Transport-Security (HTTPS enforcement)")
        if "Content-Security-Policy" not in headers:
            missing_headers.append("Content-Security-Policy (XSS protection)")
            
        if missing_headers:
            print(f"{Colors.RED}    ❌ MISSING: {', '.join(missing_headers)}{Colors.END}")
            return missing_headers
        else:
            print(f"{Colors.GREEN}    ✅ All secure headers present!{Colors.END}")
            return []
            
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}    ❌ Connection refused - Site may be down{Colors.END}")
        return ["Unable to connect to site"]
    except requests.exceptions.Timeout:
        print(f"{Colors.RED}    ❌ Connection timeout{Colors.END}")
        return ["Connection timeout"]
    except Exception as e:
        print(f"{Colors.RED}    ❌ Error: {e}{Colors.END}")
        return ["Unable to connect to site"]

def check_for_exposed_files(url):
    print(f"{Colors.BLUE}\n[+] Checking for exposed files...{Colors.END}")
    
    dangerous_files = [
        ".git/config", ".git/HEAD", ".env", "config.json", 
        "server.key", ".htaccess", "robots.txt", "sitemap.xml",
        "backup.zip", "database.sql", "admin.php", "login.php",
        "wp-config.php", "composer.json", "package.json"
    ]
    exposed = []
    
    for file in dangerous_files:
        file_url = f"{url}/{file}"
        try:
            response = requests.get(file_url, timeout=3)
            if response.status_code == 200:
                print(f"{Colors.RED}    🚨 WARNING: {file_url} is EXPOSED! (Status: {response.status_code}){Colors.END}")
                exposed.append(f"{file_url} is EXPOSED")
            elif response.status_code in [403, 404]:
                print(f"{Colors.GREEN}    ✅ {file} is protected (Status: {response.status_code}){Colors.END}")
            else:
                print(f"{Colors.YELLOW}    ⚠️  {file} returned status: {response.status_code}{Colors.END}")
        except Exception as e:
            print(f"{Colors.YELLOW}    ⚠️  Could not check {file}: {e}{Colors.END}")
    
    return exposed

def check_site_is_up(url):
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print(f"{Colors.GREEN}    ✅ Site is UP (Status: {response.status_code}){Colors.END}")
            return True
        else:
            print(f"{Colors.YELLOW}    ⚠️  Site returned status: {response.status_code}{Colors.END}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}    🚨 CRITICAL: Site is DOWN! (Connection refused){Colors.END}")
        return False
    except requests.exceptions.Timeout:
        print(f"{Colors.RED}    🚨 CRITICAL: Site is DOWN! (Timeout){Colors.END}")
        return False
    except:
        print(f"{Colors.RED}    🚨 CRITICAL: Site is DOWN!{Colors.END}")
        return False

# --- GENERATE REPORT ---
def generate_report(site_up, missing_headers, exposed_files, is_change=False):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report = f"🛡️ HOT BEANS SECURITY REPORT\n"
    report += f"Generated: {timestamp}\n"
    report += f"Target: {TARGET_URL}\n"
    report += "=" * 40 + "\n"
    
    if is_change:
        report += "⚠️ STATUS CHANGED SINCE LAST CHECK!\n"
        report += "=" * 40 + "\n"
    
    if not site_up:
        report += "🚨 CRITICAL: Website is DOWN!\n"
    else:
        report += "✅ Website is UP.\n"
    
    if missing_headers:
        report += f"\n❌ SECURITY HEADERS MISSING:\n"
        for header in missing_headers:
            report += f"   - {header}\n"
    else:
        report += "\n✅ All Security Headers Present.\n"
    
    if exposed_files:
        report += f"\n🚨 EXPOSED FILES FOUND:\n"
        for file in exposed_files:
            report += f"   - {file}\n"
    else:
        report += "\n✅ No Exposed Files.\n"
    
    return report

# --- SAVE REPORT TO FILE ---
def save_report_to_file(report):
    if not LOG_TO_FILE:
        return
    
    if not os.path.exists("reports"):
        os.makedirs("reports")
    
    filename = f"reports/security_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(report)
        print(f"{Colors.BLUE}📁 Report saved to: {filename}{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}❌ Failed to save report: {e}{Colors.END}")

# --- GENERATE HTML DASHBOARD ---
def generate_dashboard(site_up, missing_headers, exposed_files):
    try:
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        header_count = len(missing_headers)
        file_count = len(exposed_files)
        
        # Build header list
        headers_html = ""
        if missing_headers:
            for header in missing_headers:
                headers_html += f"<li>❌ {header}</li>"
        else:
            headers_html = "<li>✅ All security headers present</li>"
        
        # Build files list
        files_html = ""
        if exposed_files:
            for file in exposed_files:
                files_html += f"<li>🔴 {file}</li>"
        else:
            files_html = "<li>✅ No exposed files found</li>"
        
        # Status
        status_text = "✅ Website is UP" if site_up else "🚨 CRITICAL: Website is DOWN!"
        status_color = "up" if site_up else "down"
        site_icon = "✅" if site_up else "🚨"
        site_status = "Online" if site_up else "OFFLINE"
        site_color = "#28a745" if site_up else "#dc3545"
        
        header_icon = "⚠️" if missing_headers else "✅"
        header_color = "#856404" if missing_headers else "#28a745"
        header_label = f"{header_count} Missing" if header_count else "OK"
        
        file_icon = "🚨" if exposed_files else "✅"
        file_color = "#dc3545" if exposed_files else "#28a745"
        file_label = f"{file_count} Found" if file_count else "OK"
        
        header_class = "warning" if missing_headers else "ok"
        file_class = "critical" if exposed_files else "ok"
        border_color = "#dc3545" if (not site_up or missing_headers or exposed_files) else "#28a745"
        
        # STATUS ICON SELECTORS
        header_dot = "yellow-dot" if missing_headers else "green-dot"
        file_dot = "red-dot" if exposed_files else "green-dot"
        
        html = f'''<!DOCTYPE html>
<html>
<head>
    <title>Hot Beans Security Dashboard</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }}
        .container {{
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}
        h1 {{
            color: #333;
            border-bottom: 4px solid #4CAF50;
            padding-bottom: 15px;
            margin-bottom: 10px;
            font-size: 28px;
        }}
        .header-info {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }}
        .timestamp {{
            color: #666;
            font-size: 14px;
        }}
        .status-badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background: #28a745;
            color: white;
        }}
        .status {{
            padding: 20px;
            margin: 20px 0;
            border-radius: 10px;
            font-weight: bold;
            font-size: 18px;
        }}
        .up {{ background: #d4edda; color: #155724; border: 2px solid #c3e6cb; }}
        .down {{ background: #f8d7da; color: #721c24; border: 2px solid #f5c6cb; }}
        .warning {{ background: #fff3cd; color: #856404; border: 2px solid #ffeeba; }}
        .ok {{ background: #d4edda; color: #155724; border: 2px solid #c3e6cb; }}
        .critical {{ background: #f8d7da; color: #721c24; border: 2px solid #f5c6cb; }}
        .status-icon {{
            display: inline-block;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            margin-right: 12px;
            vertical-align: middle;
        }}
        .green-dot {{ background: #28a745; }}
        .red-dot {{ background: #dc3545; }}
        .yellow-dot {{ background: #ffc107; }}
        h2 {{
            color: #555;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 20px;
            display: flex;
            align-items: center;
        }}
        h2 .badge {{
            margin-left: 10px;
            font-size: 12px;
            padding: 3px 10px;
            border-radius: 12px;
            background: #6c757d;
            color: white;
        }}
        .header-item {{
            display: flex;
            align-items: center;
            gap: 10px;
        }}
        .file-list {{
            list-style: none;
            padding: 0;
            margin: 0;
            font-weight: normal;
        }}
        .file-list li {{
            padding: 8px 15px;
            margin: 5px 0;
            background: #f8f9fa;
            border-radius: 5px;
            font-family: Courier New, monospace;
            font-size: 14px;
            border-left: 4px solid #dc3545;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            color: #999;
            font-size: 13px;
            text-align: center;
        }}
        .footer .highlight {{
            color: #667eea;
            font-weight: bold;
        }}
        .summary-section {{
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
            border-left: 4px solid {border_color};
        }}
        .summary-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
        }}
        .summary-card {{
            text-align: center;
            padding: 10px;
            background: white;
            border-radius: 8px;
        }}
        .summary-card .icon {{
            font-size: 24px;
        }}
        .summary-card .label {{
            font-size: 12px;
            color: #666;
        }}
        .summary-card .value {{
            font-weight: bold;
            font-size: 14px;
            margin-top: 3px;
        }}
        @media (max-width: 600px) {{
            .container {{ padding: 20px; }}
            h1 {{ font-size: 22px; }}
            .header-info {{ flex-direction: column; align-items: flex-start; gap: 10px; }}
            .status {{ font-size: 15px; padding: 15px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header-info">
            <h1>Hot Beans Security Dashboard</h1>
            <div class="header-item">
                <span class="status-badge">LIVE</span>
                <span class="timestamp"> {timestamp}</span>
            </div>
        </div>
        <div class="status {status_color}">
            <span class="status-icon {status_color}-dot"></span>
            {status_text}
        </div>
        <h2>
            Security Headers
            <span class="badge">{header_count} {'Missing' if header_count else 'OK'}</span>
        </h2>
        <div class="status {header_class}">
            <span class="status-icon {header_dot}"></span>
            <ul class="file-list">
                {headers_html}
            </ul>
        </div>
        <h2>
            Exposed Files
            <span class="badge">{file_count} {'Found' if file_count else 'OK'}</span>
        </h2>
        <div class="status {file_class}">
            <span class="status-icon {file_dot}"></span>
            <ul class="file-list">
                {files_html}
            </ul>
        </div>
        <div class="summary-section">
            <h3 style="color: #333; margin-bottom: 10px;">Security Summary</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="icon">{site_icon}</div>
                    <div class="label">Site Status</div>
                    <div class="value" style="color: {site_color};">{site_status}</div>
                </div>
                <div class="summary-card">
                    <div class="icon">{header_icon}</div>
                    <div class="label">Headers</div>
                    <div class="value" style="color: {header_color};">{header_label}</div>
                </div>
                <div class="summary-card">
                    <div class="icon">{file_icon}</div>
                    <div class="label">Exposed Files</div>
                    <div class="value" style="color: {file_color};">{file_label}</div>
                </div>
            </div>
        </div>
        <div class="footer">
            Automated Security Monitoring System<br>
            Target: {TARGET_URL} | 
            Check Interval: {CHECK_INTERVAL} seconds<br>
            <span style="font-size: 11px; color: #ccc;">Built for Hot Beans Web Security Course</span>
        </div>
    </div>
</body>
</html>'''
        
        with open(DASHBOARD_FILE, "w", encoding="utf-8") as f:
            f.write(html)
        print(f"{Colors.BLUE}📊 Dashboard updated: {DASHBOARD_FILE}{Colors.END}")
        print(f"{Colors.GREEN}🌐 Open dashboard: {DASHBOARD_FILE}{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}❌ Failed to update dashboard: {e}{Colors.END}")

# --- DETECT CHANGES ---
def detect_changes(current_state):
    global previous_state
    changes = []
    
    if previous_state["site_up"] is not None:
        if current_state["site_up"] != previous_state["site_up"]:
            changes.append(f"Site status changed: {'UP' if current_state['site_up'] else 'DOWN'}")
        
        new_headers = set(current_state["missing_headers"]) - set(previous_state["missing_headers"])
        if new_headers:
            changes.append(f"New missing headers: {', '.join(new_headers)}")
        
        new_files = set(current_state["exposed_files"]) - set(previous_state["exposed_files"])
        if new_files:
            changes.append(f"New exposed files: {', '.join(new_files)}")
    
    previous_state = current_state.copy()
    return changes

# --- EMAIL SENDING ---
def send_email(subject, body):
    if not EMAIL_ENABLED:
        return
    print(f"{Colors.BLUE}\n📧 Attempting to email {ALERT_RECIPIENT}...{Colors.END}")
    try:
        message = MIMEMultipart()
        message["From"] = EMAIL_ADDRESS
        message["To"] = ALERT_RECIPIENT
        message["Subject"] = subject
        
        message.attach(MIMEText(body, "plain"))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.send_message(message)
        server.quit()
        print(f"{Colors.GREEN}    ✅ Email sent successfully!{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}    ❌ Failed to send email: {e}{Colors.END}")

# --- MAIN LOOP ---
print("=" * 60)
print(f"{Colors.BOLD}{Colors.BLUE}🛡️  HOT BEANS SECURITY BOT ACTIVATED 🛡️{Colors.END}")
print("=" * 60)
print(f"Target: {TARGET_URL}")
print(f"Checking every {CHECK_INTERVAL} seconds")
print(f"Logging: {'ON' if LOG_TO_FILE else 'OFF'}")
print(f"Dashboard: {DASHBOARD_FILE}")
print(f"{Colors.GREEN}🌐 Open dashboard: {DASHBOARD_FILE}{Colors.END}")
print("Press CTRL+C to stop.")
print("=" * 60)

while True:
    try:
        print(f"\n{Colors.BOLD}{'=' * 60}{Colors.END}")
        print(f"{Colors.BOLD}⏰ SECURITY CHECK @ {time.strftime('%H:%M:%S')}{Colors.END}")
        print(f"{Colors.BOLD}{'=' * 60}{Colors.END}")
        
        site_up = check_site_is_up(TARGET_URL)
        missing_headers = check_missing_security_headers(TARGET_URL) if site_up else []
        exposed_files = check_for_exposed_files(TARGET_URL) if site_up else []
        
        current_state = {
            "site_up": site_up,
            "missing_headers": missing_headers,
            "exposed_files": exposed_files
        }
        changes = detect_changes(current_state)
        
        report = generate_report(site_up, missing_headers, exposed_files, bool(changes))
        
        print(f"\n{report}")
        
        if changes:
            print(f"{Colors.YELLOW}🔄 CHANGES DETECTED:{Colors.END}")
            for change in changes:
                print(f"{Colors.YELLOW}   - {change}{Colors.END}")
        
        save_report_to_file(report)
        generate_dashboard(site_up, missing_headers, exposed_files)
        
        if not site_up or missing_headers or exposed_files:
            send_email("🚨 ALERT: Hot Beans Web Needs Attention!", report)
        else:
            print(f"\n{Colors.GREEN}✅ All systems secure. No email sent.{Colors.END}")
        
        time.sleep(CHECK_INTERVAL)
        
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}🛑 Security bot stopped by user.{Colors.END}")
        break
    except Exception as e:
        print(f"{Colors.RED}❌ Unexpected error: {e}{Colors.END}")
        time.sleep(CHECK_INTERVAL)