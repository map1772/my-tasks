import { useEffect, useMemo, useState } from 'react';
import { calculateProgress } from '../lib/taskProgress';
import { loadTasks, saveTasks } from '../lib/storage';
import type { Task, TaskUpdate } from '../types/task';

const initialTasks: Task[] = [
  {
    id: 'demo-design',
    title: 'Завершить дизайн-концепцию проекта',
    description: 'Сверить ключевые экраны и зафиксировать финальное направление.',
    dueDate: '2026-11-12',
    completed: false,
    createdAt: '2026-10-23T08:00:00.000Z',
  },
  {
    id: 'demo-report',
    title: 'Подготовить отчет для команды',
    description: 'Собрать решения недели и следующие шаги в один короткий документ.',
    dueDate: '2026-11-14',
    completed: false,
    createdAt: '2026-10-23T07:00:00.000Z',
  },
  {
    id: 'demo-groceries',
    title: 'Купить продукты на неделю',
    dueDate: '2026-11-09',
    completed: true,
    createdAt: '2026-10-23T06:00:00.000Z',
  },
  {
    id: 'demo-portfolio',
    title: 'Обновить портфолио на Dribbble',
    description: 'Добавить новый кейс и проверить подписи к экранам.',
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
        task.id === id
          ? { ...task, completed: !task.completed, updatedAt: new Date().toISOString() }
          : task,
      ),
    );
  };

  const updateTask = (id: string, changes: TaskUpdate) => {
    const title = changes.title.trim();
    if (!title) return false;

    const description = changes.description?.trim() || undefined;
    const dueDate = changes.dueDate?.trim() || undefined;
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              title,
              description,
              dueDate,
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    return true;
  };

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const completedCount = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks],
  );
  const progress = calculateProgress(tasks.length, completedCount);

  return { tasks, addTask, updateTask, toggleTask, deleteTask, completedCount, progress };
};
