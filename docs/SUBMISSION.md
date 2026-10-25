# LabFlow submission preparation

Prepared 25 October 2026. Individual capstone; no academic approval or submission is claimed.

The retained ICTAK project guide, section 13, supplies the following checklist. The report follows the supplied internship template's nine sections. Neither reference specifies an LMS deadline, required upload filename or upload procedure. A presentation or video is not specified in those references.

| Guide item | Current evidence / remaining action |
|---|---|
| Accessible repository URL | https://github.com/milan-kb/LabFlow — confirm the assessor can open it when submitting. |
| Working hosted URL | https://labflow-lemon.vercel.app — deployed source `684af3c`; readiness and current student sign-in/dropdowns verified. |
| README with setup, features, stack and live links | Present in root README. |
| Key screen and mobile screenshots | Report contains current student form, local administrator return and hosted 320px form captures. |
| Core flows tested live | Historical full hosted lifecycle passed 23 October. Current redesigned full journey passed locally 25 October; the owner declined a fresh live borrowing write test. This distinction remains explicit in the report. |
| Environment files excluded; example included | `.env` excluded; `server/.env.example` contains variable names. |
| No secrets or personal data in repository/screenshots | Credentials and personalized reports remain ignored. Demo screenshots use synthetic data. Never upload the entire `.local` folder. |
| Meaningful Git history | M0 and incremental development history retained. |
| Honest limitations / improvements | README, QUALITY and report record remaining browser, contrast and performance limits. |

## Files for review

Personalized Word and PDF copies are generated in ignored `.local/submission/`:

- `LabFlow_Project_Report.docx` and `.pdf`
- `LabFlow_SRS.docx` and `.pdf`

Names are proposed, not an asserted LMS convention. Author, registration number, serial number and institution are supplied through ignored `.local/submission-details.json`; public Markdown retains no registration number. Mentor and submission deadline remain unknown. SRS approval remains pending.

The original report template and guide remain unchanged. Rebuild with the bundled document runtime using `scripts/export_report.py` and `scripts/export_srs.py --details .local/submission-details.json --output .local/submission/LabFlow_SRS.docx`. Render and inspect every page after changes; PDF copies must match the reviewed Word files.

## Before uploading

1. Review the personalized cover and report, including institution spelling; confirm the SRS is suitable for approval/submission.
2. Obtain the actual LMS upload instructions if available; rename only when required. No receipt, approval or deadline has been invented.
3. Share the two project URLs and requested documents. Provide synthetic reviewer credentials privately through the authorized assessment channel, never in Git or screenshots.
4. Record the real submission receipt only after the student submits. No external submission is authorized by document preparation alone.
