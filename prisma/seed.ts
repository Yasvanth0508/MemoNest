import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MemoNest database...');

  // 1. Clean existing records
  await prisma.recordChunk.deleteMany();
  await prisma.aiAssistantQuery.deleteMany();
  await prisma.auditEntry.deleteMany();
  await prisma.patientNotification.deleteMany();
  await prisma.profileChangeRequest.deleteMany();
  await prisma.accessRequest.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.riskSignal.deleteMany();
  await prisma.evidenceSnippet.deleteMany();
  await prisma.medicalDocument.deleteMany();
  await prisma.caregiverObservation.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.allergy.deleteMany();
  await prisma.condition.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('demo1234', 10);

  // 2. Create Users
  const patientUser = await prisma.user.create({
    data: {
      id: 'user-patient-001',
      name: 'Ravi Kumar',
      email: 'ravi@healthmemory.demo',
      passwordHash,
      role: 'patient',
      title: 'Patient',
      phone: '+1-555-0142',
      avatarUrl: '/avatars/ravi-kumar.jpg',
    },
  });

  const caregiverUser = await prisma.user.create({
    data: {
      id: 'user-caregiver-001',
      name: 'Anita Desai',
      email: 'anita@caregiver.demo',
      passwordHash,
      role: 'caregiver',
      title: 'Certified Nursing Assistant / Home Caregiver',
      organization: 'Grace Senior Home Care',
      relationship: 'Paid Home Caregiver',
      phone: '+1-555-0178',
      avatarUrl: '/avatars/anita-desai.jpg',
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      id: 'user-clinician-001',
      name: 'Dr. Rajesh Sharma',
      email: 'dr.sharma@hospital.demo',
      passwordHash,
      role: 'doctor',
      title: 'MD, Geriatric Medicine & Internal Medicine',
      organization: 'MetroHealth Senior Specialty Clinic',
      phone: '+1-555-0110',
      avatarUrl: '/avatars/dr-sharma.jpg',
    },
  });

  // 3. Create Patient Record
  const patient = await prisma.patient.create({
    data: {
      id: 'patient-001',
      userId: patientUser.id,
      name: 'Ravi Kumar',
      age: 74,
      dateOfBirth: '1952-04-12',
      gender: 'Male',
      primaryDoctor: 'Dr. Rajesh Sharma',
      primaryDoctorId: doctorUser.id,
      bloodType: 'B+',
      address: '742 Evergreen Terrace, Springfield, IL 62704',
      phone: '+1-555-0142',
      email: 'ravi@healthmemory.demo',
      preferredLanguage: 'English',
      mobilityStatus: 'Four-wheel walker required; bed-to-chair transfer assistance recommended',
      emergencyContactName: 'Meera Kumar',
      emergencyContactRel: 'Daughter / Legal Healthcare Proxy',
      emergencyContactPhone: '+1-555-0199',
      emergencyContactEmail: 'meera.kumar@email.demo',
      profileImage: '/avatars/ravi-kumar.jpg',
    },
  });

  // 4. Conditions
  await prisma.condition.createMany({
    data: [
      {
        id: 'cond-01',
        patientId: patient.id,
        name: 'Essential Hypertension',
        status: 'managed',
        diagnosedYear: 2021,
        icdCode: 'I10',
        notes: 'Under oral antihypertensive control.',
      },
      {
        id: 'cond-02',
        patientId: patient.id,
        name: 'Type 2 Diabetes Mellitus',
        status: 'managed',
        diagnosedYear: 2022,
        icdCode: 'E11.9',
        notes: 'Managed with Metformin; baseline HbA1c 7.1%.',
      },
      {
        id: 'cond-03',
        patientId: patient.id,
        name: 'Ischemic Stroke (Left MCA territory)',
        status: 'historical',
        diagnosedYear: 2018,
        icdCode: 'I63.9',
        notes: 'Hospitalized in 2018. Residual mild right-side weakness.',
      },
      {
        id: 'cond-04',
        patientId: patient.id,
        name: 'Mild Cognitive Impairment (Amnestic Multidomain)',
        status: 'active',
        diagnosedYear: 2024,
        icdCode: 'G31.84',
        notes: 'MoCA 23/30 in March 2024. Memory lapses and disorientation noted under stress.',
      },
    ],
  });

  // 5. Allergies
  await prisma.allergy.createMany({
    data: [
      {
        id: 'all-01',
        patientId: patient.id,
        allergen: 'Penicillin',
        reaction: 'Urticaria and facial angioedema',
        severity: 'severe',
        diagnosedDate: '2015-06-10',
      },
      {
        id: 'all-02',
        patientId: patient.id,
        allergen: 'Sulfa Antibiotics',
        reaction: 'Maculopapular rash',
        severity: 'moderate',
        diagnosedDate: '2019-02-14',
      },
    ],
  });

  // 6. Medications
  await prisma.medication.createMany({
    data: [
      {
        id: 'med-01',
        patientId: patient.id,
        name: 'Amlodipine',
        genericName: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'Once daily in the morning',
        route: 'Oral',
        indication: 'Hypertension',
        status: 'active',
        startDate: '2021-03-15',
        prescriber: 'Dr. Rajesh Sharma',
        instructions: 'Take 1 tablet every morning with water.',
      },
      {
        id: 'med-02',
        patientId: patient.id,
        name: 'Metformin',
        genericName: 'Metformin Hydrochloride',
        dosage: '500mg',
        frequency: 'Twice daily with meals',
        route: 'Oral',
        indication: 'Type 2 Diabetes',
        status: 'active',
        startDate: '2022-08-01',
        prescriber: 'Dr. Rajesh Sharma',
        instructions: 'Take with breakfast and dinner to minimize GI upset.',
      },
      {
        id: 'med-03',
        patientId: patient.id,
        name: 'Atorvastatin',
        genericName: 'Atorvastatin Calcium',
        dosage: '20mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        indication: 'Hyperlipidemia / Post-stroke secondary prevention',
        status: 'active',
        startDate: '2018-05-20',
        prescriber: 'Dr. Rajesh Sharma',
        instructions: 'Take at night before sleep.',
      },
      {
        id: 'med-04',
        patientId: patient.id,
        name: 'Donepezil',
        genericName: 'Donepezil Hydrochloride',
        dosage: '5mg',
        frequency: 'Once daily at bedtime',
        route: 'Oral',
        indication: 'Mild Cognitive Impairment / Neuroprotection',
        status: 'active',
        startDate: '2024-04-01',
        prescriber: 'Dr. Rajesh Sharma',
        instructions: 'Take with or without food at bedtime.',
      },
      {
        id: 'med-05',
        patientId: patient.id,
        name: 'Zolpidem',
        genericName: 'Zolpidem Tartrate',
        dosage: '5mg',
        frequency: 'PRN at bedtime for severe insomnia',
        route: 'Oral',
        indication: 'Insomnia',
        status: 'active',
        startDate: '2026-09-05',
        prescriber: 'Dr. Rajesh Sharma',
        instructions: 'Take immediately prior to sleep only when needed.',
        isRecentChange: true,
        fallRiskWarning: true,
        sedationRisk: true,
        recentChangeNotes: 'Initiated 5 days ago. Flagged on Beers Criteria for high sedative burden and fall risk in elderly patients.',
      },
      {
        id: 'med-06',
        patientId: patient.id,
        name: 'Aspirin',
        genericName: 'Acetylsalicylic Acid',
        dosage: '81mg',
        frequency: 'Once daily with food',
        route: 'Oral',
        indication: 'Antiplatelet / Stroke secondary prevention',
        status: 'active',
        startDate: '2018-05-20',
        prescriber: 'Dr. Rajesh Sharma',
      },
    ],
  });

  // 7. Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      {
        id: 'tl-01',
        patientId: patient.id,
        date: '2018-05-18',
        time: '08:45',
        type: 'hospitalization',
        category: 'hospitalization',
        title: 'Acute Ischemic Stroke Hospitalization',
        description: 'Patient admitted with acute left MCA territory ischemic stroke. Hospitalized for 6 days. Recovered with residual mild right hemiparesis.',
        severity: 'critical',
        sourceType: 'discharge_summary',
        sourceId: 'doc-01',
        author: 'Springfield Memorial Hospital Stroke Center',
        authorRole: 'Neurology Inpatient Service',
      },
      {
        id: 'tl-02',
        patientId: patient.id,
        date: '2021-03-15',
        time: '11:00',
        type: 'routine_visit',
        category: 'medical',
        title: 'Essential Hypertension Diagnosed',
        description: 'Routine outpatient follow-up revealed persistent blood pressure 152/92 mmHg. Started Amlodipine 5mg daily.',
        severity: 'low',
        sourceType: 'clinical_note',
        author: 'Dr. Rajesh Sharma',
        authorRole: 'Primary Physician',
      },
      {
        id: 'tl-03',
        patientId: patient.id,
        date: '2024-03-20',
        time: '14:30',
        type: 'cognitive',
        category: 'cognitive',
        title: 'Cognitive Evaluation — Mild Cognitive Impairment Confirmed',
        description: 'Formal MoCA testing yielded 23/30 with noticeable delayed recall deficit (1/5). Diagnosed with amnestic MCI. Started Donepezil 5mg.',
        severity: 'medium',
        sourceType: 'consultation',
        sourceId: 'doc-02',
        author: 'Dr. Rajesh Sharma',
        authorRole: 'Geriatric Specialist',
      },
      {
        id: 'tl-04',
        patientId: patient.id,
        date: '2026-09-05',
        time: '16:00',
        type: 'medication_change',
        category: 'medication',
        title: 'Bedtime Sedative Initiated (Zolpidem 5mg PRN)',
        description: 'Zolpidem 5mg PRN prescribed for refractory insomnia. Beers criteria caution flag noted regarding fall vulnerability.',
        severity: 'medium',
        sourceType: 'prescription',
        sourceId: 'doc-04',
        author: 'Dr. Rajesh Sharma',
        authorRole: 'Primary Physician',
      },
      {
        id: 'tl-05',
        patientId: patient.id,
        date: '2026-09-09',
        time: '07:15',
        type: 'fall',
        category: 'caregiver',
        title: 'Bed-to-Chair Transfer Fall (Anita Desai)',
        description: 'Caregiver reported fall while transferring from bed to chair in bedroom. Patient felt dizzy and knees buckled. Minor right knee contusion noted.',
        severity: 'high',
        sourceType: 'observation',
        sourceId: 'obs-01',
        author: 'Anita Desai',
        authorRole: 'Home Caregiver',
      },
      {
        id: 'tl-06',
        patientId: patient.id,
        date: '2026-09-10',
        time: '06:30',
        type: 'fall',
        category: 'caregiver',
        title: 'Second Fall — Bathroom Transfer Slip (Anita Desai)',
        description: 'Second fall in 24 hours logged. Patient attempted unassisted transit to bathroom early morning, experienced grogginess and lost footing. Vital signs stable.',
        severity: 'critical',
        sourceType: 'observation',
        sourceId: 'obs-02',
        author: 'Anita Desai',
        authorRole: 'Home Caregiver',
      },
    ],
  });

  // 8. Caregiver Observations
  await prisma.caregiverObservation.createMany({
    data: [
      {
        id: 'obs-01',
        patientId: patient.id,
        caregiverId: caregiverUser.id,
        caregiverName: 'Anita Desai',
        timestamp: '2026-09-09T07:15:00Z',
        category: 'fall',
        note: 'Ravi lost his footing while transferring from the bedside to his four-wheel walker. He bruised his right knee but did not strike his head. He mentioned feeling unusually heavy and dizzy upon waking.',
        summary: 'Bed-to-chair transfer fall with mild right knee contusion and morning orthostatic dizziness.',
        severity: 'high',
        incidentReported: true,
        location: 'Bedroom bedside',
        actionTaken: 'Assisted patient into armchair, applied cold compress, checked blood pressure (128/78 mmHg).',
        vitalsChecked: true,
        status: 'reviewed',
      },
      {
        id: 'obs-02',
        patientId: patient.id,
        caregiverId: caregiverUser.id,
        caregiverName: 'Anita Desai',
        timestamp: '2026-09-10T06:30:00Z',
        category: 'fall',
        note: 'Ravi had a second fall this morning going to the bathroom. He seemed confused about what time it was, asked for his late sister, and stumbled near the doorway. Assisted safely back to bed. No open wounds.',
        summary: 'Second fall in 24h accompanied by acute morning confusion and transit hesitation.',
        severity: 'critical',
        incidentReported: true,
        location: 'Hallway near bathroom',
        actionTaken: 'Assisted patient to bed, checked vitals (Pulse 76, BP 130/80), notified daughter Meera Kumar.',
        vitalsChecked: true,
        status: 'reviewed',
      },
      {
        id: 'obs-03',
        patientId: patient.id,
        caregiverId: caregiverUser.id,
        caregiverName: 'Anita Desai',
        timestamp: '2026-09-08T12:30:00Z',
        category: 'confusion',
        note: 'Ravi seemed disoriented after lunch, asked when his appointment was four times within thirty minutes. Calmed down with gentle reorientation.',
        summary: 'Repetitive questioning and mild temporal disorientation.',
        severity: 'medium',
        incidentReported: false,
        location: 'Living room',
        status: 'reviewed',
      },
      {
        id: 'obs-04',
        patientId: patient.id,
        caregiverId: caregiverUser.id,
        caregiverName: 'Anita Desai',
        timestamp: '2026-09-07T08:30:00Z',
        category: 'medication_adherence',
        note: 'Morning medications taken on schedule with oatmeal and tea. Patient complained of persistent morning sluggishness.',
        summary: 'Morning adherence 100%; morning lethargy noted.',
        severity: 'low',
        incidentReported: false,
        status: 'reviewed',
      },
    ],
  });

  // 9. Medical Documents & Evidence Snippets
  const doc1 = await prisma.medicalDocument.create({
    data: {
      id: 'doc-01',
      patientId: patient.id,
      title: 'Inpatient Hospital Discharge Summary — Stroke Service',
      type: 'discharge_summary',
      date: '2018-05-24',
      facility: 'Springfield Memorial Hospital',
      author: 'Dr. Evelyn Reed, MD (Neurovascular)',
      fileType: 'PDF',
      fileSize: '1.8 MB',
      fileUrl: '/documents/stroke_discharge_summary_2018.pdf',
      summary: 'Patient Ravi Kumar admitted following sudden right arm weakness and slurred speech. CT/MRI confirmed acute non-hemorrhagic ischemic infarct in left middle cerebral artery distribution. Discharged on Aspirin 81mg and Atorvastatin 20mg.',
      keyFindings: JSON.stringify(['Left MCA non-hemorrhagic ischemic stroke', 'Mild residual right upper extremity hemiparesis', 'Normal swallowing reflex preserved on discharge']),
      extractedEntities: JSON.stringify(['Ischemic Stroke', 'Aspirin 81mg', 'Atorvastatin 20mg', 'Right hemiparesis']),
    },
  });

  const doc2 = await prisma.medicalDocument.create({
    data: {
      id: 'doc-02',
      patientId: patient.id,
      title: 'Outpatient Neurological & Cognitive Consult Note',
      type: 'consultation',
      date: '2024-03-20',
      facility: 'MetroHealth Senior Specialty Clinic',
      author: 'Dr. Rajesh Sharma, MD',
      fileType: 'PDF',
      fileSize: '920 KB',
      fileUrl: '/documents/neurology_consult_2024.pdf',
      summary: 'Patient evaluated for progressive memory complaints and word-finding pauses noted by family. MoCA score 23/30 indicates amnestic mild cognitive impairment. Commenced Donepezil 5mg once daily at night.',
      keyFindings: JSON.stringify(['Montreal Cognitive Assessment score: 23/30', 'Deficit predominantly in delayed memory recall (1/5)', 'Orientation to year preserved, day-of-week delayed']),
      extractedEntities: JSON.stringify(['Amnestic MCI', 'MoCA 23/30', 'Donepezil 5mg']),
    },
  });

  const doc3 = await prisma.medicalDocument.create({
    data: {
      id: 'doc-03',
      patientId: patient.id,
      title: 'Comprehensive Metabolic Panel & Lipid Profile',
      type: 'lab_report',
      date: '2026-08-28',
      facility: 'MetroHealth Diagnostic Laboratory',
      author: 'Quest / MetroHealth Lab',
      fileType: 'PDF',
      fileSize: '640 KB',
      fileUrl: '/documents/lab_results_aug2026.pdf',
      summary: 'Serum creatinine 1.1 mg/dL, eGFR 68 mL/min (CKD Stage 2 stable). HbA1c 7.1%. Total cholesterol 162 mg/dL, LDL 88 mg/dL. Electrolytes within normal limits.',
      keyFindings: JSON.stringify(['eGFR 68 mL/min (CKD Stage 2)', 'HbA1c 7.1% (well controlled)', 'Electrolytes normal (Sodium 139, Potassium 4.2)']),
      extractedEntities: JSON.stringify(['Creatinine 1.1', 'eGFR 68', 'HbA1c 7.1%', 'Lipid Panel']),
    },
  });

  const doc4 = await prisma.medicalDocument.create({
    data: {
      id: 'doc-04',
      patientId: patient.id,
      title: 'Prescription Order — Sleep Medicine PRN',
      type: 'prescription',
      date: '2026-09-05',
      facility: 'MetroHealth Senior Specialty Clinic',
      author: 'Dr. Rajesh Sharma, MD',
      fileType: 'PDF',
      fileSize: '310 KB',
      fileUrl: '/documents/rx_zolpidem_sep2026.pdf',
      summary: 'Prescription for Zolpidem Tartrate 5mg oral tablet at bedtime PRN for sleep disruption. Warned patient regarding fall risk and advised caregiver observation.',
      keyFindings: JSON.stringify(['Zolpidem 5mg PRN at bedtime', 'Beers Criteria warning logged', 'Quantity #15 tablets']),
      extractedEntities: JSON.stringify(['Zolpidem 5mg', 'Insomnia', 'Fall Warning']),
    },
  });

  await prisma.evidenceSnippet.createMany({
    data: [
      {
        id: 'ev-doc1-01',
        patientId: patient.id,
        documentId: doc1.id,
        documentTitle: doc1.title,
        documentDate: doc1.date,
        sourceType: 'discharge_summary',
        quote: 'Patient Ravi Kumar admitted following sudden right arm weakness and slurred speech. CT/MRI confirmed acute non-hemorrhagic ischemic infarct in left middle cerebral artery distribution.',
        context: 'Primary diagnosis on hospital discharge 2018',
        linkedEntity: 'Ischemic Stroke (Left MCA)',
        confidenceScore: 0.99,
        pageNumber: 1,
        author: doc1.author,
      },
      {
        id: 'ev-doc2-01',
        patientId: patient.id,
        documentId: doc2.id,
        documentTitle: doc2.title,
        documentDate: doc2.date,
        sourceType: 'consultation',
        quote: 'MoCA score 23/30 with delayed recall 1/5; confirmed amnestic multidomain Mild Cognitive Impairment.',
        context: 'Formal baseline cognitive examination',
        linkedEntity: 'Mild Cognitive Impairment (MoCA 23/30)',
        confidenceScore: 0.98,
        pageNumber: 2,
        author: doc2.author,
      },
      {
        id: 'ev-doc4-01',
        patientId: patient.id,
        documentId: doc4.id,
        documentTitle: doc4.title,
        documentDate: doc4.date,
        sourceType: 'prescription',
        quote: 'Zolpidem Tartrate 5mg oral tablet at bedtime PRN for sleep disruption. Warned patient regarding fall risk and advised caregiver observation.',
        context: 'Prescription order initiated 5 days prior to fall cluster',
        linkedEntity: 'Zolpidem 5mg / Fall Warning',
        confidenceScore: 0.99,
        pageNumber: 1,
        author: doc4.author,
      },
      {
        id: 'ev-caregiver-01',
        patientId: patient.id,
        documentTitle: 'Caregiver Observation Report (Anita Desai)',
        documentDate: '2026-09-09',
        sourceType: 'observation',
        quote: 'Ravi lost his footing while transferring from the bedside to his four-wheel walker. He bruised his right knee but did not strike his head. He mentioned feeling unusually heavy and dizzy upon waking.',
        context: 'First reported fall event in 24-hour cluster',
        linkedEntity: 'Bed-to-chair transfer fall',
        confidenceScore: 0.95,
        author: 'Anita Desai',
      },
      {
        id: 'ev-caregiver-02',
        patientId: patient.id,
        documentTitle: 'Caregiver Incident Log (Anita Desai)',
        documentDate: '2026-09-10',
        sourceType: 'observation',
        quote: 'Ravi had a second fall this morning going to the bathroom. He seemed confused about what time it was, asked for his late sister, and stumbled near the doorway.',
        context: 'Second fall event in 24-hour cluster with acute confusion',
        linkedEntity: 'Bathroom transit fall with disorientation',
        confidenceScore: 0.97,
        author: 'Anita Desai',
      },
    ],
  });

  // 10. Risk Signals
  await prisma.riskSignal.createMany({
    data: [
      {
        id: 'risk-01',
        patientId: patient.id,
        title: 'Critical Acute Fall Cluster & Sedative Interaction',
        priority: 'high',
        category: 'falls',
        description: 'Patient experienced two acute falls within a 24-hour window (bedroom transfer on 9 Sep, bathroom transit on 10 Sep). This marks a severe deviation from baseline mobility, correlating with the initiation of Zolpidem 5mg PRN 5 days ago.',
        factors: JSON.stringify([
          'Two falls documented in past 24 hours (9 Sep & 10 Sep)',
          'Zolpidem 5mg PRN initiated 5 Sep (Beers Criteria sedative risk)',
          'Baseline Mild Cognitive Impairment & post-stroke residual hemiparesis',
          'Reported morning grogginess and orthostatic dizziness',
        ]),
        evidenceIds: JSON.stringify(['ev-caregiver-01', 'ev-caregiver-02', 'ev-doc4-01']),
        recommendations: JSON.stringify([
          'Immediately discontinue or taper Zolpidem 5mg; evaluate non-pharmacological sleep hygiene',
          'Physical therapy re-evaluation for mobility assist transfer protocol',
          'Caregiver bedside assistance required for all night-time and morning bed-to-bathroom transits',
        ]),
        detectedAt: '2026-09-10T07:00:00Z',
        status: 'active',
      },
      {
        id: 'risk-02',
        patientId: patient.id,
        title: 'Acute-on-Chronic Cognitive Disorientation',
        priority: 'medium',
        category: 'cognitive',
        description: 'Morning confusion episodes and temporal disorientation logged by caregiver over past 48 hours, presenting as delirium vulnerability atop chronic Mild Cognitive Impairment.',
        factors: JSON.stringify([
          'Caregiver notes disorientation upon waking on 10 Sep',
          'Underlying amnestic MCI (MoCA 23/30)',
          'Additive sedative burden from hypnotics',
        ]),
        evidenceIds: JSON.stringify(['ev-caregiver-02', 'ev-doc2-01']),
        recommendations: JSON.stringify([
          'Evaluate for sedative-induced mild delirium vs. urinary tract infection',
          'Repeat mini-mental cognitive status check at upcoming follow-up',
        ]),
        detectedAt: '2026-09-10T07:15:00Z',
        status: 'active',
      },
    ],
  });

  // 11. Consent Records
  await prisma.consentRecord.createMany({
    data: [
      {
        id: 'consent-01',
        patientId: patient.id,
        granteeId: doctorUser.id,
        granteeName: 'Dr. Rajesh Sharma',
        granteeRole: 'doctor',
        granteeEmail: 'dr.sharma@hospital.demo',
        organization: 'MetroHealth Senior Specialty Clinic',
        grantedPermissions: JSON.stringify(['full_medical', 'medications', 'lab_results', 'cognitive_records', 'caregiver_observations', 'emergency_access']),
        deniedPermissions: JSON.stringify([]),
        restrictedPermissions: JSON.stringify(['genetics']),
        status: 'active',
        validFrom: '2026-01-01T00:00:00Z',
        validUntil: '2027-01-01T00:00:00Z',
        notes: 'Primary physician comprehensive care circle consent.',
      },
      {
        id: 'consent-02',
        patientId: patient.id,
        granteeId: caregiverUser.id,
        granteeName: 'Anita Desai',
        granteeRole: 'caregiver',
        granteeEmail: 'anita@caregiver.demo',
        organization: 'Grace Senior Home Care',
        grantedPermissions: JSON.stringify(['medications', 'caregiver_observations', 'emergency_access']),
        deniedPermissions: JSON.stringify(['full_medical', 'genetics']),
        restrictedPermissions: JSON.stringify(['lab_results', 'cognitive_records']),
        status: 'active',
        validFrom: '2026-06-01T00:00:00Z',
        validUntil: '2027-06-01T00:00:00Z',
        notes: 'Home caregiver daily care access scope.',
      },
    ],
  });

  // 11b. Access Requests (Doctor & Specialist Consent Applications)
  await prisma.accessRequest.createMany({
    data: [
      {
        id: 'req-01',
        patientId: patient.id,
        requesterName: 'Dr. Priya Sharma',
        requesterRole: 'Consultant Cardiologist',
        requesterOrg: 'MetroHealth Heart & Vascular Pavilion',
        reason: 'Pre-consultation review of blood tests, stroke history, and blood pressure medications',
        durationDays: 30,
        requestedCategories: JSON.stringify(['medical_reports', 'medications', 'diagnoses']),
        requestDate: '10 Sep 2026',
        status: 'pending',
      },
      {
        id: 'req-02',
        patientId: patient.id,
        requesterName: 'Elena Rostova, PT',
        requesterRole: 'Senior Physical Therapist',
        requesterOrg: 'MetroHealth Physical Rehabilitation Center',
        reason: 'Post-fall gait evaluation and assistive device fit verification',
        durationDays: 60,
        requestedCategories: JSON.stringify(['caregiver_notes', 'medications']),
        requestDate: '08 Sep 2026',
        status: 'approved',
      },
    ],
  });

  // 12. Patient Notifications
  await prisma.patientNotification.createMany({
    data: [
      {
        id: 'notif-01',
        patientId: patient.id,
        category: 'appointment',
        title: 'Doctor appointment tomorrow at 10:00 AM',
        message: 'Geriatric follow-up consultation with Dr. Rajesh Sharma at MetroHealth Senior Specialty Clinic.',
        timestamp: '2026-09-10T09:00:00Z',
        severity: 'gentle',
        isRead: false,
        actionLabel: 'View Details',
        actionUrl: '/patient/timeline',
      },
      {
        id: 'notif-02',
        patientId: patient.id,
        category: 'medication',
        title: 'Time to take your medication',
        message: 'Morning dose: Amlodipine 5mg (1 tablet) and Metformin 500mg with breakfast.',
        timestamp: '2026-09-10T08:00:00Z',
        severity: 'gentle',
        isRead: false,
        actionLabel: 'Mark as Taken',
      },
      {
        id: 'notif-03',
        patientId: patient.id,
        category: 'caregiver',
        title: 'Anita Desai logged an observation',
        message: 'Second fall recorded this morning with dizziness. Care team and daughter notified.',
        timestamp: '2026-09-10T06:35:00Z',
        severity: 'attention',
        isRead: false,
        actionLabel: 'View Timeline',
        actionUrl: '/patient/timeline',
      },
    ],
  });

  // 13. Audit Entries
  await prisma.auditEntry.createMany({
    data: [
      {
        id: 'audit-01',
        patientId: patient.id,
        timestamp: '2026-09-10T08:15:00Z',
        userId: doctorUser.id,
        userName: 'Dr. Rajesh Sharma',
        userRole: 'doctor',
        eventType: 'access',
        action: 'Viewed AI Clinical Brief & Acute Fall Alerts',
        resource: 'Patient Health Memory / Clinical Brief',
        details: 'Evaluated 24h acute fall cluster and Zolpidem sedative risk factors.',
        purposeOfUse: 'Pre-consultation clinical evaluation',
        status: 'success',
      },
      {
        id: 'audit-02',
        patientId: patient.id,
        timestamp: '2026-09-10T06:32:00Z',
        userId: caregiverUser.id,
        userName: 'Anita Desai',
        userRole: 'caregiver',
        eventType: 'create',
        action: 'Logged Fall Observation with Acute Disorientation',
        resource: 'Caregiver Observation Log',
        details: 'Recorded second fall incident in hallway near bathroom.',
        purposeOfUse: 'Routine home caregiver shift log',
        status: 'success',
      },
    ],
  });

  // 14. Record Chunks for Grounded Semantic RAG Retrieval
  await prisma.recordChunk.createMany({
    data: [
      {
        id: 'chunk-01',
        patientId: patient.id,
        sourceType: 'document',
        sourceId: doc1.id,
        title: doc1.title,
        date: doc1.date,
        category: 'stroke_history',
        content: `Document: Hospital Discharge Summary (2018). Patient Ravi Kumar admitted with acute left MCA ischemic stroke. Hospitalized for 6 days. Recovered with residual mild right hemiparesis. Discharged on secondary stroke prophylaxis: Aspirin 81mg and Atorvastatin 20mg. Mobility required assistance during acute rehabilitation.`,
      },
      {
        id: 'chunk-02',
        patientId: patient.id,
        sourceType: 'document',
        sourceId: doc2.id,
        title: doc2.title,
        date: doc2.date,
        category: 'cognitive_trajectory',
        content: `Document: Outpatient Neurological Consult (2024). MoCA score 23/30 confirmed amnestic Mild Cognitive Impairment (MCI) with delayed recall score of 1/5. Neurologist Dr. Sharma initiated Donepezil 5mg once daily at bedtime. Family advised on memory support routines and fall prevention precautions.`,
      },
      {
        id: 'chunk-03',
        patientId: patient.id,
        sourceType: 'document',
        sourceId: doc4.id,
        title: doc4.title,
        date: doc4.date,
        category: 'medication_change',
        content: `Prescription Order: Zolpidem Tartrate 5mg oral tablet at bedtime PRN for sleep disruption, prescribed on 05 Sep 2026 by Dr. Rajesh Sharma. Pharmacist and Beers Criteria flag: High sedative burden in geriatric patient; substantial compounding of nocturnal and early morning fall risk.`,
      },
      {
        id: 'chunk-04',
        patientId: patient.id,
        sourceType: 'observation',
        sourceId: 'obs-01',
        title: 'Bed-to-Chair Transfer Fall (Anita Desai)',
        date: '2026-09-09',
        category: 'fall_incident',
        content: `Caregiver Log: Anita Desai reported a bedroom transfer fall on 09 Sep 2026 at 07:15 AM. Ravi lost his footing transferring from bedside to four-wheel walker, bruised right knee, complained of morning dizziness and feeling heavy upon waking. Vital signs 128/78 mmHg.`,
      },
      {
        id: 'chunk-05',
        patientId: patient.id,
        sourceType: 'observation',
        sourceId: 'obs-02',
        title: 'Bathroom Transit Fall with Disorientation (Anita Desai)',
        date: '2026-09-10',
        category: 'fall_incident',
        content: `Caregiver Incident: Anita Desai reported second fall on 10 Sep 2026 at 06:30 AM in hallway near bathroom. Ravi attempted unassisted transit, appeared disoriented asking for deceased family member, stumbled and lost footing. Vital signs stable (BP 130/80 mmHg). Daughter Meera Kumar notified.`,
      },
      {
        id: 'chunk-06',
        patientId: patient.id,
        sourceType: 'medication',
        sourceId: 'med-01-to-06',
        title: 'Active Medication Regimen',
        date: '2026-09-10',
        category: 'medications',
        content: `Active Regimen: 1) Amlodipine 5mg morning (hypertension); 2) Metformin 500mg BID (diabetes); 3) Atorvastatin 20mg bedtime (post-stroke/hyperlipidemia); 4) Donepezil 5mg bedtime (MCI); 5) Zolpidem 5mg PRN bedtime (insomnia, initiated 5 Sep 2026 - high fall hazard); 6) Aspirin 81mg daily (antiplatelet). Total active: 6 medications.`,
      },
    ],
  });

  console.log('✅ MemoNest database successfully seeded with complete clinical baseline dataset!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
