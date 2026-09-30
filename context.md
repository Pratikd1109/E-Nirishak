# Maap Niriksak — Project Context

**Team:** Vajra Dominators
**Event:** Smart India Hackathon 2026
**Problem Statement ID:** 26036
**Organization:** Ministry of Consumer Affairs, Food & Public Distribution
**Department:** Department of Consumer Affairs (DoCA)
**Category:** Software | **Theme:** Miscellaneous

---

## 1. Problem Statement

Under the **Legal Metrology Act, 2009** and the **Legal Metrology (General) Rules, 2011**, every weighing and measuring instrument used in trade (shop scales, petrol pump dispensers, weighbridges, taxi meters, etc.) must be periodically verified and stamped by:
- **Legal Metrology Officers (LMOs)** — State Legal Metrology Department officials
- **GATCs (Government Approved Test Centres)** — government-notified private test centres

Currently this process is largely manual: paper applications, physical scheduling, paper certificates, disconnected local record-keeping. This causes delays, poor cross-jurisdiction visibility, and no way for consumers/regulators to verify a certificate's authenticity.

**Required:** A unified online verification and digital certification platform for the full lifecycle — registration, application, scheduling, inspection, certification (with QR), validity tracking, and re-verification.

**Reference legal documents (dataset link):** consumeraffairs.gov.in — Legal Metrology Act, 2009 + Legal Metrology (General) Rules, 2011 (defines verification periods per instrument type, testing procedures, stamping rules). State Enforcement Rules add fee/jurisdiction/license-form specifics.

---

## 2. Our Solution: "Maap Niriksak"

**Tagline:** Register. Verify. Certify. Track. Trust.

A secure web + mobile platform giving every instrument a **persistent Digital Instrument Passport** — one continuous, searchable lifecycle record instead of scattered paper files — connecting 5 stakeholder groups through role-based workflows.

### Core lifecycle flow
```
Owner Registers Instrument → Applies for Verification → Admin Allocates (LMO/GATC)
→ Scheduling → Field Inspection/Testing → Digital Observations & Evidence
→ Result (Pass/Fail/Needs Review) → Digital Certificate Generated (QR)
→ Public QR Verification → Validity Monitoring → Re-verification (loop)
```
Everything is linked by one **Instrument ID** — this is the central design principle. Do not build disconnected screens; every entity (application, inspection, certificate) traces back to one instrument record.

### Stakeholders & capabilities
| Stakeholder | Key capabilities |
|---|---|
| **Instrument Owner/User** | Register profile & instruments, submit verification/re-verification applications, track status, view schedules/results/certificates, receive expiry alerts |
| **LMO (Legal Metrology Officer)** | View assignments, conduct field verification, record observations/measurements, capture evidence, submit results |
| **GATC** | View allocated tests, perform testing, record results, upload evidence, submit results |
| **Administrator** | Manage stakeholders/instruments/applications/allocations/certificates, dashboards, reports, pendency, enforcement |
| **Public/Consumer** | Scan a QR code, no login required, verify certificate authenticity/validity/status |

### Digital Instrument Passport (core data concept)
Persistent digital identity per instrument containing: Instrument ID & type, manufacturer/model/serial number, capacity/range, location, owner info, registration date, full verification/re-verification history, all certificates, inspection results & evidence, current validity/status.

### Platform split
- **Web Portal** — Owner, LMO, GATC, Admin desk-based workflows: registration, tracking, dashboards, reports, certificate management, enforcement analytics.
- **Mobile App** (Flutter, separate teammate workstream) — Field officers (offline-first inspection, evidence capture, QR scanning) + Owners/Consumers (registration on the go, certificate wallet, QR scan-to-verify).

---

## 3. Detailed Verification Workflow (13 steps)

1. Instrument Registration
2. Application (verification / re-verification)
3. Review (enters official workflow)
4. Allocation (Admin assigns LMO or GATC)
5. Scheduling (date/time)
6. Inspection/Testing
7. Digital Observation (measurements, checklist, remarks)
8. Evidence (photos, documents)
9. Result (PASS / FAIL / NEEDS REVIEW)
10. Certificate (generated after approval)
11. QR (secure verification identifier/URL embedded)
12. Monitoring (validity/due dates tracked)
13. Re-verification (owner-initiated, before or after expiry)

### LMO field inspection checklist
Physical condition, Serial number match, Seal condition, Zero error, Accuracy test, Capacity, Measurement test, Display/reading, Other checks, Remarks. Measurement records: expected value, observed value, error, unit. Each checklist item: PASS / FAIL / NEEDS REVIEW.

### Offline-first field verification
Officer downloads an "Inspection Pack" before visiting (instrument details, owner details, previous certificate/history, checklist). Works fully offline — measurements, evidence, GPS, timestamps stored locally, record marked `SYNC_PENDING`. Syncs to server on reconnect → `SYNCED`.

---

