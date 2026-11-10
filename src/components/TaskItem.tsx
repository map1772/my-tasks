import type { Task } from '../types/task';
import { TrashIcon } from './TrashIcon';

type TaskItemProps = {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => (
  <li className={`task-item${task.completed ? ' task-item--completed' : ''}`}>
    <label className="task-item__content">
      <input
        className="task-item__input"
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
      />
      <span className="task-item__checkbox" aria-hidden="true">
        {task.completed ? '✓' : ''}
      </span>
      <span className="task-item__title">{task.title}</span>
    </label>
    <button
      className="task-item__delete"
      type="button"
      onClick={() => onDelete(task.id)}
      aria-label={`Удалить задачу: ${task.title}`}
    >
      <TrashIcon />
    </button>
  </li>
);
