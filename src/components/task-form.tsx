import { Plus } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type TaskFormProps = {
  onAdd: (title: string) => boolean;
};

export const TaskForm = ({ onAdd }: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onAdd(title)) {
      setError('Введите название задачи');
      return;
    }
    setTitle('');
    setError('');
  };

  return (
    <form className="task-form" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor="new-task">Новая задача</label>
      <input
        id="new-task"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          if (error) setError('');
        }}
        maxLength={160}
        placeholder="Название задачи"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby="task-form-hint"
      />
      <button type="submit" aria-label="Добавить">
        <Plus aria-hidden="true" />
        <span>Добавить</span>
      </button>
      <span id="task-form-hint" className="sr-only" aria-live="polite">
        {error}
      </span>
    </form>
  );
};
