import { useEffect, useMemo, useState } from 'react';
import { calculateProgress } from '../lib/taskProgress';
import { loadTasks, saveTasks } from '../lib/storage';
import type { Task } from '../types/task';

const initialTasks: Task[] = [
  {
    id: 'demo-design',
    title: 'Завершить дизайн-концепцию проекта',
    completed: false,
    createdAt: '2026-10-23T08:00:00.000Z',
  },
  {
    id: 'demo-report',
    title: 'Подготовить отчет для команды',
    completed: false,
    createdAt: '2026-10-23T07:00:00.000Z',
  },
  {
    id: 'demo-groceries',
    title: 'Купить продукты на неделю',
    completed: true,
    createdAt: '2026-10-23T06:00:00.000Z',
  },
  {
    id: 'demo-portfolio',
    title: 'Обновить портфолио на Dribbble',
    completed: true,
    createdAt: '2026-10-23T05:00:00.000Z',
  },
];

const createId = () =>
  typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks() ?? initialTasks);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (title: string) => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) return false;
    const task: Task = {
      id: createId(),
      title: normalizedTitle,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks((current) => [task, ...current]);
    return true;
  };

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );
  const progress = calculateProgress(tasks.length, completedCount);

  return { tasks, addTask, toggleTask, deleteTask, completedCount, progress };
};
