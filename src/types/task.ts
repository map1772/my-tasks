export type Task = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  createdAt: string;
  updatedAt?: string;
};

export type TaskUpdate = Pick<Task, 'title' | 'description' | 'dueDate'>;
