// ============================================================
// E-Maap Nirikshak — Mock API (async wrappers over mockDatabase)
// ============================================================
import { getDB, updateDB } from './mockDatabase.js';

const delay = (ms = 400) => new Promise(r => setTimeout(r, ms + Math.random() * 200));

// ---- AUTH ----
export async function loginAs(role) {
  await delay(300);
  const db = getDB();
  const roleMap = {
    owner: db.owners[0],
    lmo: db.lmos[0],
    gatc: db.gatcs[0],
    admin: db.admin,
    public: null,
  };
  return roleMap[role] ?? null;
}

// ---- INSTRUMENTS ----
export async function getInstruments(ownerId) {
  await delay();
  const db = getDB();
  return ownerId ? db.instruments.filter(i => i.ownerId === ownerId) : db.instruments;
}

export async function getInstrument(instrumentId) {
  await delay();
  const db = getDB();
  return db.instruments.find(i => i.instrumentId === instrumentId) ?? null;
}

export async function registerInstrument(data) {
  await delay(600);
  updateDB(db => {
    const stateCode = data.state?.slice(0,2).toUpperCase() || 'XX';
    const year = new Date().getFullYear();
    const seq = String(db.instruments.length + 1).padStart(5, '0');
    const instrumentId = `INST-${stateCode}-${year}-${seq}`;
    db.instruments.push({
      instrumentId, ...data,
      registrationDate: new Date().toISOString().split('T')[0],
      status: 'Pending', lastVerified: null, validUntil: null,
    });
  });
  return { success: true };
}

// ---- APPLICATIONS ----
export async function getApplications(filters = {}) {
  await delay();
  const db = getDB();
  let apps = db.applications;
  if (filters.ownerId) apps = apps.filter(a => a.ownerId === filters.ownerId);
  if (filters.officerId) apps = apps.filter(a => a.assignedOfficerId === filters.officerId);
  if (filters.status) apps = apps.filter(a => a.status === filters.status);
  return apps;
}

export async function getApplication(applicationId) {
  await delay();
  const db = getDB();
  return db.applications.find(a => a.applicationId === applicationId) ?? null;
}

export async function submitApplication(data) {
  await delay(600);
  let appId;
  updateDB(db => {
    const year = new Date().getFullYear();
    const seq = String(db.applications.length + 1).padStart(6, '0');
    appId = `APP-${year}-${seq}`;
    db.applications.push({
      applicationId: appId, ...data,
      status: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0],
      assignedOfficerId: null, assignedOfficerType: null, scheduledDate: null,
    });
    // notification to owner
    db.notifications.push({
      id: `N${Date.now()}`, userId: data.ownerId, type: 'status',
      message: `Application ${appId} submitted successfully for ${data.instrumentId}.`,
      date: new Date().toISOString().split('T')[0], read: false,
    });
  });
  return { success: true, applicationId: appId };
}

export async function allocateApplication(applicationId, officerId, officerType, scheduledDate) {
  await delay(500);
  updateDB(db => {
    const app = db.applications.find(a => a.applicationId === applicationId);
    if (app) {
      app.assignedOfficerId = officerId;
      app.assignedOfficerType = officerType;
      app.scheduledDate = scheduledDate;
      app.status = 'Scheduled';
    }
    db.notifications.push({
      id: `N${Date.now()}`, userId: app?.ownerId, type: 'schedule',
      message: `Inspection for application ${applicationId} scheduled for ${scheduledDate}.`,
      date: new Date().toISOString().split('T')[0], read: false,
    });
  });
  return { success: true };
}

// ---- INSPECTIONS ----
export async function getInspections(filters = {}) {
  await delay();
  const db = getDB();
  let ins = db.inspections;
  if (filters.officerId) ins = ins.filter(i => i.officerId === filters.officerId);
  if (filters.instrumentId) ins = ins.filter(i => i.instrumentId === filters.instrumentId);
  return ins;
}

export async function submitInspection(data) {
  await delay(700);
  let inspId, certId;
  updateDB(db => {
    const year = new Date().getFullYear();
    const seq = String(db.inspections.length + 1).padStart(6, '0');
    inspId = `INS-${year}-${seq}`;
    db.inspections.push({ inspectionId: inspId, ...data, submittedDate: new Date().toISOString().split('T')[0] });

    // update application status
    const app = db.applications.find(a => a.applicationId === data.applicationId);
    if (app) app.status = data.result === 'Pass' ? 'Inspected' : 'Rejected';

    // auto-generate certificate if Pass
    if (data.result === 'Pass') {
      const instr = db.instruments.find(i => i.instrumentId === data.instrumentId);
      const officer = db.lmos.find(l => l.id === data.officerId) || db.gatcs.find(g => g.id === data.officerId);
      const owner = db.owners.find(o => o.id === instr?.ownerId);
      const today = new Date();
      const validUntil = new Date(today); validUntil.setFullYear(validUntil.getFullYear() + 1);

      const stateCode = instr?.instrumentId?.split('-')[1] || 'XX';
      const certSeq = String(db.certificates.length + 1).padStart(5, '0');
      certId = `CERT-${stateCode}-${year}-${certSeq}`;

      db.certificates.push({
        certificateId: certId, instrumentId: data.instrumentId,
        applicationId: data.applicationId, inspectionId: inspId,
        instrumentType: instr?.type, manufacturer: instr?.manufacturer,
        model: instr?.model, serialNumber: instr?.serialNumber, capacity: instr?.capacity,
        ownerName: owner?.name, ownerAddress: owner?.address,
        verificationDate: today.toISOString().split('T')[0],
        issueDate: today.toISOString().split('T')[0],
        validUntil: validUntil.toISOString().split('T')[0],
        verifiedBy: officer?.name, verifiedByDesignation: officer?.designation || 'GATC',
        jurisdiction: officer?.jurisdiction || officer?.district,
        status: 'Valid', qrPayload: `/verify/${certId}`,
      });

      // update instrument status
      if (instr) {
        instr.status = 'Verified';
        instr.lastVerified = today.toISOString().split('T')[0];
        instr.validUntil = validUntil.toISOString().split('T')[0];
      }
      if (app) app.status = 'Certified';

      db.notifications.push({
        id: `N${Date.now()}`, userId: instr?.ownerId, type: 'status',
        message: `Certificate ${certId} issued for ${data.instrumentId}.`,
        date: today.toISOString().split('T')[0], read: false,
      });
    }
  });
  return { success: true, inspectionId: inspId, certificateId: certId };
}

