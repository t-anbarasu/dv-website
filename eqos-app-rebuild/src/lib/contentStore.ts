import { ReflectionTool, ProgramItem, VideoClipItem } from './types';
import { REFLECTION_TOOLS, PROGRAMS, VIDEOS } from './data';

const STORAGE_KEYS = {
  TOOLS: 'eqos_custom_tools',
  DELETED_TOOLS: 'eqos_deleted_tools',
  PROGRAMS: 'eqos_custom_programs',
  DELETED_PROGRAMS: 'eqos_deleted_programs',
  VIDEOS: 'eqos_custom_videos'
};

/**
 * Get all reflection tools (Seed data + custom tools - deleted tools)
 */
export function getAllTools(): ReflectionTool[] {
  if (typeof window === 'undefined') {
    return REFLECTION_TOOLS;
  }
  try {
    const deleted = localStorage.getItem(STORAGE_KEYS.DELETED_TOOLS);
    const deletedSet = new Set<string>(
      deleted ? JSON.parse(deleted).map((id: string) => (id || '').trim().toLowerCase()) : []
    );

    const custom = localStorage.getItem(STORAGE_KEYS.TOOLS);
    const parsed: ReflectionTool[] = custom ? JSON.parse(custom) : [];
    const customIds = new Set(parsed.map(t => t.tool_id.trim().toLowerCase()));

    const defaults = REFLECTION_TOOLS.filter(t => !customIds.has(t.tool_id.trim().toLowerCase()));
    const combined = [...parsed, ...defaults];

    return combined.filter(t => !deletedSet.has(t.tool_id.trim().toLowerCase()));
  } catch (e) {
    return REFLECTION_TOOLS;
  }
}

/**
 * Save a tool to custom storage and trigger background server sync
 */
export async function saveTool(tool: ReflectionTool): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const cleanId = (tool.tool_id || '').trim().toLowerCase();

    // 1. Un-delete if previously marked as deleted
    const deleted = localStorage.getItem(STORAGE_KEYS.DELETED_TOOLS);
    if (deleted) {
      let deletedList: string[] = JSON.parse(deleted);
      deletedList = deletedList.filter(id => id.trim().toLowerCase() !== cleanId);
      localStorage.setItem(STORAGE_KEYS.DELETED_TOOLS, JSON.stringify(deletedList));
    }

    // 2. Insert or update in custom tools
    const custom = localStorage.getItem(STORAGE_KEYS.TOOLS);
    let list: ReflectionTool[] = custom ? JSON.parse(custom) : [];
    const index = list.findIndex(t => t.tool_id.trim().toLowerCase() === cleanId);
    if (index >= 0) {
      list[index] = tool;
    } else {
      list.unshift(tool);
    }
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(list));
    window.dispatchEvent(new Event('eqos-content-updated'));

    // 3. Async sync to server/database
    fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_tool', data: tool })
    }).catch(err => console.log('Server sync skipped/failed:', err));

    return true;
  } catch (e) {
    console.error('Failed to save tool locally:', e);
    return false;
  }
}

/**
 * Delete a tool (removes from custom storage and marks in deleted set so seeds don't return)
 */
export function deleteTool(toolId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const cleanId = (toolId || '').trim().toLowerCase();

    // 1. Remove from custom tools list
    const custom = localStorage.getItem(STORAGE_KEYS.TOOLS);
    let list: ReflectionTool[] = custom ? JSON.parse(custom) : [];
    const filtered = list.filter(t => t.tool_id.trim().toLowerCase() !== cleanId);
    localStorage.setItem(STORAGE_KEYS.TOOLS, JSON.stringify(filtered));

    // 2. Add to deleted tools list
    const deleted = localStorage.getItem(STORAGE_KEYS.DELETED_TOOLS);
    let deletedList: string[] = deleted ? JSON.parse(deleted) : [];
    if (!deletedList.some(id => id.trim().toLowerCase() === cleanId)) {
      deletedList.push(toolId);
    }
    localStorage.setItem(STORAGE_KEYS.DELETED_TOOLS, JSON.stringify(deletedList));

    // 3. Dispatch update event
    window.dispatchEvent(new Event('eqos-content-updated'));

    // 4. Server sync
    fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_tool', data: { tool_id: toolId } })
    }).catch(err => console.log('Server sync skipped/failed:', err));

    return true;
  } catch (e) {
    console.error('Failed to delete tool:', e);
    return false;
  }
}

/**
 * Get all programs (Seed data + custom programs - deleted programs)
 */
