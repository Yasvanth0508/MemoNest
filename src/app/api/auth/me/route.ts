import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Lookup associated patient email if applicable
    let activePatientEmail = 'ravi@healthmemory.demo';
    if (user.role === 'patient') {
      const patient = await prisma.patient.findFirst({ where: { email: user.email } });
      if (patient && patient.email) {
        activePatientEmail = patient.email;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user,
      activePatientEmail,
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
