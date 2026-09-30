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





6\. DB Schema

1st -> Normalize the transactional schema (e.g. putting all inspection information into one giant instrument row -> make the instrument table grow horizontally and make updates expensive.)



2nd -> Separate metadata from files (This we have done via the object storage. We will use the cloud and the upload method mentioned above)



3rd -> Index around real access patterns (Patterns can bee detected via running the sql queries)



4th -> Partition the tables that become huge (horizontal partitioning)

&#x20;                   PostgreSQL

&#x20;                        │

&#x20;           ┌─────────┴───────┐

&#x20;           ↓                       ↓

&#x20;      Normal tables        High-volume tables

&#x20;                               │

&#x20;                       ┌─────┼───────┐

&#x20;                       ↓       ↓       ↓

&#x20;                     2026    2027    2028

5th -> Keep read write DB separate



7. Client Scalability



1st -> Stateless clients(We already do this we don't use the sessions and all we use the JWT)



2nd -> Direct object upload



3rd -> Offline Sync (Sync API -> Queue/Worker -> DB)



4th -> reduces bandwidth and makes field operations more reliable (Client side optimization)

compress images

resize before upload

queue uploads

retry failed uploads

resume interrupted uploads

sync metadata separately from large files





8\. Server Scalability (Make the API tier stateless and scale it horizontally)

1st -> Load Balancer 

&#x20;                       INTERNET

&#x20;                           │

&#x20;                           ↓

&#x20;                    Load Balancer

&#x20;                    /      |      \\

&#x20;                   ↓       ↓       ↓

&#x20;                API-1    API-2    API-3



2nd -> Separate synchronous and asynchronous work

In this when the LMO submits a PASS then certificate generation work can be run in background asynchronously using the message Queue(which will have the workers)

&#x20;               Message Queue

&#x20;                    │

&#x20;         ┌───────┼──────────┐

&#x20;         ↓          ↓         	   ↓

&#x20;     Worker-1   Worker-2    Worker-3

&#x20;         │

&#x20;         ↓

&#x20;Certificate Generation



3rd -> Worker Pool 

If the load of one certain task increases then instead of scaling the entire API we will just increase the workers of that specific task



4th -> Public QR verification should be isolated



5th -> Don't send files through API servers

GOOD



Mobile → Object Storage

&#x20;         ↑

&#x20;    signed upload URL

&#x20;         ↑

&#x20;       API

6th -> Separate AI/RAG from core API  (AI should have its own scaling capabilities)





9\. RAG Scalability





