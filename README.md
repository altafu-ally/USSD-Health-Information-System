# Enterprise USSD Health Information System & Outbreak Sentinel

## 🏛️ System Core Architecture
This system functions as an encrypted telemetry webhook infrastructure mapping real-time text menus to cellular end-users, while assessing demographic outbreak vulnerabilities asynchronously.

```text
[ Feature / Analog Phone ] ➔ Dials Shortcode (*123#)
       │
       ▼
[ Mobile Operator Gateway / Africa's Talking ] ➔ HTTPS POST Hook (IP Protected)
       │
       ▼
[ Node.js Webhook Server (Render Cloud Stack) ] ➔ Evaluates State & Updates SQLite Core
       │
       ├─── [ Valid Entry ] ➔ Responds back with Plain Text Menu Layouts (CON / END)
       │
       └─── [ Outbreak Risk Found ] ➔ Automatically Dispatches Outbreak SMS Alert to Medical Team
```

## 🔐 Enhanced Production Variables Array (Render/Ecosystem Configuration)
To maintain structural security containment barriers, populate these secure keys directly inside your Cloud Environment variable array dashboard panel:

*   `NODE_ENV`: `production` (Activates structural IP gateway filtering defenses).
*   `USSD_API_KEY`: A custom token used to authorize access to your webhooks.
*   `ADMIN_PIN`: Secret 4-digit code (e.g., `2026`) providing access to the database dashboard reports.
*   `DOCTOR_PHONE`: Target supervisor contact receiving emergency SMS dispatches (e.g., `+255683218814`).
*   `AT_USERNAME`: Africa's Talking account name (`sandbox` for testing or production profile identifier).
*   `AT_SMS_API_KEY`: Africa's Talking development console API access token.

## 🌟 Expanded Operational Capabilities
1.  **Patient Triage Stream:** Direct validation loops screening high fevers or coughs.
2.  **Clinic Locator Mapping:** Evaluates user context locations to match working nearby hospital facilities.
3.  **Secure Supervisor Metrics Summary (Option 4):** PIN-locked system dashboard summarizing total reports from the SQLite engine database.
4.  **Sentinel Outbreak System:** Monitored alert algorithm tracking volume thresholds. It automatically triggers emergency alerts if more than 5 matching alerts occur in under 1 hour.
