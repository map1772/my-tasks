import {
  Check,
  Circle,
  FilePenLine,
  Folder,
  RotateCcw,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { Task, TaskUpdate } from '@/types/task';

type TaskDialogProps = {
  task: Task | null;
  taskNumber: number;
  onClose: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: TaskUpdate) => boolean;
};

const formatDate = (value?: string) => {
  if (!value) return 'Не указана';
  const date = new Date(value.includes('T') ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return 'Не указана';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const TaskDialog = ({
  task,
  taskNumber,
  onClose,
  onToggle,
  onDelete,
  onUpdate,
}: TaskDialogProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const closingRef = useRef(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const taskId = task?.id;

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      onClose();
      return;
    }

    closingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    if (!taskId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
        ) ?? [],
      );
      const first = focusable[0];
      const last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [requestClose, taskId]);

  useEffect(
    () => () => {
      if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    },
    [],
  );

  if (!task) return null;

  const startEditing = () => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setDueDate(task.dueDate ?? '');
    setError('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setError('');
    setIsEditing(false);
  };

  const saveChanges = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError('Название нужно заполнить');
      return;
    }
    if (!onUpdate(task.id, { title, description, dueDate })) {
      setError('Название нужно заполнить');
      return;
    }
    setError('');
    setIsEditing(false);
  };

  const number = String(taskNumber).padStart(2, '0');
  const status = task.completed ? 'Выполнено' : 'В работе';

  return createPortal(
    <div className={`dialog-layer ${isClosing ? 'is-closing' : ''}`} role="presentation">
      <div className="dialog-backdrop" onMouseDown={requestClose} aria-hidden="true" />
      <div
        ref={dialogRef}
        className="task-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-dialog-title"
        aria-describedby="task-dialog-status"
      >
        <header className="task-dialog__topline">
          <div>
            <Folder aria-hidden="true" />
            <span>Дело {number}</span>
            <i aria-hidden="true" />
            <span id="task-dialog-status">{status}</span>
          </div>
          <button ref={closeRef} className="icon-button" type="button" onClick={requestClose} aria-label="Закрыть">
            <X aria-hidden="true" />
          </button>
        </header>

        <div className="task-detail-layout">
          <section className="task-object-stage" aria-label="Обложка папки">
            <div className={`folder-object ${isEditing ? 'is-flipped' : ''}`}>
              <div className="folder-object__inner">
                <div className={`folder-object__face folder-object__front ${task.completed ? 'is-completed' : ''}`}>
                  <div className="folder-object__tab"><Folder aria-hidden="true" /> Дело {number}</div>
                  <div className="folder-object__meta">
                    <span>{status}</span>
                    <span>{task.dueDate ? `Срок ${formatDate(task.dueDate)}` : 'Без срока'}</span>
                  </div>
                  <div className="folder-object__title">
                    <small>Личная папка</small>
                    <span>{task.title}</span>
                  </div>
                  <div className="folder-object__mark" aria-hidden="true">
                    {task.completed ? <Check /> : <Circle />}
                  </div>
                </div>

                <div className="folder-object__face folder-object__back">
                  <div className="folder-object__tab"><FilePenLine aria-hidden="true" /> Редактирование</div>
                  <small>Оборотная сторона</small>
                  <strong>Лист изменений</strong>
                  <span>Название, заметка и срок сохранятся в этой папке</span>
                </div>
              </div>
            </div>
            <p>{isEditing ? 'Оборотная сторона папки' : 'Нажмите «Редактировать», чтобы перевернуть папку'}</p>
          </section>

          <section className="task-detail-panel">
            {isEditing ? (
              <form className="task-edit-form" onSubmit={saveChanges} noValidate>
                <header>
                  <p className="panel-kicker">Изменение данных</p>
                  <h2 id="task-dialog-title">Редактировать задачу</h2>
                </header>

                <label>
                  <span>Название</span>
                  <input
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      if (error) setError('');
                    }}
                    maxLength={160}
                    autoFocus
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'task-title-error' : undefined}
                  />
                </label>

                <label>
                  <span>Описание</span>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    maxLength={800}
                    rows={5}
                    placeholder="Добавьте контекст или короткую заметку"
                  />
                </label>

                <label>
                  <span>Срок</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                  />
                </label>

                {error && <p className="form-error" id="task-title-error" role="alert">{error}</p>}

                <div className="task-edit-actions">
                  <button className="primary-action" type="submit"><Save aria-hidden="true" /> Сохранить</button>
                  <button className="quiet-action" type="button" onClick={cancelEditing}><RotateCcw aria-hidden="true" /> Отмена</button>
                </div>
              </form>
            ) : (
              <div className="task-detail-view">
                <header>
                  <p className={`task-detail-status ${task.completed ? 'is-completed' : ''}`}>
                    {task.completed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                    {status}
                  </p>
                  <h2 id="task-dialog-title">{task.title}</h2>
                </header>

                <div className="task-description">
                  <span>Заметка</span>
                  <p>{task.description || 'Описание пока не добавлено'}</p>
                </div>

                <dl className="task-metadata">
                  <div><dt>Срок</dt><dd>{task.dueDate ? formatDate(task.dueDate) : 'Не задан'}</dd></div>
                  <div><dt>Создана</dt><dd>{formatDate(task.createdAt)}</dd></div>
                  <div><dt>Обновлена</dt><dd>{task.updatedAt ? formatDate(task.updatedAt) : 'Без изменений'}</dd></div>
                  <div><dt>Состояние</dt><dd>{task.completed ? 'Завершена' : 'Активна'}</dd></div>
                </dl>

                <div className="task-detail-actions">
                  <button className="edit-action" type="button" onClick={startEditing}>
                    <FilePenLine aria-hidden="true" /> Редактировать
                  </button>
                  <button className="primary-action" type="button" onClick={() => onToggle(task.id)}>
                    {task.completed ? <RotateCcw aria-hidden="true" /> : <Check aria-hidden="true" />}
                    {task.completed ? 'Вернуть в работу' : 'Выполнить'}
                  </button>
                  <button className="danger-action" type="button" onClick={() => onDelete(task.id)}>
                    <Trash2 aria-hidden="true" /> Удалить
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
};
