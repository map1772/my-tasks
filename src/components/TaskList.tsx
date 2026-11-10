import type { Task } from '../types/task';
import { TaskItem } from './TaskItem';

type TaskListProps = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export const TaskList = ({ tasks, onToggle, onDelete }: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>Список свободен</p>
        <span>Добавьте первую задачу выше</span>
      </div>
    );
  }

  return (
    <ul className="task-list" aria-label="Список задач">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
};
