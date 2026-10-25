"""Generate a professional 13-page PDF bundling all curated client-side screenshots."""
import json
from pathlib import Path
from PIL import Image
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS_DIR = ROOT / 'submission_package/screenshots'
OUTPUT_PKG = ROOT / 'submission_package/LabFlow_Screenshots.pdf'
OUTPUT_LOCAL = ROOT / '.local/submission/LabFlow_Screenshots.pdf'
DETAILS_FILE = ROOT / '.local/submission-details.json'

details = json.loads(DETAILS_FILE.read_text()) if DETAILS_FILE.exists() else {}
author_name = details.get('fullName', 'Milan KB')
register_no = details.get('studentId', 'SHR25CS176')
serial_no = details.get('serialNumber', '225763')
institution = details.get('institution', 'Sahrdaya College of Engineering and Technology, Kodakara')

SCREENS = [
    {
        'file': '01-login.jpg',
        'title': 'Sign-In & Laboratory Access Gate',
        'feature': 'Feature F1 — Student & Administrator Authentication',
        'desc': 'Secure sign-in interface supporting institutional credentials, active session restoration, CSRF tokens, and rate-limited authentication attempts.'
    },
    {
        'file': '02-student-registration.jpg',
        'title': 'Student Account Registration',
        'feature': 'Feature F1 — Student Self-Registration',
        'desc': 'Student registration with strict boundary validation, email normalization, password complexity policy, and atomic duplicate conflict guards.'
    },
    {
        'file': '03-student-catalog.jpg',
        'title': 'Equipment Catalog & Availability Browser',
        'feature': 'Feature F3 — Equipment Discovery & Search',
        'desc': 'Live searchable inventory catalog displaying individual asset tags, domain classifications, storage locations, and current operational states.'
    },
    {
        'file': '04-student-request-other.jpg',
        'title': 'Equipment Loan Requisition Form',
        'feature': 'Feature F5 — Borrowing Request & Unlisted Needs',
        'desc': 'Student requisition form with categorized instrument dropdowns, purpose presets, and free-text description for unlisted custom equipment needs.'
    },
    {
        'file': '05-student-request-history.jpg',
        'title': 'Student Borrowing History & Status',
        'feature': 'Feature F5 — Loan Lifecycle Tracking',
        'desc': 'Student dashboard showing personal request timeline, status indicators (Pending, Approved, Issued, Returned), and pre-handover cancellation.'
    },
    {
        'file': '06-admin-dashboard.jpg',
        'title': 'Administrator Circulation Dashboard',
        'feature': 'Feature F10 — Operational Overview & Summary',
        'desc': 'Real-time laboratory overview tracking pending approvals, active circulation counts, overdue loans, and pending damage condition inspections.'
    },
    {
        'file': '07-admin-inventory.jpg',
        'title': 'Laboratory Inventory Register',
        'feature': 'Feature F4 — Inventory Management & Asset Tagging',
        'desc': 'Complete physical asset catalog with operational state filters (Available, Reserved, Issued, Maintenance, Archived) and inline lifecycle actions.'
    },
    {
        'file': '08-admin-register-asset.jpg',
        'title': 'Asset Registration & Metadata Entry',
        'feature': 'Feature F4 — Asset Provisioning',
        'desc': 'Dialog for registering new physical laboratory instruments with unique asset tags, domain categorization, model specifications, and storage locations.'
    },
    {
        'file': '09-admin-request-management.jpg',
        'title': 'Administrator Request Review & Decision',
        'feature': 'Feature F6 & F7 — Approval, Assignment & Rejection',
        'desc': 'Decision queue allowing staff administrators to review pending student requests, assign available physical assets to unlisted requests, and set loan durations.'
    },
    {
        'file': '10-admin-return-and-history.jpg',
        'title': 'Inspected Return & Condition Assessment',
        'feature': 'Feature F8 & F9 — Equipment Return & Damage Audit',
        'desc': 'Staff return dialog requiring physical condition verification, recording inspection notes for damaged returns, and auditing complete lifecycle event history.'
    },
    {
        'file': '11-mobile-overview.jpg',
        'title': 'Mobile Responsive Catalog (320px Viewport)',
        'feature': 'Feature F11 — Responsive & Accessible Interaction',
        'desc': 'Responsive single-column catalog reflow at 320px viewport without horizontal scrolling, preserving filter controls and touch targets.'
    },
    {
        'file': '12-mobile-request-form.jpg',
        'title': 'Mobile Requisition Flow (320px Viewport)',
        'feature': 'Feature F11 — Mobile Form Controls',
        'desc': 'Mobile-optimized borrowing form demonstrating accessible touch inputs, responsive dropdowns, and date picker integration on compact screens.'
    },
    {
        'file': '13-admin-asset-details.jpg',
        'title': 'Asset Specification & Operational History',
        'feature': 'Feature F4 & F10 — Detailed Asset Inspection',
        'desc': 'Detailed view of an individual laboratory instrument showing serial numbers, maintenance history, current borrower assignment, and audit logs.'
    }
]

