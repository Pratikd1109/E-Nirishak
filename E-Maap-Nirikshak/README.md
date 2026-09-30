# E-Maap Nirikshak — ई-माप निरीक्षक

> **Unified Online Verification & Digital Certification Platform**  
> for Weighing and Measuring Instruments under the **Legal Metrology Act, 2009**

**Ministry of Consumer Affairs, Food & Public Distribution — Government of India**  
SIH 2026 · Problem Statement 26036 · Team: Vajra Dominators

---

## Overview

E-Maap Nirikshak is a full-stack prototype portal that digitises the end-to-end lifecycle of legal metrology verification in India — from instrument registration and inspection scheduling to QR-enabled digital certificates and enforcement tracking. The platform serves four distinct stakeholder groups through a single, role-based interface.

---

## Features

### 🏭 Instrument Owner (व्यवसायी)
- Register weighing/measuring instruments with complete metadata
- Apply for initial or re-verification online — no physical visit needed
- Track application status in real time
- Download QR-enabled digital Certificates of Verification
- Receive automated expiry alerts (90 / 30 / 7 days before expiry)
- View full instrument passport and inspection history

### 👮 Legal Metrology Officer (LMO)
- View assigned verification applications on a live dashboard
- Conduct field inspections with GPS-verified observations and photo evidence
- Record pass/fail results and submit inspection reports digitally
- Maintain a searchable inspection history

### 🏢 GATC — Govt. Approved Test Centre (परीक्षण केंद्र)
- Accept testing assignments for instruments requiring lab verification
- Submit detailed test results and generate certificates
- Maintain a full audit trail of all completed tests

### 🛡️ Administrator (प्रशासक)
- Manage all stakeholder accounts (owners, LMOs, GATCs)
- Review and approve/reject applications queue
- Browse and issue from the certificate registry
- Run enforcement actions and flag non-compliant instruments
- Generate reports with live Recharts dashboards

### 🌐 Public Verification (No login required)
- Scan a certificate QR code or enter a Certificate ID
- Instantly verify instrument status, validity, and inspection history

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | React Router v7 |
| State Management | Zustand v5 |
| UI / Styling | Tailwind CSS v4 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Forms | React Hook Form + Zod |
| QR Codes | qrcode.react |
| Date Utils | date-fns |
| Data | In-memory mock database (localStorage-persisted) |

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # AppLayout, Sidebar, TopBar
│   └── shared/          # StatCard, StatusBadge, Toast, LoadingSpinner, EmptyState
├── data/
│   ├── api.js           # Async mock API wrappers
│   └── mockDatabase.js  # In-memory DB with localStorage persistence
├── pages/
│   ├── Login.jsx        # Role-selector + login (government portal style)
│   ├── admin/           # AdminDashboard, ApplicationsQueue, Stakeholders,
│   │                    #   CertificateRegistry, Enforcement, Reports
│   ├── gatc/            # GATCDashboard, GATCAssignments, GATCHistory
│   ├── lmo/             # LMODashboard, Assignments, ConductInspection,
│   │                    #   InspectionHistory
│   ├── owner/           # OwnerDashboard, MyInstruments, RegisterInstrument,
│   │                    #   InstrumentPassport, Applications, ApplyVerification,
│   │                    #   Certificates, Notifications
│   └── public/          # PublicVerify (QR / Certificate ID lookup)
├── store/
│   └── useAppStore.js   # Zustand store — auth, language, toasts
└── App.jsx              # Route definitions + auth guards
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & Run

```bash
# Clone the repo
git clone https://github.com/TechnoTanishq/E-Maap-Nirikshak.git
cd E-Maap-Nirikshak

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Demo Accounts

All accounts use password **`1234`**.

| Role | Demo User |
|---|---|
| Instrument Owner | Ramesh Traders |
| Legal Metrology Officer | Arvind Sharma |
| GATC | National Weights & Measures Lab |
| Administrator | Controller of Weights & Measures |
| Public Verification | No login required |

---

## Multi-Language Support

The portal supports 5 languages via the language switcher in the header:

| Language | Native Script |
|---|---|
| English | English |
| Hindi | हिंदी |
| Gujarati | ગુજરાતી |
| Urdu | اردو |
| Marathi | मराठी |

---

## Screenshots

> Login page with role selector, government-style header, and notice board.  
> Dashboard views for Owner, LMO, GATC, and Admin roles.  
> Public certificate verification with QR scan support.

---

## Legal References

- Legal Metrology Act, 2009
- Legal Metrology (General) Rules, 2011
- Ministry of Consumer Affairs, Food & Public Distribution — [consumeraffairs.gov.in](https://consumeraffairs.gov.in)

---

## Team

**Vajra Dominators** — Smart India Hackathon 2026  
Problem Statement **26036**

---

## License

This project is a prototype built for SIH 2026 and is intended for demonstration purposes only.
