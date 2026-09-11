import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.delete('kinsphere_session');
  response.cookies.delete('memonest_session');
  return response;
}