def build_pdf(output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output_path), pagesize=letter)
    page_w, page_h = letter # 612 x 792 pt

    total_pages = len(SCREENS)

    for idx, screen in enumerate(SCREENS):
        page_num = idx + 1
        img_path = SCREENSHOTS_DIR / screen['file']
        
        # --- Top Header Banner ---
        # Dark header bar
        c.setFillColor(colors.HexColor('#1f2937'))
        c.rect(0, page_h - 48, page_w, 48, fill=True, stroke=False)
        
        c.setFillColor(colors.white)
        c.setFont('Helvetica-Bold', 12)
        c.drawString(36, page_h - 26, 'LabFlow — Laboratory Equipment Management System')
        
        c.setFont('Helvetica', 10)
        c.drawRightString(page_w - 36, page_h - 26, f'Screen {page_num} of {total_pages}')
        
        c.setFillColor(colors.HexColor('#9ca3af'))
        c.setFont('Helvetica', 8.5)
        c.drawString(36, page_h - 40, 'ICTAK Capstone Project | Major Client-Side Application Views')

        # --- Sub-Header / Screen Title & Feature ---
        y_cursor = page_h - 72
        c.setFillColor(colors.HexColor('#111827'))
        c.setFont('Helvetica-Bold', 13)
        c.drawString(36, y_cursor, f"{page_num}. {screen['title']}")
        
        y_cursor -= 14
        c.setFillColor(colors.HexColor('#2563eb')) # Accent blue
        c.setFont('Helvetica-Bold', 9)
        c.drawString(36, y_cursor, screen['feature'].upper())

        y_cursor -= 14
        c.setFillColor(colors.HexColor('#4b5563'))
        c.setFont('Helvetica', 9)
        c.drawString(36, y_cursor, screen['desc'])

        # --- Image Placement Area ---
        top_available = y_cursor - 12
        bottom_available = 48 # reserve for footer
        box_w = page_w - 72 # 540 pt
        box_h = top_available - bottom_available # ~600 pt

        with Image.open(img_path) as im:
            orig_w, orig_h = im.size

        # Scale to fit box
        scale = min(box_w / orig_w, box_h / orig_h)
        draw_w = orig_w * scale
        draw_h = orig_h * scale

        # Center inside box
        draw_x = 36 + (box_w - draw_w) / 2
        draw_y = bottom_available + (box_h - draw_h) / 2

        # Draw subtle border / shadow card
        c.setStrokeColor(colors.HexColor('#d1d5db'))
        c.setLineWidth(1)
        c.rect(draw_x - 1, draw_y - 1, draw_w + 2, draw_h + 2, fill=False, stroke=True)

        # Draw Image
        c.drawImage(str(img_path), draw_x, draw_y, width=draw_w, height=draw_h)

        # --- Footer ---
        c.setStrokeColor(colors.HexColor('#e5e7eb'))
        c.setLineWidth(0.75)
        c.line(36, 36, page_w - 36, 36)

        c.setFillColor(colors.HexColor('#6b7280'))
        c.setFont('Helvetica', 8)
        c.drawString(36, 22, f"Student: {author_name} | Reg: {register_no} (Sr: {serial_no}) | {institution}")
        c.drawRightString(page_w - 36, 22, f"Page {page_num} of {total_pages}")

        c.showPage()

    c.save()
    print(f"Generated: {output_path} ({total_pages} pages)")

if __name__ == '__main__':
    build_pdf(OUTPUT_PKG)
    build_pdf(OUTPUT_LOCAL)
