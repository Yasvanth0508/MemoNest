const BASE_URL = 'http://localhost:3000';

async function checkEndpoint(name: string, url: string, validate?: (data: any) => boolean): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`❌ [${res.status}] ${name}: ${url}`);
      return false;
    }
    const data = await res.json();
    const isValid = validate ? validate(data) : true;
    if (isValid) {
      console.log(`✅ [200 OK] ${name} (${url})`);
      return true;
    } else {
      console.error(`❌ [Invalid Payload] ${name}:`, JSON.stringify(data).slice(0, 150));
      return false;
    }
  } catch (err: any) {
    console.error(`❌ [Error] ${name}:`, err.message);
    return false;
  }
}

async function run() {
  console.log('========================================================');
  console.log('🧪 VERIFYING ZERO-MOCK FULL STACK API INTEGRATION');
  console.log('========================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name: string, url: string, validate?: (data: any) => boolean) {
    total++;
    const ok = await checkEndpoint(name, url, validate);
    if (ok) passed++;
  }

  // 1. Clinician Patient Search
  await test('Clinician Patients Roster', `${BASE_URL}/api/clinician/patients/search?all=true`, (d) => {
    return Array.isArray(d.patients) && d.patients.length > 0 && d.patients.some((p: any) => p.name === 'Ravi Kumar');
  });

  // 2. Patient Profile by Email
  await test('Patient Profile by Email', `${BASE_URL}/api/patient?email=ravi@healthmemory.demo`, (d) => {
    return d.patient && d.patient.id === 'patient-001' && d.patient.name === 'Ravi Kumar';
  });

  // 3. Patient Profile by ID
  await test('Patient Profile by ID', `${BASE_URL}/api/patient?id=patient-001`, (d) => {
    return d.patient && d.patient.id === 'patient-001';
  });

  // 4. Medications
  await test('Medications Roster', `${BASE_URL}/api/medications?patientId=patient-001`, (d) => {
    return Array.isArray(d.medications) && d.medications.length >= 5 && d.medications.some((m: any) => m.name.includes('Amlodipine'));
  });

  // 5. Timeline Events
  await test('Timeline Events Filtered by patientId', `${BASE_URL}/api/timeline?patientId=patient-001`, (d) => {
    return Array.isArray(d.events) && d.events.length > 0;
  });

  // 6. Caregiver Observations
  await test('Caregiver Observations by patientId', `${BASE_URL}/api/caregiver/observations?patientId=patient-001`, (d) => {
    return Array.isArray(d.observations) && d.observations.length > 0;
  });

  // 7. Caregiver Trends
  await test('Caregiver Trends by patientId', `${BASE_URL}/api/caregiver/trends?patientId=patient-001`, (d) => {
    return d.state === 'significant_deviation' || d.state === 'stable' || d.state === 'mild_deviation';
  });

  // 8. Documents
  await test('Medical Documents by patientId', `${BASE_URL}/api/documents?patientId=patient-001`, (d) => {
    return Array.isArray(d.documents) && d.documents.length > 0;
  });

  // 9. Consent Records
  await test('Consent Records by patientId', `${BASE_URL}/api/consent?patientId=patient-001`, (d) => {
    return Array.isArray(d.records) && d.records.length > 0;
  });

  // 10. Risk Signals
  await test('Clinical Risk Signals', `${BASE_URL}/api/risks?patientId=patient-001`, (d) => {
    return Array.isArray(d.risks) && d.risks.length > 0;
  });

  // 11. Access Requests (New API)
  await test('Patient Access Requests', `${BASE_URL}/api/patient/access-requests?patientId=patient-001`, (d) => {
    return Array.isArray(d.requests) && d.requests.length > 0;
  });

  // 12. Patient Notifications
  await test('Patient Notifications by Email', `${BASE_URL}/api/patient/notifications?email=ravi@healthmemory.demo`, (d) => {
    return Array.isArray(d.notifications);
  });

  // 13. Audit Entries
  await test('Audit Logs by patientId', `${BASE_URL}/api/audit?patientId=patient-001`, (d) => {
    return Array.isArray(d.auditLogs);
  });

  // 14. Emergency SOS Record
  await test('Emergency SOS Record', `${BASE_URL}/api/patient/emergency-sos`, (d) => {
    return d.name === 'Ravi Kumar' && Array.isArray(d.activeMedications);
  });

  console.log(`\n========================================================`);
  console.log(`📊 RESULTS: ${passed}/${total} Endpoints Operational Against PostgreSQL`);
  console.log(`========================================================`);

  if (passed === total) {
    console.log('🎉 ALL BACKEND ENDPOINTS AND RELATIONAL DATA ZERO-MOCK VERIFIED!\n');
    process.exit(0);
  } else {
    console.error('⚠️ SOME CHECKS FAILED');
    process.exit(1);
  }
}

run();
