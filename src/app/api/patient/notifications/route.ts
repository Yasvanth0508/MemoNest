import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'ravi@healthmemory.demo';

    const patient = await prisma.patient.findFirst({ where: { email } });
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