// ---- CERTIFICATES ----
export async function getCertificates(filters = {}) {
  await delay();
  const db = getDB();
  let certs = db.certificates;
  if (filters.instrumentId) certs = certs.filter(c => c.instrumentId === filters.instrumentId);
  if (filters.ownerId) {
    const ownerInstruments = db.instruments.filter(i => i.ownerId === filters.ownerId).map(i => i.instrumentId);
    certs = certs.filter(c => ownerInstruments.includes(c.instrumentId));
  }
  return certs;
}

export async function getCertificate(certificateId) {
  await delay(300);
  const db = getDB();
  return db.certificates.find(c => c.certificateId === certificateId) ?? null;
}

export async function verifyCertificate(certificateId) {
  await delay(500);
  const db = getDB();
  const cert = db.certificates.find(c => c.certificateId === certificateId);
  if (!cert) return { status: 'NOT FOUND', cert: null };
  return { status: cert.status.toUpperCase().replace(' ', '_'), cert };
}

// ---- NOTIFICATIONS ----
export async function getNotifications(userId) {
  await delay(200);
  const db = getDB();
  return db.notifications.filter(n => n.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
}

export async function markNotificationRead(notifId) {
  await delay(100);
  updateDB(db => {
    const n = db.notifications.find(n => n.id === notifId);
    if (n) n.read = true;
  });
}

// ---- LMOs / GATCs ----
export async function getLMOs() { await delay(); return getDB().lmos; }
export async function getGATCs() { await delay(); return getDB().gatcs; }
export async function getOwners() { await delay(); return getDB().owners; }

// ---- RISK / ENFORCEMENT ----
export async function getRiskScores() {
  await delay();
  const db = getDB();
  return db.riskScores.map(r => {
    const instr = db.instruments.find(i => i.instrumentId === r.instrumentId);
    const owner = db.owners.find(o => o.id === r.ownerId);
    return { ...r, instrumentType: instr?.type, ownerName: owner?.name, city: owner?.city, state: owner?.state };
  }).sort((a, b) => b.riskScore - a.riskScore);
}

export async function flagForInspection(instrumentId) {
  await delay(400);
  updateDB(db => {
    const r = db.riskScores.find(r => r.instrumentId === instrumentId);
    if (r) r.flagged = true;
  });
  return { success: true };
}

// ---- DASHBOARD STATS ----
export async function getAdminStats() {
  await delay();
  const db = getDB();
  return {
    totalInstruments: db.instruments.length,
    totalOwners: db.owners.length,
    totalApplications: db.applications.length,
    pendingVerifications: db.applications.filter(a => ['Submitted','Under Review','Scheduled','Inspected'].includes(a.status)).length,
    completedVerifications: db.applications.filter(a => a.status === 'Certified').length,
    expiredCertificates: db.certificates.filter(c => c.status === 'Expired').length,
    expiringCertificates: db.certificates.filter(c => c.status === 'Expiring Soon').length,
    activeLMOs: db.lmos.length,
    activeGATCs: db.gatcs.length,
    verificationsByMonth: [
      { month: 'Jul', verifications: 3, passed: 3, failed: 0 },
      { month: 'Aug', verifications: 4, passed: 4, failed: 0 },
      { month: 'Sep', verifications: 3, passed: 3, failed: 0 },
      { month: 'Oct', verifications: 5, passed: 4, failed: 1 },
      { month: 'Nov', verifications: 2, passed: 2, failed: 0 },
      { month: 'Dec', verifications: 2, passed: 1, failed: 1 },
    ],
    applicationsByState: [
      { state: 'Delhi', count: 3 },
      { state: 'Karnataka', count: 2 },
      { state: 'Gujarat', count: 2 },
      { state: 'Maharashtra', count: 2 },
      { state: 'Tamil Nadu', count: 1 },
    ],
  };
}

export async function getOwnerStats(ownerId) {
  await delay();
  const db = getDB();
  const instruments = db.instruments.filter(i => i.ownerId === ownerId);
  const instrIds = instruments.map(i => i.instrumentId);
  const certs = db.certificates.filter(c => instrIds.includes(c.instrumentId));
  const apps = db.applications.filter(a => a.ownerId === ownerId);
  return {
    totalInstruments: instruments.length,
    activeCertificates: certs.filter(c => c.status === 'Valid').length,
    pendingApplications: apps.filter(a => !['Certified','Rejected'].includes(a.status)).length,
    expiringSoon: instruments.filter(i => i.status === 'Expiring Soon').length + certs.filter(c => c.status === 'Expiring Soon').length,
  };
}