export function getAllPrograms(): ProgramItem[] {
  if (typeof window === 'undefined') {
    return PROGRAMS;
  }
  try {
    const deleted = localStorage.getItem(STORAGE_KEYS.DELETED_PROGRAMS);
    const deletedSet = new Set<string>(
      deleted ? JSON.parse(deleted).map((id: string) => (id || '').trim().toLowerCase()) : []
    );

    const custom = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    const parsed: ProgramItem[] = custom ? JSON.parse(custom) : [];
    const customIds = new Set(parsed.map(p => p.id.trim().toLowerCase()));

    const defaults = PROGRAMS.filter(p => !customIds.has(p.id.trim().toLowerCase()));
    const combined = [...parsed, ...defaults];

    return combined.filter(p => !deletedSet.has(p.id.trim().toLowerCase()));
  } catch (e) {
    return PROGRAMS;
  }
}

/**
 * Get a specific program by ID or name (case-insensitive with slug normalization)
 */
export function getProgramById(programId: string): ProgramItem | null {
  const all = getAllPrograms();
  const clean = (programId || '').toLowerCase().trim();
  if (!clean) return null;

  return (
    all.find(p => p.id.toLowerCase() === clean) ||
    all.find(p => p.name.toLowerCase() === clean) ||
    all.find(p => p.id.toLowerCase().replace(/[-_\s]/g, '') === clean.replace(/[-_\s]/g, '')) ||
    all.find(p => p.name.toLowerCase().replace(/[-_\s]/g, '') === clean.replace(/[-_\s]/g, '')) ||
    null
  );
}

/**
 * Save a program to custom storage and trigger server sync
 */
export async function saveProgram(program: ProgramItem): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const cleanId = (program.id || '').trim().toLowerCase();

    // 1. Un-delete if previously marked as deleted
    const deleted = localStorage.getItem(STORAGE_KEYS.DELETED_PROGRAMS);
    if (deleted) {
      let deletedList: string[] = JSON.parse(deleted);
      deletedList = deletedList.filter(id => id.trim().toLowerCase() !== cleanId);
      localStorage.setItem(STORAGE_KEYS.DELETED_PROGRAMS, JSON.stringify(deletedList));
    }

    // 2. Insert or update in custom programs
    const custom = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    let list: ProgramItem[] = custom ? JSON.parse(custom) : [];
    const index = list.findIndex(p => p.id.trim().toLowerCase() === cleanId);
    if (index >= 0) {
      list[index] = program;
    } else {
      list.unshift(program);
    }
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(list));
    window.dispatchEvent(new Event('eqos-content-updated'));

    fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_program', data: program })
    }).catch(err => console.log('Server sync skipped/failed:', err));

    return true;
  } catch (e) {
    console.error('Failed to save program:', e);
    return false;
  }
}

/**
 * Delete a program
 */
export function deleteProgram(programId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const cleanId = (programId || '').trim().toLowerCase();

    // 1. Remove from custom programs
    const custom = localStorage.getItem(STORAGE_KEYS.PROGRAMS);
    let list: ProgramItem[] = custom ? JSON.parse(custom) : [];
    const filtered = list.filter(p => p.id.trim().toLowerCase() !== cleanId);
    localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(filtered));

    // 2. Add to deleted programs list
    const deleted = localStorage.getItem(STORAGE_KEYS.DELETED_PROGRAMS);
    let deletedList: string[] = deleted ? JSON.parse(deleted) : [];
    if (!deletedList.some(id => id.trim().toLowerCase() === cleanId)) {
      deletedList.push(programId);
    }
    localStorage.setItem(STORAGE_KEYS.DELETED_PROGRAMS, JSON.stringify(deletedList));

    // 3. Dispatch update event
    window.dispatchEvent(new Event('eqos-content-updated'));

    // 4. Server sync
    fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete_program', data: { id: programId } })
    }).catch(err => console.log('Server sync skipped/failed:', err));

    return true;
  } catch (e) {
    console.error('Failed to delete program:', e);
    return false;
  }
}

/**
 * Get all videos
 */
export function getAllVideos(): Record<string, VideoClipItem> {
  if (typeof window === 'undefined') {
    return VIDEOS;
  }
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    const parsed: Record<string, VideoClipItem> = custom ? JSON.parse(custom) : {};
    return { ...VIDEOS, ...parsed };
  } catch (e) {
    return VIDEOS;
  }
}

/**
 * Save a video
 */
export async function saveVideo(videoKey: string, video: VideoClipItem): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    const map: Record<string, VideoClipItem> = custom ? JSON.parse(custom) : {};
    map[videoKey] = video;
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(map));

    fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'save_video', data: { key: videoKey, ...video } })
    }).catch(err => console.log('Server sync skipped/failed:', err));

    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Reset all custom content and un-delete seed tools/programs
 */
export function resetContentToDefaults(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TOOLS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_TOOLS);
  localStorage.removeItem(STORAGE_KEYS.PROGRAMS);
  localStorage.removeItem(STORAGE_KEYS.DELETED_PROGRAMS);
  window.dispatchEvent(new Event('eqos-content-updated'));
}
