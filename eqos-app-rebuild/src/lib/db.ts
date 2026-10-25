import mysql from 'mysql2/promise';
import { UserProfile } from './types';
import { DEFAULT_PROFILES } from './data';

// Singleton connection pool for MySQL (Hostinger)
let pool: mysql.Pool | null = null;

export function getDbPool(): mysql.Pool | null {
  const host = process.env.DATABASE_HOST || process.env.MYSQL_HOST;
  const user = process.env.DATABASE_USER || process.env.MYSQL_USER;
  const password = process.env.DATABASE_PASSWORD || process.env.MYSQL_PASSWORD;
  const database = process.env.DATABASE_NAME || process.env.MYSQL_DATABASE;
  const port = parseInt(process.env.DATABASE_PORT || process.env.MYSQL_PORT || '3306', 10);

  if (!host || !user || !database) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
  }

  return pool;
}

/**
 * Fetch a user profile by ID from MySQL or fall back to default
 */
export async function getProfileFromDb(userId: string): Promise<UserProfile | null> {
  const db = getDbPool();
  if (!db) {
    return DEFAULT_PROFILES[userId] || DEFAULT_PROFILES.priya;
  }

  try {
    const [rows] = await db.query<any[]>(
      `SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone 
       FROM profiles p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.user_id = ? LIMIT 1`,
      [userId]
    );

    if (!rows || rows.length === 0) {
      return DEFAULT_PROFILES[userId] || DEFAULT_PROFILES.priya;
    }

    const row = rows[0];
    const languages = typeof row.languages === 'string' ? JSON.parse(row.languages) : (row.languages || ['ta', 'en']);
    const guidanceSwitches = typeof row.guidance_switches === 'string' ? JSON.parse(row.guidance_switches) : (row.guidance_switches || {});

    const name = row.display_name || row.user_name || 'Priya';
    return {
      id: row.user_id,
      name,
      email: row.email || row.user_email || '',
      phone: row.phone || row.user_phone || '',
      ini: name.charAt(0).toUpperCase(),
      blurb: `${row.age_band || '18–24'} · ${row.role || 'Software engineer'} · ${row.city || 'Bengaluru'}`,
      band: row.age_band || '18–24',
      country: row.country || 'India',
      city: row.city || 'Bengaluru',
      lang: row.preferred_language || row.language || 'ta',
      langLabel: languages.map((l: string) => l === 'ta' ? 'Tamil' : l === 'en' ? 'English' : l === 'hi' ? 'Hindi' : l).join(' + '),
      languages,
      channel: 'Web app + WhatsApp reminders',
      goal: row.goal || 'self',
      role: row.role || 'Software engineer',
      rg: 'knowledge',
      household: row.household || 'Shared hostel; family in Madurai',
      children: row.children || 'None',
      caregiving: row.caregiving || 'None',
      pattern: row.work_pattern || 'Hybrid, long evenings online',
      culture: row.cultural_setting || 'Family-first at home; strong hierarchy at work',
      faith: row.faith || 'Not shared',
      gender: row.gender || 'Not shared',
      guidanceSwitches
    };
  } catch (error) {
    console.error('MySQL query error in getProfileFromDb:', error);
    return DEFAULT_PROFILES[userId] || DEFAULT_PROFILES.priya;
  }
}

/**
 * Save / Update user profile to MySQL Database
 */
export async function saveProfileToDb(profile: UserProfile): Promise<boolean> {
  const db = getDbPool();
  if (!db) {
    // Graceful offline mock save
    return true;
  }

  try {
    // 1. Upsert users table
    await db.query(
      `INSERT INTO users (id, name, email, phone, updated_at) 
       VALUES (?, ?, ?, ?, NOW()) 
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         email = VALUES(email), 
         phone = VALUES(phone), 
         updated_at = NOW()`,
      [profile.id, profile.name, profile.email, profile.phone]
    );

    // 2. Upsert profiles table
    await db.query(
      `INSERT INTO profiles (
         user_id, display_name, email, phone, languages, preferred_language, 
         age_band, country, city, goal, household, children, caregiving, 
         role, work_pattern, cultural_setting, faith, gender, guidance_switches, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE 
         display_name = VALUES(display_name),
         email = VALUES(email),
         phone = VALUES(phone),
         languages = VALUES(languages),
         preferred_language = VALUES(preferred_language),
         age_band = VALUES(age_band),
         country = VALUES(country),
         city = VALUES(city),
         goal = VALUES(goal),
         household = VALUES(household),
         children = VALUES(children),
         caregiving = VALUES(caregiving),
         role = VALUES(role),
         work_pattern = VALUES(work_pattern),
         cultural_setting = VALUES(cultural_setting),
         faith = VALUES(faith),
         gender = VALUES(gender),
         guidance_switches = VALUES(guidance_switches),
         updated_at = NOW()`,
      [
        profile.id,
        profile.name,
        profile.email,
        profile.phone,
        JSON.stringify(profile.languages),
        profile.lang,
        profile.band,
        profile.country,
        profile.city,
        profile.goal,
        profile.household,
        profile.children,
        profile.caregiving,
        profile.role,
        profile.pattern,
        profile.culture,
        profile.faith,
        profile.gender,
        JSON.stringify(profile.guidanceSwitches)
      ]
    );

    return true;
  } catch (error) {
    console.error('MySQL save error in saveProfileToDb:', error);
    return false;
  }
}