## 4. Digital Certificate & QR Authentication

**Certificate fields:** Certificate Number, Instrument ID, Instrument Type, Manufacturer, Model, Serial Number, Owner, Verification Date, Issue Date, Valid Until, Verified By, Status, QR Code.

**QR design principle:** QR encodes only a **verification ID/URL** (e.g. `domain/verify/LMC-8F92A71X`) — never raw sensitive data. Scanning hits a public verification API that returns live status: `VALID`, `EXPIRING SOON`, `EXPIRED`, `REVOKED`, `NOT FOUND`, `INVALID`.

**Anti-forgery mechanism (key innovation):**
- Certificates are **digitally signed** (RSA/ECDSA) — any edit invalidates the signature.
- Every certificate event (issue/renew/revoke) written to a **SHA-256 hash-chained, append-only ledger** — tamper-evident without needing full blockchain infrastructure.
- Certificate hash also printed in plaintext on the PDF (manual cross-check fallback) plus a dynamic watermark.
- Core pitch line: *"A forged certificate is a copy of something. Ours is a live pointer to a server record — forging the paper doesn't forge the truth."*

**Automated expiry management:** configurable reminders at 90 / 30 / 7 days before expiry, then `EXPIRED` state.

---

## 5. Innovation & Uniqueness (headline features)

