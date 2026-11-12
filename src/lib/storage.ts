import type { Task } from '../types/task';

export const STORAGE_KEY = 'my-tasks:v1';

const normalizeTask = (value: unknown): Task | null => {
  if (!value || typeof value !== 'object') return null;
  const task = value as Record<string, unknown>;
  if (
    typeof task.id !== 'string' ||
    typeof task.title !== 'string' ||
    typeof task.completed !== 'boolean' ||
    typeof task.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    createdAt: task.createdAt,
    ...(typeof task.description === 'string' ? { description: task.description } : {}),
    ...(typeof task.dueDate === 'string' ? { dueDate: task.dueDate } : {}),
    ...(typeof task.updatedAt === 'string' ? { updatedAt: task.updatedAt } : {}),
  };
};

export const loadTasks = (): Task[] | null => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === null) return null;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeTask).filter((task): task is Task => task !== null);
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
