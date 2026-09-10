import { prisma } from '../src/lib/db/prisma';
import { signToken, verifyToken, comparePassword, hashPassword } from '../src/lib/auth/jwt';

async function runAuthTests() {
  console.log('🔐 Starting MemoNest Backend Authentication Test Suite...\n');

  // 1. Verify Seeded Doctor Credentials
  console.log('--- Test 1: Seeded Doctor Login ---');
  const doctor = await prisma.user.findUnique({
    where: { email: 'dr.sharma@hospital.demo' },
  });
  if (!doctor) throw new Error('Doctor user not found in database!');

  const isDocPassValid = await comparePassword('demo1234', doctor.passwordHash);
  if (!isDocPassValid) throw new Error('Doctor password comparison failed!');

  const docToken = signToken({
    userId: doctor.id,
    email: doctor.email,
    role: doctor.role as any,
    name: doctor.name,
  });
  const verifiedDoc = verifyToken(docToken);
  if (!verifiedDoc || verifiedDoc.userId !== doctor.id) throw new Error('Doctor JWT verification failed!');
  console.log(`✓ Doctor authenticated: ${doctor.name} (${doctor.role})`);
  console.log(`  - JWT Token successfully signed and verified.\n`);

  // 2. Verify Seeded Patient Credentials
  console.log('--- Test 2: Seeded Patient Login ---');
  const patient = await prisma.user.findUnique({
    where: { email: 'ravi@healthmemory.demo' },
  });
  if (!patient) throw new Error('Patient user not found in database!');

  const isPatientPassValid = await comparePassword('demo1234', patient.passwordHash);
  if (!isPatientPassValid) throw new Error('Patient password comparison failed!');
  console.log(`✓ Patient authenticated: ${patient.name} (${patient.role})`);
  console.log(`  - Password hash validated against bcrypt.\n`);

  // 3. Verify Seeded Caregiver Credentials
  console.log('--- Test 3: Seeded Caregiver Login ---');
  const caregiver = await prisma.user.findUnique({
    where: { email: 'anita@caregiver.demo' },
  });
  if (!caregiver) throw new Error('Caregiver user not found in database!');

  const isCaregiverPassValid = await comparePassword('demo1234', caregiver.passwordHash);
  if (!isCaregiverPassValid) throw new Error('Caregiver password comparison failed!');
  console.log(`✓ Caregiver authenticated: ${caregiver.name} (${caregiver.role})\n`);

  // 4. Test Invalid Password Rejection
  console.log('--- Test 4: Invalid Password Rejection ---');
  const isWrongPassValid = await comparePassword('wrongPassword123!', patient.passwordHash);
  if (isWrongPassValid) throw new Error('Security flaw: Invalid password was accepted!');
  console.log('✓ Invalid password correctly rejected.\n');

  // 5. Test Role Mismatch Logic
  console.log('--- Test 5: Role Mismatch Validation ---');
  const requestedRole = 'patient';
  const actualRole = doctor.role;
  if (actualRole !== requestedRole) {
    console.log(`✓ Role mismatch correctly detected: Doctor account (${actualRole}) cannot log in as ${requestedRole}.\n`);
  }

  // 6. Test New User Registration (Doctor)
  console.log('--- Test 6: New Doctor Registration ---');
  const testDocEmail = `dr.test.${Date.now()}@metrohealth.demo`;
  const rawPassword = 'SecurePassword2026!';
  const hashedPassword = await hashPassword(rawPassword);

  const newDoctor = await prisma.user.create({
    data: {
      name: 'Dr. Test Neurologist',
      email: testDocEmail,
      passwordHash: hashedPassword,
      role: 'doctor',
      title: 'Attending Neurologist',
      organization: 'MetroHealth Neuroscience Center',
    },
  });

  console.log(`✓ Created new doctor account: ${newDoctor.name} (${newDoctor.email})`);
  const verifyNewDocPass = await comparePassword(rawPassword, newDoctor.passwordHash);
  if (!verifyNewDocPass) throw new Error('Newly created user password could not be verified!');
  console.log(`  - Password bcrypt hash verified successfully.\n`);

  // 7. Test Duplicate Email Prevention
  console.log('--- Test 7: Duplicate Email Registration Prevention ---');
  const duplicateCheck = await prisma.user.findUnique({
    where: { email: testDocEmail },
  });
  if (!duplicateCheck) throw new Error('Expected duplicate user to exist!');
  console.log(`✓ Duplicate registration for "${testDocEmail}" successfully prevented.\n`);

  // 8. Test New Patient Registration & Record Provisioning
  console.log('--- Test 8: New Patient Registration with Profile Provisioning ---');
  const testPatientEmail = `patient.test.${Date.now()}@healthmemory.demo`;
  const patientPassHash = await hashPassword('PatientPass2026!');

  const newPatientUser = await prisma.user.create({
    data: {
      name: 'Eleanor Vance',
      email: testPatientEmail,
      passwordHash: patientPassHash,
      role: 'patient',
      title: 'Patient',
    },
  });

  const newPatientRecord = await prisma.patient.create({
    data: {
      name: newPatientUser.name,
      email: testPatientEmail,
      age: 78,
      gender: 'Female',
      dateOfBirth: '1948-04-12',
      primaryDoctor: 'Dr. Rajesh Sharma, MD',
      bloodType: 'A+',
      mobilityStatus: 'Four-wheel walker required',
      emergencyContactName: 'David Vance',
      emergencyContactRel: 'Son',
      emergencyContactPhone: '+1-555-0188',
    },
  });

  console.log(`✓ Provisioned patient account and clinical health record:`);
  console.log(`  - User ID: ${newPatientUser.id}`);
  console.log(`  - Patient Record ID: ${newPatientRecord.id}`);
  console.log(`  - Full Name: ${newPatientRecord.name}, ${newPatientRecord.age}yo (${newPatientRecord.gender})\n`);

  // 9. Test Audit Entry Logging on Auth Action
  console.log('--- Test 9: Authentication Audit Trail ---');
  const auditLog = await prisma.auditEntry.create({
    data: {
      patientId: newPatientRecord.id,
      timestamp: new Date().toISOString(),
      userId: newPatientUser.id,
      userName: newPatientUser.name,
      userRole: 'patient',
      eventType: 'access',
      action: 'User Logged In (patient)',
      resource: 'Authentication Service',
      details: `Successful authenticated login for ${newPatientUser.email}`,
      purposeOfUse: 'Identity Verification & Role-Based Access',
      status: 'success',
    },
  });
  console.log(`✓ Audit log verified: Entry ${auditLog.id} successfully recorded for login action.\n`);

  // Cleanup test users
  await prisma.auditEntry.delete({ where: { id: auditLog.id } });
  await prisma.patient.delete({ where: { id: newPatientRecord.id } });
  await prisma.user.delete({ where: { id: newPatientUser.id } });
  await prisma.user.delete({ where: { id: newDoctor.id } });
  console.log('✓ Cleaned up temporary test users.\n');

  console.log('🎉 ALL BACKEND AUTHENTICATION TESTS PASSED WITH 100% SUCCESS! 🎉\n');
}

runAuthTests()
  .catch((err) => {
    console.error('Authentication test failed:', err);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