1. **Digital Instrument Passport** — lifecycle identity, not a one-time certificate.
2. **Tamper-proof certification** — digital signatures + hash-chained ledger + live-record QR verification.
3. **GPS-verified inspections** — officer's GPS at inspection time is compared against the instrument's registered address; mismatch beyond a threshold (e.g. >200m) auto-flags the inspection for review. Stops officers "verifying" instruments without visiting them.
4. **Offline-first field verification** — officers work with zero connectivity, auto-sync on reconnect.
5. **Voice-first, multilingual accessibility** *(mobile app)* — auto language/dialect detection, speech-to-text form filling, text-to-speech certificate status, for low-literacy/rural users. Candidate tech: Bhashini (India's govt multilingual speech API) or Whisper-based ASR.
6. **AI-assisted risk scoring** *(v2-ready)* — flags high-risk instruments/owners (repeat failures, complaint density, expired-certificate clustering) for targeted enforcement instead of random spot checks. Framed honestly as rule-based scoring in the prototype, ML-ready pipeline for real deployment once live inspection data accumulates.
7. **Unified stakeholder ecosystem** — one source of truth replacing siloed departmental systems.

### Secondary / future-scope ideas (not in prototype)
DigiLocker integration for certificate storage, Aadhaar-based e-KYC, UPI fee payment, USSD/SMS fallback for feature phones, compliance/trust badge for shops (visible "verified" rating), WhatsApp bot for status checks.

---

## 6. Scheduling & Allocation Logic — Hybrid (Automatic Suggestion + Manual Confirmation)

**Decision:** Not fully automatic, not fully manual. The system auto-computes a **ranked shortlist** of LMOs/GATCs using:
- Jurisdiction match (officer's zone covers instrument's address)
- Current workload (fewer pending assignments ranks higher)
- Distance (nearest officer first)

Admin sees a top suggestion with reasoning (e.g. *"Suggested: LMO Rajesh Kumar — Zone 3, 2 pending, 4.2 km away"*) with a one-click **Confirm**, or can expand and manually override.

**Why hybrid:**
- Fully automatic removes an accountable human decision point (a real government process needs one — audits, exceptions like officer leave/conflict of interest aren't capturable by rules alone).
- Fully manual recreates the exact bottleneck the problem statement complains about (manual scheduling delays).

**Pitch line:** *"The system recommends, the administrator decides — automation for speed, human oversight for accountability."*

Implementation is a simple sort/filter over officer data (jurisdiction + workload + distance) — no real ML required, but demos convincingly.

---

## 7. Technical Architecture (Full System)

```
Client Layer:      Owner Web/Mobile App | Officer Field App (offline) | Admin Dashboard
                                    ↓
Application/API:    Auth & RBAC → Scheduling Engine → Inspection Module
                     → Certificate Engine (QR + signing) → Alert Engine (expiry cron)
                                    ↓
Data Layer:          PostgreSQL (records) | Object Storage (certs/photos)
                     | Redis (cache/sessions) | Hash-chain Ledger (tamper-proof)
                                    ↓
Output/Interfaces:   Public QR Verification Portal | SMS/Email/Push Notifications
                     | Reports & PDF Export | (future: Govt API integrations)
```

**Security layer (cross-cutting):** API Gateway, JWT/OAuth2 authentication, RBAC authorization, TLS encryption (data in transit & at rest), audit logging on all workflow actions.

**Recommended stack (from teammate's detailed brief):**
- Mobile: Flutter, Dart, Material 3, Riverpod (state), GoRouter (nav), Dio (networking), Drift/SQLite (offline DB), flutter_secure_storage, qr_flutter + mobile_scanner, geolocator (GPS), image_picker/camera, connectivity_plus + WorkManager (background sync)
- Backend: Spring Boot or Node.js/Express
- AI/Risk service: Python + FastAPI (+ scikit-learn/XGBoost for risk scoring)
- Database: PostgreSQL
- Cache: Redis
- Object storage: S3/MinIO
- Containerization: Docker
- Cloud: AWS/Azure

**Suggested Flutter module structure:**
```
lib/ core/ (constants/ theme/ routing/ network/ storage/ errors/) widgets/
features/ (auth/ dashboard/ instruments/ applications/ inspections/
certificates/ qr_verification/ notifications/ complaints/ audit/ profile/ admin/)
models/ repositories/ services/ main.dart
```

---

## 8. Web Portal Prototype Scope (my workstream)

Building with **React 18 + Vite + Tailwind CSS + React Router v6**, mock data layer (no real backend), simulated role-based login (no real auth). Full page-by-page IA, mock data model, and build-order spec are documented separately in the Antigravity build prompt. Key point: mobile app (Flutter) is a **separate teammate workstream** — the web portal does not duplicate multilingual/voice features (mobile-only) or payment/DigiLocker integrations (future scope, out of prototype).

Demo path to wire end-to-end: Owner registers instrument → applies → Admin allocates (with suggestion) → LMO/GATC inspects (checklist + measurements + evidence + GPS flag) → certificate auto-generates with QR → Owner views certificate → Public scans QR and verifies live status.

---

## 9. RAG Opportunity (for teammate working on AI/data side)

The dataset link provided in the problem statement points to the actual **Legal Metrology Act, 2009** and **Legal Metrology (General) Rules, 2011** PDFs — these define verification cycles per instrument type, testing procedures, stamping rules, officer qualifications, and penalties. State-level Enforcement Rules add fee/jurisdiction variations.

Instead of hardcoding these rules, a **RAG pipeline over these legal PDFs** could power:
- Natural-language Q&A for officers/admins (e.g. "What's the re-verification period for a weighbridge?") answered directly from Rules text
- A field-officer legal-assistant chatbot for on-the-spot procedure lookup
- Auto-validation that an inspection checklist matches what the Rules require for that instrument category

This is a strong secondary innovation angle: it turns static legal documents into a queryable knowledge base rather than something read once and manually encoded into app logic.

**Priority documents to ingest:**
1. Legal Metrology (General) Rules, 2011 — most important (verification periods, testing/stamping procedures)
2. Legal Metrology Act, 2009 — roles, offences, penalties
3. State Legal Metrology Enforcement Rules — fees, license form formats, jurisdiction
4. (Skip) Numeration Rules, Packaged Commodities Rules — different problem domain, not relevant here

---

## 10. Naming

Considered Hindi/Sanskrit names for the platform: तुलामान (TulaMaan), मापतंत्र (MaapTantra), प्रमाण सेतु (Pramaan Setu), मापदंड (Maapdand), विश्वास मुद्रा (Vishwas Mudra), सत्यापन (Satyapan), मुद्रांकन (Mudrankan), डिजी-तुला (Digi-Tula), ई-मापतंत्र (e-MaapTantra), सुतुला (SuTula).

**Selected name: "Maap Niriksak"** (माप निरीक्षक — roughly "Measurement Inspector/Overseer").

---

## 11. Presentation Slides Completed

1. **Proposed Solution slide** — 3 sections: Proposed Solution, How It Addresses the Problem, Innovation & Uniqueness, plus a circular lifecycle-journey diagram (Register → Apply → Allocate → Inspect → Certify → QR-Verify → Monitor → Re-verify) and a Web Portal + Mobile App split visual.
2. **Technical Approach slide** — non-layered, numbered horizontal flow (1. Validation Gate → 2. Scheduling & Rules → 3. Field Inspection → 4. Verification & Evidence → 5. Certificate + AI Risk Intelligence), with a Regulatory & Trust Registry side box, a Security Layer band (API Gateway, JWT/OAuth2, RBAC, TLS, Audit Logging), a backend infra row, and a tech stack column.

Both diagrams built as standalone SVG files matching a shared visual style (colored borders, numbered badges, dashed feedback/registry arrows).

---

## 12. Open Items / Next Steps

- [ ] Build React web portal prototype (in progress — see Antigravity build prompt)
- [ ] Confirm data-model field alignment between web portal mock data and teammate's Flutter app (Instrument ID, GPS fields, evidence photo structure must match for a coherent joint demo)
- [ ] Teammate (Tanishq) evaluating RAG over Legal Metrology Act/Rules PDFs
- [ ] Decide whether AI risk scoring in the demo uses rule-based scoring (recommended) or a model trained on synthetic data
- [ ] Simplify Technical Approach slide into a lighter "primary" version if the current one is too dense for live presentation; keep current version as a detailed backup/appendix slide
