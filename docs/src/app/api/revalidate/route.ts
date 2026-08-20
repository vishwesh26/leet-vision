import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');

  // Verify the secret against the CRON_SECRET which is shared between local and prod
  const expectedSecret = process.env.CRON_SECRET || "leet_vision_secret_cron_key_123";
  
  if (secret !== expectedSecret) {
    return NextResponse.json({ message: 'Invalid revalidation token' }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: 'Missing path parameter' }, { status: 400 });
  }
  
  try {
    // Invalidate the cache for the requested path
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now(), path });
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating path' }, { status: 500 });
  }
}
