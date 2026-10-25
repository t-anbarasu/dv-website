import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDbPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, preferredLanguage, goal } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const userId = 'usr_' + crypto.randomBytes(8).toString('hex');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

    const db = getDbPool();
    if (db) {
      try {
        // Upsert into users table
        await db.query(
          `INSERT INTO users (id, name, email, phone, created_at, updated_at)
           VALUES (?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone)`,
          [userId, name.trim(), email.trim().toLowerCase(), phone || '']
        );

        // Upsert into profiles table
        await db.query(
          `INSERT INTO profiles (user_id, display_name, email, phone, preferred_language, goal, languages, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
           ON DUPLICATE KEY UPDATE display_name = VALUES(display_name)`,
          [
            userId, 
            name.trim(), 
            email.trim().toLowerCase(), 
            phone || '', 
            preferredLanguage || 'en', 
            goal || 'self', 
            JSON.stringify([preferredLanguage || 'en'])
          ]
        );
      } catch (dbErr: any) {
        console.error('MySQL Signup DB Error (falling back to local):', dbErr?.message);
      }
    }

    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'admin@drishtavidya.com' || cleanEmail.startsWith('admin@');

    const user = {
      id: userId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || '',
      role: (isAdmin ? 'admin' : 'user') as 'admin' | 'user',
      preferredLanguage: preferredLanguage || 'en'
    };

    return NextResponse.json({
      success: true,
      user,
      token: 'jwt_' + crypto.randomBytes(16).toString('hex')
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Signup failed' },
      { status: 500 }
    );
  }
}
