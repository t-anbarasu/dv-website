import { NextRequest, NextResponse } from 'next/server';
import { testDbConnection, saveToolToDb, saveProgramToDb, deleteToolFromDb, deleteProgramFromDb } from '@/lib/db';

export async function GET() {
  const dbStatus = await testDbConnection();
  return NextResponse.json({
    success: true,
    db: dbStatus
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (action === 'test_db') {
      const dbStatus = await testDbConnection();
      return NextResponse.json({ success: true, db: dbStatus });
    }

    if (action === 'save_tool') {
      const saved = await saveToolToDb(data);
      return NextResponse.json({ success: true, savedToDb: saved, tool: data });
    }

    if (action === 'delete_tool') {
      const toolId = data?.tool_id || data?.id;
      const deleted = await deleteToolFromDb(toolId);
      return NextResponse.json({ success: true, deletedFromDb: deleted, tool_id: toolId });
    }

    if (action === 'save_program') {
      const saved = await saveProgramToDb(data);
      return NextResponse.json({ success: true, savedToDb: saved, program: data });
    }

    if (action === 'delete_program') {
      const programId = data?.id || data?.program_id;
      const deleted = await deleteProgramFromDb(programId);
      return NextResponse.json({ success: true, deletedFromDb: deleted, program_id: programId });
    }

    return NextResponse.json({ success: true, message: 'Action acknowledged' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Operation failed' },
      { status: 500 }
    );
  }
}