/**
 * Test MySQL connection
 */
export async function testDbConnection(): Promise<{ connected: boolean; message: string; database?: string }> {
  const db = getDbPool();
  if (!db) {
    return {
      connected: false,
      message: 'No MySQL credentials configured in environment variables (MYSQL_HOST, MYSQL_USER, MYSQL_DATABASE).'
    };
  }

  try {
    await db.query('SELECT 1 + 1 AS result');
    return {
      connected: true,
      message: 'Successfully connected to Hostinger MySQL Database!',
      database: process.env.DATABASE_NAME || process.env.MYSQL_DATABASE
    };
  } catch (error: any) {
    return {
      connected: false,
      message: `Database connection error: ${error?.message || String(error)}`
    };
  }
}

/**
 * Save / Update a Tool in MySQL
 */
export async function saveToolToDb(tool: any): Promise<boolean> {
  const db = getDbPool();
  if (!db) return true; // offline mock

  try {
    await db.query(
      `INSERT INTO tools (tool_id, title, engine, phase, minutes, tags, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         engine = VALUES(engine),
         phase = VALUES(phase),
         minutes = VALUES(minutes),
         tags = VALUES(tags),
         status = 'active'`,
      [
        tool.tool_id,
        tool.title,
        tool.engine || 'steps',
        tool.phase || 'Grow',
        tool.minutes || 2,
        JSON.stringify(tool.tags || [])
      ]
    );

    // Save version body with steps
    if (tool.steps) {
      const versionId = `v_${tool.tool_id}_1`;
      await db.query(
        `INSERT INTO tool_versions (id, tool_id, language, style, body, version)
         VALUES (?, ?, 'en', 'diplomatic', ?, 1)
         ON DUPLICATE KEY UPDATE body = VALUES(body)`,
        [versionId, tool.tool_id, JSON.stringify(tool.steps)]
      );
    }
    return true;
  } catch (err) {
    console.error('MySQL tool save error:', err);
    return false;
  }
}

/**
 * Save / Update a Program in MySQL
 */
export async function saveProgramToDb(program: any): Promise<boolean> {
  const db = getDbPool();
  if (!db) return true;

  try {
    await db.query(
      `INSERT INTO programs (program_id, title, description, status)
       VALUES (?, ?, ?, 'active')
       ON DUPLICATE KEY UPDATE
         title = VALUES(title),
         description = VALUES(description),
         status = 'active'`,
      [program.id, program.name, program.description || program.d || '']
    );

    // Modules
    if (Array.isArray(program.modules)) {
      for (let i = 0; i < program.modules.length; i++) {
        const mod = program.modules[i];
        const modId = `${program.id}_mod_${i + 1}`;
        await db.query(
          `INSERT INTO program_modules (id, program_id, module_order, title, tool_ids)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             title = VALUES(title),
             tool_ids = VALUES(tool_ids)`,
          [modId, program.id, i + 1, mod.title, JSON.stringify(mod.tools || [])]
        );
      }
    }
    return true;
  } catch (err) {
    console.error('MySQL program save error:', err);
    return false;
  }
}

/**
 * Delete a Tool from MySQL
 */
export async function deleteToolFromDb(toolId: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return true;

  try {
    await db.query(`UPDATE tools SET status = 'deleted' WHERE tool_id = ?`, [toolId]);
    return true;
  } catch (err) {
    console.error('MySQL tool delete error:', err);
    return false;
  }
}

/**
 * Delete a Program from MySQL
 */
export async function deleteProgramFromDb(programId: string): Promise<boolean> {
  const db = getDbPool();
  if (!db) return true;

  try {
    await db.query(`UPDATE programs SET status = 'deleted' WHERE program_id = ?`, [programId]);
    return true;
  } catch (err) {
    console.error('MySQL program delete error:', err);
    return false;
  }
}

