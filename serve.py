#!/usr/bin/env python3
"""
Local development server for Drishta Vidya website.
Supports clean extensionless URLs (e.g. /equip -> equip.html) matching .htaccess.
"""
import http.server
import os
import sys

PORT = 8000

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Extract path without query parameters or anchors
        path_without_query = self.path.split('?')[0].split('#')[0]
        raw_path = path_without_query.lstrip('/')

        # Intercept api/get-data.js.php to provide valid mock JS data in local preview
        if raw_path == 'api/get-data.js.php':
            mock_js = """/** Auto-generated mock data for local preview */
window.coursesData = [
  {
    "id": 1,
    "title": "EQuip for Leaders",
    "program": "EQuip",
    "audience": "Senior executives, business owners & entrepreneurs",
    "description": "Build a high-performance culture by leading with clarity, steadiness and empathy through change and uncertainty.",
    "duration": "2-Day Live Workshop",
    "durationDays": 2,
    "followUp": "60-day in EQ OS",
    "participants": "20–30",
    "icon": "🚀",
    "featured": true,
    "tags": ["Leadership", "Organization Development", "Emotional Intelligence", "EQ OS"],
    "price": 15000,
    "priceLabel": "₹15,000",
    "priceNote": "per participant + 18% GST",
    "paymentLink": "",
    "upiId": "drishtavidya@upi"
  },
  {
    "id": 2,
    "title": "EQuip for Teams",
    "program": "EQuip",
    "audience": "Mid-level managers, team leads & professionals",
    "description": "Break the mindset barriers that hold teams back during growth and change. Handle conflict and work with less friction.",
    "duration": "2-Day Live Workshop",
    "durationDays": 2,
    "followUp": "60-day in EQ OS",
    "participants": "20–30",
    "icon": "🔄",
    "featured": true,
    "tags": ["Emotional Intelligence", "Team Performance", "Collaboration", "EQ OS"],
    "price": 12000,
    "priceLabel": "₹12,000",
    "priceNote": "per participant + 18% GST",
    "paymentLink": "",
    "upiId": "drishtavidya@upi"
  },
  {
    "id": 3,
    "title": "EQuip for Educators",
    "program": "EQuip",
    "audience": "Teachers, faculty & educational institutions",
    "description": "Build emotionally intelligent classrooms and campuses. Foster better relationships between teachers, students and parents.",
    "duration": "2-Day Live Workshop",
    "durationDays": 2,
    "followUp": "60-day in EQ OS",
    "participants": "20–30",
    "icon": "🧠",
    "featured": true,
    "tags": ["Education", "Teacher Training", "Emotional Intelligence", "EQ OS"],
    "price": 10000,
    "priceLabel": "₹10,000",
    "priceNote": "per participant + 18% GST",
    "paymentLink": "",
    "upiId": "drishtavidya@upi"
  },
  {
    "id": 4,
    "title": "LEAD — Virtual L&D",
    "program": "LEAD",
    "audience": "HR teams, L&D managers & training departments",
    "description": "Your learning & development department without the headcount: needs assessment, learning roadmaps, delivery and effectiveness tracking.",
    "duration": "Ongoing Engagement",
    "durationDays": 0,
    "followUp": "",
    "participants": "Open",
    "icon": "📚",
    "featured": true,
    "tags": ["Virtual L&D", "Learning Design", "HR Partnership"],
    "price": 0,
    "priceLabel": "Custom Quote",
    "priceNote": "Monthly / annual engagement",
    "paymentLink": "",
    "upiId": "drishtavidya@upi"
  },
  {
    "id": 5,
    "title": "SimplifAI Workshop",
    "program": "SimplifAI",
    "audience": "MSME owners, professional practices & managers",
    "description": "A hands-on workshop for business owners: simplify a real process first, then put AI to work on it with a 90-day action plan.",
    "duration": "1–2 Day Workshop",
    "durationDays": 2,
    "followUp": "90-day action plan",
    "participants": "15–20",
    "icon": "⚡",
    "featured": true,
    "tags": ["SimplifAI", "CLEAR Method", "AI Adoption", "Process Optimization"],
    "price": 7500,
    "priceLabel": "₹7,500",
    "priceNote": "per participant + 18% GST",
    "paymentLink": "",
    "upiId": "drishtavidya@upi"
  },
  {
    "id": 6,
    "title": "SimplifAI Consulting",
    "program": "SimplifAI",
    "audience": "Growing businesses & leadership teams",
    "description": "Takes the CLEAR method into your business over 30 to 90 days. Process audit, AI workflow automation, and team adoption.",
    "duration": "30–90 Days",
    "durationDays": 60,
    "followUp": "Ongoing advisory",
    "participants": "Custom",
    "icon": "🤖",
    "featured": false,
    "tags": ["Consulting", "Automation", "Advisory"],
    "price": 0,
    "priceLabel": "Custom Quote",
    "priceNote": "Based on scope & processes",
    "paymentLink": "",
    "upiId": "drishtavidya@upi"
  }
];
var coursesData = window.coursesData;

window.upcomingPrograms = [
  {
    "id": "EQ-LDR-NOV26-CBE",
    "program": "EQuip for Leaders",
    "courseId": 1,
    "date": "Nov 14–15, 2026",
    "location": "Coimbatore",
    "venue": "Coimbatore, Tamil Nadu",
    "mode": "In-Person",
    "seats": 12
  },
  {
    "id": "SIMP-NOV26-CHE",
    "program": "SimplifAI Workshop",
    "courseId": 5,
    "date": "Nov 28, 2026",
    "location": "Chennai",
    "venue": "Chennai, Tamil Nadu",
    "mode": "In-Person",
    "seats": 8
  },
  {
    "id": "EQ-TMS-DEC26-CBE",
    "program": "EQuip for Teams",
    "courseId": 2,
    "date": "Dec 5–6, 2026",
    "location": "Coimbatore",
    "venue": "Coimbatore, Tamil Nadu",
    "mode": "In-Person",
    "seats": 15
  },
  {
    "id": "EQ-EDU-DEC26-ONL",
    "program": "EQuip for Educators",
    "courseId": 3,
    "date": "Dec 19–20, 2026",
    "location": "Online",
    "venue": "Online (Zoom link shared after registration)",
    "mode": "Online",
    "seats": 20
  },
  {
    "id": "SIMP-JAN27-BLR",
    "program": "SimplifAI Workshop",
    "courseId": 5,
    "date": "Jan 16, 2027",
    "location": "Bangalore",
    "venue": "Bangalore, Karnataka",
    "mode": "In-Person",
    "seats": 10
  }
];
var upcomingPrograms = window.upcomingPrograms;
"""
            body = mock_js.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/javascript; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # If path doesn't have an extension, check if corresponding .html exists
        if raw_path and not os.path.splitext(raw_path)[1]:
            html_file = raw_path + '.html'
            if os.path.exists(html_file):
                query_str = ''
                if '?' in self.path:
                    query_str = '?' + self.path.split('?', 1)[1]
                self.path = '/' + html_file + query_str
        
        return super().do_GET()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        path_without_query = self.path.split('?')[0].split('#')[0]
        raw_path = path_without_query.lstrip('/')

        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        if raw_path == 'api/contact.php':
            try:
                import json, re, smtplib, ssl
                from email.mime.text import MIMEText
                from email.mime.multipart import MIMEMultipart

                data = json.loads(post_data.decode('utf-8')) if post_data else {}
                
                first_name = data.get('first_name', '')
                last_name  = data.get('last_name', '')
                full_name  = f"{first_name} {last_name}".strip() or "Website Visitor"
                email      = data.get('email', '')
                phone      = data.get('phone', 'N/A')
                org        = data.get('organization', 'N/A')
                course     = data.get('course_interest', 'General Enquiry')
                team_size  = data.get('team_size', 'N/A')
                message    = data.get('message', '')

                # Read credentials from env.php
                env = {}
                env_path = os.path.join(os.path.dirname(__file__), 'env.php')
                if os.path.exists(env_path):
                    with open(env_path) as f:
                        for line in f:
                            m = re.search(r"define\('([^']+)',\s*'([^']*)'\);", line)
                            if m:
                                env[m.group(1)] = m.group(2)

                host = env.get('ZOHO_SMTP_HOST', 'smtp.zoho.com')
                user = env.get('ZOHO_SMTP_USER')
                password = env.get('ZOHO_SMTP_PASS')
                port = int(env.get('ZOHO_SMTP_PORT') or 465)

                email_sent = False
                if user and password:
                    msg = MIMEMultipart('alternative')
                    msg['Subject'] = f"New Website Enquiry: {course} ({full_name})"
                    msg['From'] = f"Drishta Vidya Website <{user}>"
                    msg['To'] = 'namaste@drishtavidya.com'
                    if email:
                        msg['Reply-To'] = f"{full_name} <{email}>"

                    html_body = f"""
                    <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
                        <div style="border-bottom: 2px solid #c8960c; padding-bottom: 12px; margin-bottom: 20px;">
                            <h2 style="color: #0d2137; margin: 0; font-size: 20px;">New Enquiry from Website</h2>
                            <span style="font-size: 13px; color: #64748b;">Submitted via drishtavidya.com contact form</span>
                        </div>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <tr><td style="padding: 8px 0; font-weight: bold; width: 140px; color: #64748b;">Name:</td><td style="padding: 8px 0; color: #0d2137; font-size: 15px;"><strong>{full_name}</strong></td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Email:</td><td style="padding: 8px 0;"><a href="mailto:{email}" style="color: #2563eb;">{email}</a></td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Phone:</td><td style="padding: 8px 0; color: #0d2137;">{phone}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Organization:</td><td style="padding: 8px 0; color: #0d2137;">{org}</td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Program:</td><td style="padding: 8px 0; color: #0d2137;"><strong>{course}</strong></td></tr>
                            <tr><td style="padding: 8px 0; font-weight: bold; color: #64748b;">Team Size:</td><td style="padding: 8px 0; color: #0d2137;">{team_size}</td></tr>
                        </table>
                        <div style="padding: 16px; background: #f8f9fb; border-left: 4px solid #0d2137; border-radius: 4px; margin-bottom: 24px;">
                            <h4 style="margin: 0 0 8px; color: #0d2137; font-size: 14px;">Message:</h4>
                            <p style="margin: 0; font-size: 14.5px; color: #334155; white-space: pre-wrap;">{message}</p>
                        </div>
                        <p style="font-size: 12px; color: #94a3b8; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                            You can reply directly to this email to respond to {full_name}.
                        </p>
                    </div>
                    """
                    text_body = f"New Enquiry:\nName: {full_name}\nEmail: {email}\nPhone: {phone}\nOrg: {org}\nProgram: {course}\nMessage:\n{message}"
                    msg.attach(MIMEText(text_body, 'plain'))
                    msg.attach(MIMEText(html_body, 'html'))

                    context = ssl.create_default_context()
                    with smtplib.SMTP_SSL(host, port, context=context, timeout=12) as server:
                        server.login(user, password)
                        server.sendmail(user, ['namaste@drishtavidya.com'], msg.as_string())
                    email_sent = True
                    print(f"📧 [ENQUIRY SENT] From {email} ({full_name}) -> namaste@drishtavidya.com")

                response = json.dumps({'success': True, 'email_sent': email_sent, 'recipient': 'namaste@drishtavidya.com'}).encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(response)))
                self.end_headers()
                self.wfile.write(response)
                return
            except Exception as e:
                print(f"❌ [ENQUIRY ERROR]: {e}")
                import json
                response = json.dumps({'success': False, 'error': str(e)}).encode('utf-8')
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Length', str(len(response)))
                self.end_headers()
                self.wfile.write(response)
                return

        if raw_path == 'api/register.php':
            import json
            response = json.dumps({'success': True, 'id': 'mock-dev-id'}).encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Length', str(len(response)))
            self.end_headers()
            self.wfile.write(response)
            return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    server_address = ('127.0.0.1', port)
    
    print("=" * 60)
    print(f"🚀 Drishta Vidya Local Preview Server")
    print(f"👉 Local URL: http://localhost:{port}/")
    print(f"📄 Clean URLs enabled (e.g. http://localhost:{port}/equip)")
    print("=" * 60)
    print("Press Ctrl + C in terminal to stop.")
    
    try:
        httpd = http.server.HTTPServer(server_address, CleanURLHandler)
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
