import { NextRequest, NextResponse } from 'next/server';
import { getProfileFromDb, saveProfileToDb } from '@/lib/db';
import { UserProfile } from '@/lib/types';
import { DEFAULT_PROFILES } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'priya';

    const profile = await getProfileFromDb(userId);
    return NextResponse.json({
      success: true,
      profile: profile || DEFAULT_PROFILES[userId] || DEFAULT_PROFILES.priya
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const profile: UserProfile = body.profile || body;

    if (!profile || !profile.name) {
      return NextResponse.json(
        { success: false, error: 'Profile name is required' },
        { status: 400 }
      );
    }

    // Update avatar initial
    profile.ini = profile.name.trim().charAt(0).toUpperCase() || 'U';

    const saved = await saveProfileToDb(profile);

    return NextResponse.json({
      success: true,
      savedToDatabase: saved,
      profile
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save profile' },
      { status: 500 }
    );
  }
}
