import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUserFromRequest } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get('email');
    const patientIdParam = searchParams.get('patientId');

    let patient = null;

    // 1. Authenticated user
    const authUser = await getAuthUserFromRequest(req);
    if (authUser && authUser.role === 'patient') {
      patient = await prisma.patient.findFirst({
        where: { OR: [{ email: authUser.email }, { userId: authUser.id }] },
      });
    }

    // 2. Email param
    if (!patient && emailParam && emailParam.toLowerCase() !== 'ravi@healthmemory.demo') {
      patient = await prisma.patient.findFirst({ where: { email: emailParam } });
    }

    // 3. Patient ID param
    if (!patient && patientIdParam) {
      patient = await prisma.patient.findUnique({ where: { id: patientIdParam } });
    }

    // 4. Default
    if (!patient) {
      patient = await prisma.patient.findFirst({ where: { email: emailParam || 'ravi@healthmemory.demo' } });
    }

    if (!patient) {
      return NextResponse.json({ notifications: [] });
    }

    const notifications = await prisma.patientNotification.findMany({
      where: { patientId: patient.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, markAllRead, email } = body;

    if (markAllRead) {
      const patient = await prisma.patient.findFirst({
        where: { email: email || 'ravi@healthmemory.demo' },
      });

      if (patient) {
        await prisma.patientNotification.updateMany({
          where: { patientId: patient.id },
          data: { isRead: true },
        });
      }

      return NextResponse.json({ success: true });
    }

    if (id) {
      await prisma.patientNotification.update({
        where: { id },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
