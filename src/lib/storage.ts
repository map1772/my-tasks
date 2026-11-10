import type { Task } from '../types/task';

export const STORAGE_KEY = 'my-tasks:v1';

const isTask = (value: unknown): value is Task => {
  if (!value || typeof value !== 'object') return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.completed === 'boolean' &&
    typeof task.createdAt === 'string'
  );
};

export const loadTasks = (): Task[] | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.every(isTask) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveTasks = (tasks: Task[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
};
