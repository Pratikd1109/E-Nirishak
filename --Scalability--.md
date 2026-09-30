### \--Scalability--



&#x20;                        MAAP NIRIKSAK

&#x20;                             │

&#x20;      ┌──────────────────────────────────┐

&#x20;      ↓                      ↓                      ↓

&#x20;  USERS / REQUESTS      FIELD OPERATIONS        DATA VOLUME

&#x20;      │                      │                       │

&#x20;Owners / LMOs /         Offline inspections     Instruments

&#x20;GATCs / Admin           GPS / Photos            Applications

&#x20;Public QR                Sync bursts             Inspections

&#x20;                                               Certificates

&#x20;                                                   │

&#x20;                                                   ↓

&#x20;                                          INTELLIGENCE

&#x20;                                          RAG / Risk







1 State

&#x20;  ↓

many districts

&#x20;  ↓

many officers

&#x20;  ↓

large instrument registry

&#x20;  ↓

millions of certificates

&#x20;  ↓

millions of public QR lookups





ISSUES:



1. one backend doing everything

Auth,Instrument Management,Applications,Allocation,Scheduling,Inspection,Certificate Generation,QR Verification,Notifications,Audit,Risk,RAG

&#x20;                Backend

&#x20;                   │    -> **solve using the Modular design**

&#x20;┌────────────────────────────┐

&#x20;↓                  ↓                   ↓

Core Workflow     Trust Module       Intelligence

&#x20;│                  │                   │

&#x20;├─ Instruments     ├─ Certificate      ├─ Risk

&#x20;├─ Applications    ├─ QR Verify        └─ RAG

&#x20;├─ Allocation      ├─ Signature

&#x20;├─ Scheduling      └─ Ledger

&#x20;└─ Inspection



2\. PostgreSQL

One DB handling both the government transactions, certificate issuance and Qr look up



&#x20;                  PostgreSQL

&#x20;                      │          -> **solve Distributed DB concept Or the Replicas**

&#x20;      ┌───────────┼────────────┐

&#x20;      ↓               ↓                ↓

Transactions       Dashboards       QR Lookups

&#x20;      ↓               ↓                ↓

Applications      Analytics        Public Traffic



3\. QR verification is one of your biggest scalability hotspots



problem : not make every QR scan hit the main transactional database.



&#x20;                  Internet

&#x20;                     │

&#x20;                     QR     -> **Solved using the Redis Cache(High read - low cost)** \&

&#x20;                     │		 -> **Separating the verification API from \& the transactional API**

&#x20;                     ↓

&#x20;            Public Verification API

&#x20;                     │

&#x20;               ┌───┴────┐

&#x20;               ↓           ↓

&#x20;            Redis       Database

&#x20;               │

&#x20;            cache hit

&#x20;               ↓

&#x20;            response



4. file uploads (Major)   -> **solved using the direct upload(cloud) \& the backend will deal with metadata(Ids, storage path, etc)**
-> IMP Our backend becomes **authorization + metadata + workflow controller**

Mobile

&#x20; ↓

Backend            -> Here the **API server** is acting like the **file transfer servers**

&#x20; ↓

Backend receives 20 MB image

&#x20; ↓

Backend forwards image to storage



5. Offline sync creates burst traffic



Mobile -> Sync API -> **Queue** -> Workers -> Database

