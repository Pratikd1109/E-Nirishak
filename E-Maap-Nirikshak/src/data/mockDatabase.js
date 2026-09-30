// ============================================================
// E-Maap Nirikshak — Mock Database (in-memory, persisted to localStorage)
// ============================================================

const DEFAULT_DB = {
  owners: [
    {
      id: 'OWN001', name: 'Ramesh Traders', email: 'ramesh@traders.in',
      phone: '9876543210', address: '14, Nehru Market, Chandni Chowk, Delhi',
      city: 'Delhi', state: 'Delhi', pincode: '110006', role: 'owner',
      registeredDate: '2024-01-15', avatar: 'RT'
    },
    {
      id: 'OWN002', name: 'Suresh Kumar & Sons', email: 'suresh@sks.in',
      phone: '9123456780', address: '7, MG Road, Bengaluru, Karnataka',
      city: 'Bengaluru', state: 'Karnataka', pincode: '560001', role: 'owner',
      registeredDate: '2024-02-20', avatar: 'SK'
    },
    {
      id: 'OWN003', name: 'Patel Agro Exports', email: 'patel@agroexp.in',
      phone: '9988776655', address: '22, APMC Yard, Ahmedabad, Gujarat',
      city: 'Ahmedabad', state: 'Gujarat', pincode: '380002', role: 'owner',
      registeredDate: '2024-03-10', avatar: 'PA'
    },
    {
      id: 'OWN004', name: 'Mumbai Petro Services', email: 'mps@petro.in',
      phone: '9001122334', address: '5, Andheri East, Mumbai, Maharashtra',
      city: 'Mumbai', state: 'Maharashtra', pincode: '400069', role: 'owner',
      registeredDate: '2024-04-05', avatar: 'MP'
    },
    {
      id: 'OWN005', name: 'Chennai Weighbridge Co.', email: 'cwb@weighbridge.in',
      phone: '9445566778', address: '88, Anna Salai, Chennai, Tamil Nadu',
      city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', role: 'owner',
      registeredDate: '2024-05-18', avatar: 'CW'
    },
  ],

  lmos: [
    {
      id: 'LMO001', name: 'Arvind Sharma', email: 'arvind.sharma@lm.delhi.gov.in',
      phone: '9811223344', designation: 'Inspector of Legal Metrology',
      jurisdiction: 'Delhi', district: 'Central Delhi', role: 'lmo',
      activeInspections: 3, completedInspections: 47, avatar: 'AS'
    },
    {
      id: 'LMO002', name: 'Priya Venkatesh', email: 'priya.v@lm.karnataka.gov.in',
      phone: '9900112233', designation: 'Deputy Inspector',
      jurisdiction: 'Karnataka', district: 'Bengaluru Urban', role: 'lmo',
      activeInspections: 2, completedInspections: 31, avatar: 'PV'
    },
    {
      id: 'LMO003', name: 'Rajan Mehta', email: 'rajan.m@lm.gujarat.gov.in',
      phone: '9512345678', designation: 'Inspector of Legal Metrology',
      jurisdiction: 'Gujarat', district: 'Ahmedabad', role: 'lmo',
      activeInspections: 4, completedInspections: 62, avatar: 'RM'
    },
  ],

  gatcs: [
    {
      id: 'GATC001', name: 'National Weights & Measures Lab', email: 'nwml@gatc.gov.in',
      phone: '1122334455', address: 'Sector 14, Faridabad, Haryana',
      accreditation: 'NABL-ACC-2024-001', jurisdiction: 'Delhi NCR', role: 'gatc',
      activeTests: 2, completedTests: 28, avatar: 'NW'
    },
    {
      id: 'GATC002', name: 'South India Metrology Centre', email: 'simc@gatc.in',
      phone: '4433221100', address: 'Peenya Industrial Area, Bengaluru',
      accreditation: 'NABL-ACC-2024-008', jurisdiction: 'Karnataka', role: 'gatc',
      activeTests: 1, completedTests: 19, avatar: 'SI'
    },
  ],

  admin: {
    id: 'ADM001', name: 'Controller of Weights & Measures',
    email: 'admin@legalmetrology.gov.in', phone: '1800112233',
    designation: 'Controller of Legal Metrology', role: 'admin', avatar: 'CW'
  },

  instruments: [
    {
      instrumentId: 'INST-DL-2024-00101', type: 'Platform Scale', manufacturer: 'Essae Teraoka',
      model: 'DS-852', serialNumber: 'ET2024001', capacity: '150 kg', ownerId: 'OWN001',
      registeredAddress: '14, Nehru Market, Chandni Chowk, Delhi',
      lat: 28.6562, lng: 77.2310, registrationDate: '2024-01-20',
      status: 'Verified', lastVerified: '2024-08-15', validUntil: '2025-08-14'
    },
    {
      instrumentId: 'INST-DL-2024-00102', type: 'Counter Scale', manufacturer: 'Mettler Toledo',
      model: 'BC-60', serialNumber: 'MT2024002', capacity: '60 kg', ownerId: 'OWN001',
      registeredAddress: '14, Nehru Market, Chandni Chowk, Delhi',
      lat: 28.6562, lng: 77.2310, registrationDate: '2024-01-20',
      status: 'Expired', lastVerified: '2023-07-10', validUntil: '2024-07-09'
    },
    {
      instrumentId: 'INST-DL-2024-00103', type: 'Weighbridge', manufacturer: 'Avery Weigh-Tronix',
      model: 'WB-60T', serialNumber: 'AW2024003', capacity: '60 Tonne', ownerId: 'OWN001',
      registeredAddress: '14, Nehru Market, Chandni Chowk, Delhi',
      lat: 28.6565, lng: 77.2315, registrationDate: '2024-02-01',
      status: 'Pending', lastVerified: null, validUntil: null
    },
    {
      instrumentId: 'INST-KA-2024-00201', type: 'Fuel Dispenser', manufacturer: 'Tokheim',
      model: 'TQS 2', serialNumber: 'TK2024004', capacity: '999 L', ownerId: 'OWN002',
      registeredAddress: '7, MG Road, Bengaluru, Karnataka',
      lat: 12.9716, lng: 77.5946, registrationDate: '2024-02-25',
      status: 'Verified', lastVerified: '2024-09-01', validUntil: '2025-10-15'
    },
    {
      instrumentId: 'INST-KA-2024-00202', type: 'Retail Scale', manufacturer: 'Shimadzu',
      model: 'UX-4200H', serialNumber: 'SH2024005', capacity: '4.2 kg', ownerId: 'OWN002',
      registeredAddress: '7, MG Road, Bengaluru, Karnataka',
      lat: 12.9716, lng: 77.5946, registrationDate: '2024-03-01',
      status: 'Pending', lastVerified: null, validUntil: null
    },
    {
      instrumentId: 'INST-GJ-2024-00301', type: 'Platform Scale', manufacturer: 'Sartorius',
      model: 'CPA34001S', serialNumber: 'SA2024006', capacity: '34 kg', ownerId: 'OWN003',
      registeredAddress: '22, APMC Yard, Ahmedabad, Gujarat',
      lat: 23.0225, lng: 72.5714, registrationDate: '2024-03-15',
      status: 'Verified', lastVerified: '2024-07-20', validUntil: '2026-10-19'
    },
    {
      instrumentId: 'INST-GJ-2024-00302', type: 'Weighbridge', manufacturer: 'Avery Weigh-Tronix',
      model: 'WB-100T', serialNumber: 'AW2024007', capacity: '100 Tonne', ownerId: 'OWN003',
      registeredAddress: '22, APMC Yard, Ahmedabad, Gujarat',
      lat: 23.0228, lng: 72.5718, registrationDate: '2024-03-15',
      status: 'Expiring Soon', lastVerified: '2024-11-10', validUntil: '2026-10-20'
    },
    {
      instrumentId: 'INST-MH-2024-00401', type: 'Fuel Dispenser', manufacturer: 'Wayne Fueling',
      model: 'Helix 1000', serialNumber: 'WF2024008', capacity: '999 L', ownerId: 'OWN004',
      registeredAddress: '5, Andheri East, Mumbai, Maharashtra',
      lat: 19.1136, lng: 72.8697, registrationDate: '2024-04-10',
      status: 'Verified', lastVerified: '2024-10-05', validUntil: '2025-10-04'
    },
    {
      instrumentId: 'INST-MH-2024-00402', type: 'Taxi Meter', manufacturer: 'Sansui Electronics',
      model: 'TM-100', serialNumber: 'SE2024009', capacity: 'N/A', ownerId: 'OWN004',
      registeredAddress: '5, Andheri East, Mumbai, Maharashtra',
      lat: 19.1136, lng: 72.8697, registrationDate: '2024-04-10',
      status: 'Verified', lastVerified: '2024-09-15', validUntil: '2025-09-14'
    },
    {
      instrumentId: 'INST-TN-2024-00501', type: 'Weighbridge', manufacturer: 'Essae Teraoka',
      model: 'WB-80T', serialNumber: 'ET2024010', capacity: '80 Tonne', ownerId: 'OWN005',
      registeredAddress: '88, Anna Salai, Chennai, Tamil Nadu',
      lat: 13.0827, lng: 80.2707, registrationDate: '2024-05-20',
      status: 'Verified', lastVerified: '2024-08-30', validUntil: '2025-08-29'
    },
  ],

  applications: [
    {
      applicationId: 'APP-2024-001001', instrumentId: 'INST-DL-2024-00101',
      type: 're-verification', status: 'Certified', submittedDate: '2024-08-01',
      assignedOfficerId: 'LMO001', assignedOfficerType: 'lmo', scheduledDate: '2024-08-15',
      ownerId: 'OWN001', remarks: ''
    },
    {
      applicationId: 'APP-2024-001002', instrumentId: 'INST-DL-2024-00102',
      type: 're-verification', status: 'Submitted', submittedDate: '2024-12-01',
      assignedOfficerId: null, assignedOfficerType: null, scheduledDate: null,
      ownerId: 'OWN001', remarks: ''
    },
    {
      applicationId: 'APP-2024-001003', instrumentId: 'INST-DL-2024-00103',
      type: 'new', status: 'Scheduled', submittedDate: '2024-11-20',
      assignedOfficerId: 'LMO001', assignedOfficerType: 'lmo', scheduledDate: '2026-10-05',
      ownerId: 'OWN001', remarks: ''
    },
    {
      applicationId: 'APP-2024-002001', instrumentId: 'INST-KA-2024-00201',
      type: 're-verification', status: 'Certified', submittedDate: '2024-08-25',
      assignedOfficerId: 'LMO002', assignedOfficerType: 'lmo', scheduledDate: '2024-09-01',
      ownerId: 'OWN002', remarks: ''
    },
    {
      applicationId: 'APP-2024-002002', instrumentId: 'INST-KA-2024-00202',
      type: 'new', status: 'Under Review', submittedDate: '2024-12-05',
      assignedOfficerId: null, assignedOfficerType: null, scheduledDate: null,
      ownerId: 'OWN002', remarks: ''
    },
    {
      applicationId: 'APP-2024-003001', instrumentId: 'INST-GJ-2024-00301',
      type: 're-verification', status: 'Certified', submittedDate: '2024-07-10',
      assignedOfficerId: 'LMO003', assignedOfficerType: 'lmo', scheduledDate: '2024-07-20',
      ownerId: 'OWN003', remarks: ''
    },
    {
      applicationId: 'APP-2024-003002', instrumentId: 'INST-GJ-2024-00302',
      type: 're-verification', status: 'Inspected', submittedDate: '2024-11-01',
      assignedOfficerId: 'LMO003', assignedOfficerType: 'lmo', scheduledDate: '2024-11-10',
      ownerId: 'OWN003', remarks: ''
    },
    {
      applicationId: 'APP-2024-004001', instrumentId: 'INST-MH-2024-00401',
      type: 're-verification', status: 'Certified', submittedDate: '2024-09-20',
      assignedOfficerId: 'GATC001', assignedOfficerType: 'gatc', scheduledDate: '2024-10-05',
      ownerId: 'OWN004', remarks: ''
    },
    {
      applicationId: 'APP-2024-004002', instrumentId: 'INST-MH-2024-00402',
      type: 're-verification', status: 'Certified', submittedDate: '2024-09-01',
      assignedOfficerId: 'LMO002', assignedOfficerType: 'lmo', scheduledDate: '2024-09-15',
      ownerId: 'OWN004', remarks: ''
    },
    {
      applicationId: 'APP-2024-005001', instrumentId: 'INST-TN-2024-00501',
      type: 're-verification', status: 'Certified', submittedDate: '2024-08-15',
      assignedOfficerId: 'GATC001', assignedOfficerType: 'gatc', scheduledDate: '2024-08-30',
      ownerId: 'OWN005', remarks: ''
    },
  ],

  inspections: [
    {
      inspectionId: 'INS-2024-001001', applicationId: 'APP-2024-001001',
      officerId: 'LMO001', officerType: 'lmo', instrumentId: 'INST-DL-2024-00101',
      checklistResults: {
        physicalCondition: 'Pass', serialNumber: 'Pass', sealCondition: 'Pass',
        zeroError: 'Pass', accuracyTest: 'Pass', capacity: 'Pass',
        measurementTest: 'Pass', displayReading: 'Pass', otherChecks: 'Pass'
      },
      measurements: [
        { expected: '50', observed: '50.02', error: '+0.02', unit: 'kg' },
        { expected: '100', observed: '100.05', error: '+0.05', unit: 'kg' },
        { expected: '150', observed: '149.98', error: '-0.02', unit: 'kg' },
      ],
      remarks: 'Instrument in good condition. Minor wear on base plate, within tolerance.',
      evidencePhotos: ['instrument_photo.jpg', 'serial_photo.jpg', 'seal_photo.jpg'],
      gpsLat: 28.6560, gpsLng: 77.2308, gpsDeltaMeters: 28,
      result: 'Pass', submittedDate: '2024-08-15'
    },
    {
      inspectionId: 'INS-2024-002001', applicationId: 'APP-2024-002001',
      officerId: 'LMO002', officerType: 'lmo', instrumentId: 'INST-KA-2024-00201',
      checklistResults: {
        physicalCondition: 'Pass', serialNumber: 'Pass', sealCondition: 'Pass',
        zeroError: 'Pass', accuracyTest: 'Pass', capacity: 'Pass',
        measurementTest: 'Pass', displayReading: 'Pass', otherChecks: 'Pass'
      },
      measurements: [
        { expected: '10', observed: '10.01', error: '+0.01', unit: 'L' },
        { expected: '20', observed: '19.99', error: '-0.01', unit: 'L' },
      ],
      remarks: 'Fuel dispenser functioning within permissible error limits.',
      evidencePhotos: ['dispenser_front.jpg', 'serial_plate.jpg'],
      gpsLat: 12.9714, gpsLng: 77.5944, gpsDeltaMeters: 24,
      result: 'Pass', submittedDate: '2024-09-01'
    },
    {
      inspectionId: 'INS-2024-003001', applicationId: 'APP-2024-003001',
      officerId: 'LMO003', officerType: 'lmo', instrumentId: 'INST-GJ-2024-00301',
      checklistResults: {
        physicalCondition: 'Pass', serialNumber: 'Pass', sealCondition: 'Pass',
        zeroError: 'Pass', accuracyTest: 'Pass', capacity: 'Pass',
        measurementTest: 'Pass', displayReading: 'Pass', otherChecks: 'Pass'
      },
      measurements: [
        { expected: '10', observed: '10.00', error: '0.00', unit: 'kg' },
        { expected: '25', observed: '25.01', error: '+0.01', unit: 'kg' },
      ],
      remarks: 'All checks passed. Instrument well-maintained.',
      evidencePhotos: ['scale_photo.jpg', 'serial_number.jpg'],
      gpsLat: 23.0226, gpsLng: 72.5715, gpsDeltaMeters: 15,
      result: 'Pass', submittedDate: '2024-07-20'
    },
  ],

  certificates: [
    {
      certificateId: 'CERT-DL-2024-00101', instrumentId: 'INST-DL-2024-00101',
      applicationId: 'APP-2024-001001', inspectionId: 'INS-2024-001001',
      instrumentType: 'Platform Scale', manufacturer: 'Essae Teraoka', model: 'DS-852',
      serialNumber: 'ET2024001', capacity: '150 kg',
      ownerName: 'Ramesh Traders', ownerAddress: '14, Nehru Market, Chandni Chowk, Delhi',
      verificationDate: '2024-08-15', issueDate: '2024-08-16',
      validUntil: '2025-08-14', verifiedBy: 'Arvind Sharma', verifiedByDesignation: 'Inspector of Legal Metrology',
      jurisdiction: 'Central Delhi', status: 'Valid',
      qrPayload: '/verify/CERT-DL-2024-00101'
    },
    {
      certificateId: 'CERT-KA-2024-00201', instrumentId: 'INST-KA-2024-00201',
      applicationId: 'APP-2024-002001', inspectionId: 'INS-2024-002001',
      instrumentType: 'Fuel Dispenser', manufacturer: 'Tokheim', model: 'TQS 2',
      serialNumber: 'TK2024004', capacity: '999 L',
      ownerName: 'Suresh Kumar & Sons', ownerAddress: '7, MG Road, Bengaluru, Karnataka',
      verificationDate: '2024-09-01', issueDate: '2024-09-02',
      validUntil: '2025-10-15', verifiedBy: 'Priya Venkatesh', verifiedByDesignation: 'Deputy Inspector',
      jurisdiction: 'Bengaluru Urban', status: 'Valid',
      qrPayload: '/verify/CERT-KA-2024-00201'
    },
    {
      certificateId: 'CERT-GJ-2024-00301', instrumentId: 'INST-GJ-2024-00301',
      applicationId: 'APP-2024-003001', inspectionId: 'INS-2024-003001',
      instrumentType: 'Platform Scale', manufacturer: 'Sartorius', model: 'CPA34001S',
      serialNumber: 'SA2024006', capacity: '34 kg',
      ownerName: 'Patel Agro Exports', ownerAddress: '22, APMC Yard, Ahmedabad, Gujarat',
      verificationDate: '2024-07-20', issueDate: '2024-07-21',
      validUntil: '2026-10-19', verifiedBy: 'Rajan Mehta', verifiedByDesignation: 'Inspector of Legal Metrology',
      jurisdiction: 'Ahmedabad', status: 'Valid',
      qrPayload: '/verify/CERT-GJ-2024-00301'
    },
    {
      certificateId: 'CERT-MH-2024-00401', instrumentId: 'INST-MH-2024-00401',
      applicationId: 'APP-2024-004001', inspectionId: null,
      instrumentType: 'Fuel Dispenser', manufacturer: 'Wayne Fueling', model: 'Helix 1000',
      serialNumber: 'WF2024008', capacity: '999 L',
      ownerName: 'Mumbai Petro Services', ownerAddress: '5, Andheri East, Mumbai, Maharashtra',
      verificationDate: '2024-10-05', issueDate: '2024-10-06',
      validUntil: '2025-10-04', verifiedBy: 'National Weights & Measures Lab', verifiedByDesignation: 'GATC',
      jurisdiction: 'Mumbai', status: 'Valid',
      qrPayload: '/verify/CERT-MH-2024-00401'
    },
    {
      certificateId: 'CERT-MH-2024-00402', instrumentId: 'INST-MH-2024-00402',
      applicationId: 'APP-2024-004002', inspectionId: null,
      instrumentType: 'Taxi Meter', manufacturer: 'Sansui Electronics', model: 'TM-100',
      serialNumber: 'SE2024009', capacity: 'N/A',
      ownerName: 'Mumbai Petro Services', ownerAddress: '5, Andheri East, Mumbai, Maharashtra',
      verificationDate: '2024-09-15', issueDate: '2024-09-16',
      validUntil: '2025-09-14', verifiedBy: 'Priya Venkatesh', verifiedByDesignation: 'Deputy Inspector',
      jurisdiction: 'Bengaluru Urban', status: 'Expiring Soon',
      qrPayload: '/verify/CERT-MH-2024-00402'
    },
    {
      certificateId: 'CERT-DL-2023-00102', instrumentId: 'INST-DL-2024-00102',
      applicationId: null, inspectionId: null,
      instrumentType: 'Counter Scale', manufacturer: 'Mettler Toledo', model: 'BC-60',
      serialNumber: 'MT2024002', capacity: '60 kg',
      ownerName: 'Ramesh Traders', ownerAddress: '14, Nehru Market, Chandni Chowk, Delhi',
      verificationDate: '2023-07-10', issueDate: '2023-07-11',
      validUntil: '2024-07-09', verifiedBy: 'Arvind Sharma', verifiedByDesignation: 'Inspector of Legal Metrology',
      jurisdiction: 'Central Delhi', status: 'Expired',
      qrPayload: '/verify/CERT-DL-2023-00102'
    },
    {
      certificateId: 'CERT-TN-2024-00501', instrumentId: 'INST-TN-2024-00501',
      applicationId: 'APP-2024-005001', inspectionId: null,
      instrumentType: 'Weighbridge', manufacturer: 'Essae Teraoka', model: 'WB-80T',
      serialNumber: 'ET2024010', capacity: '80 Tonne',
      ownerName: 'Chennai Weighbridge Co.', ownerAddress: '88, Anna Salai, Chennai, Tamil Nadu',
      verificationDate: '2024-08-30', issueDate: '2024-08-31',
      validUntil: '2025-08-29', verifiedBy: 'National Weights & Measures Lab', verifiedByDesignation: 'GATC',
      jurisdiction: 'Chennai', status: 'Valid',
      qrPayload: '/verify/CERT-TN-2024-00501'
    },
    {
      certificateId: 'CERT-REVOKED-001', instrumentId: 'INST-GJ-2024-00302',
      applicationId: null, inspectionId: null,
      instrumentType: 'Weighbridge', manufacturer: 'Avery Weigh-Tronix', model: 'WB-100T',
      serialNumber: 'AW2024007', capacity: '100 Tonne',
      ownerName: 'Patel Agro Exports', ownerAddress: '22, APMC Yard, Ahmedabad, Gujarat',
      verificationDate: '2023-10-01', issueDate: '2023-10-02',
      validUntil: '2024-10-01', verifiedBy: 'Rajan Mehta', verifiedByDesignation: 'Inspector of Legal Metrology',
      jurisdiction: 'Ahmedabad', status: 'Revoked',
      qrPayload: '/verify/CERT-REVOKED-001'
    },
  ],

  notifications: [
    { id: 'N001', userId: 'OWN001', type: 'expiry', message: 'Certificate for Counter Scale (INST-DL-2024-00102) has expired. Please apply for re-verification.', date: '2024-07-09', read: false },
    { id: 'N002', userId: 'OWN001', type: 'status', message: 'Your application APP-2024-001001 has been certified. Certificate CERT-DL-2024-00101 issued.', date: '2024-08-16', read: true },
    { id: 'N003', userId: 'OWN001', type: 'schedule', message: 'Inspection for Weighbridge (INST-DL-2024-00103) scheduled for 05-Oct-2026.', date: '2024-11-25', read: false },
    { id: 'N004', userId: 'OWN002', type: 'status', message: 'Application APP-2024-002002 is Under Review.', date: '2024-12-06', read: false },
    { id: 'N005', userId: 'LMO001', type: 'assignment', message: 'New inspection assigned: INST-DL-2024-00103. Scheduled for 05-Oct-2026.', date: '2024-11-25', read: false },
    { id: 'N006', userId: 'LMO001', type: 'assignment', message: 'Re-verification application APP-2024-001002 needs allocation review.', date: '2024-12-01', read: false },
  ],

  riskScores: [
    { ownerId: 'OWN001', instrumentId: 'INST-DL-2024-00102', riskScore: 78, repeatFailures: 1, complaintCount: 2, daysSinceVerification: 540, flagged: false },
    { ownerId: 'OWN003', instrumentId: 'INST-GJ-2024-00302', riskScore: 65, repeatFailures: 0, complaintCount: 3, daysSinceVerification: 350, flagged: true },
    { ownerId: 'OWN004', instrumentId: 'INST-MH-2024-00401', riskScore: 42, repeatFailures: 0, complaintCount: 1, daysSinceVerification: 180, flagged: false },
    { ownerId: 'OWN002', instrumentId: 'INST-KA-2024-00202', riskScore: 55, repeatFailures: 0, complaintCount: 0, daysSinceVerification: 290, flagged: false },
    { ownerId: 'OWN005', instrumentId: 'INST-TN-2024-00501', riskScore: 30, repeatFailures: 0, complaintCount: 0, daysSinceVerification: 120, flagged: false },
    { ownerId: 'OWN001', instrumentId: 'INST-DL-2024-00101', riskScore: 18, repeatFailures: 0, complaintCount: 0, daysSinceVerification: 40, flagged: false },
  ],
};

// ---- localStorage persistence ----
const STORAGE_KEY = 'maap_niriksak_db';

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return JSON.parse(JSON.stringify(DEFAULT_DB));
}

function saveDB(db) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (e) { /* ignore */ }
}

export function getDB() {
  return loadDB();
}

export function updateDB(updaterFn) {
  const db = loadDB();
  updaterFn(db);
  saveDB(db);
  return db;
}

export function resetDB() {
  localStorage.removeItem(STORAGE_KEY);
}
