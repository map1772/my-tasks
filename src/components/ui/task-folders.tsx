import { ArrowUpRight, CalendarDays, Check, Circle, Folder, FolderCheck } from 'lucide-react';
import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import type { Task } from '@/types/task';

type TaskFolderStackProps = {
  tasks: Task[];
  onOpenTask: (task: Task, trigger: HTMLButtonElement) => void;
};

type FolderStyle = CSSProperties & {
  '--folder-index': number;
  '--folder-depth': number;
};

const formatCreatedAt = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short' }).format(new Date(value));

const formatDueDate = (value?: string) => {
  if (!value) return 'Срок не задан';
  return `До ${new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(
    new Date(`${value}T00:00:00`),
  )}`;
};

export const TaskFolderStack = ({ tasks, onOpenTask }: TaskFolderStackProps) => {
  const deckRef = useRef<HTMLElement>(null);
  const frameRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const orderedTasks = useMemo(
    () => [
      ...tasks.filter((task) => !task.completed),
      ...tasks.filter((task) => task.completed),
    ],
    [tasks],
  );

  useEffect(() => {
    const deck = deckRef.current;
    if (!deck || typeof window.requestAnimationFrame !== 'function') return;
    frameRefs.current.length = orderedTasks.length;
    cardRefs.current.length = orderedTasks.length;
    const motionQuery = typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    let animationFrame = 0;

    const updateStack = () => {
      animationFrame = 0;
      if (motionQuery?.matches) {
        cardRefs.current.forEach((card) => {
          card?.style.setProperty('--folder-scale', '1');
          card?.style.setProperty('--folder-lift', '0px');
        });
        return;
      }

      const deckTop = deck.getBoundingClientRect().top + window.scrollY;
      const viewportHeight = window.innerHeight;

      frameRefs.current.forEach((frame, index) => {
        const card = cardRefs.current[index];
        if (!frame || !card) return;
        const availableLayers = Math.min(4, orderedTasks.length - index - 1);
        const start = deckTop + frame.offsetTop - 72;
        const layers = Math.min(
          availableLayers,
          Math.max(0, (window.scrollY - start) / (viewportHeight * 0.72)),
        );
        card.style.setProperty('--folder-scale', (1 - layers * 0.028).toFixed(4));
        card.style.setProperty('--folder-lift', `${(layers * -6).toFixed(2)}px`);
      });
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateStack);
    };

    updateStack();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    motionQuery?.addEventListener('change', scheduleUpdate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      motionQuery?.removeEventListener('change', scheduleUpdate);
    };
  }, [orderedTasks.length]);

  return (
    <section ref={deckRef} className="folder-deck" id="folders" aria-label="Папки задач">
      {orderedTasks.length === 0 ? (
        <div className="folder-deck-empty">
          <Folder aria-hidden="true" />
          <div>
            <h2>Стол свободен</h2>
            <p>Добавьте задачу сверху, и здесь появится её рабочая папка.</p>
          </div>
        </div>
      ) : (
        orderedTasks.map((task, index) => {
          const number = String(index + 1).padStart(2, '0');
          const status = task.completed ? 'Выполнено' : 'В работе';
          const style: FolderStyle = {
            '--folder-index': index,
            '--folder-depth': Math.min(index, 5),
            zIndex: index + 1,
          };

          return (
            <div
              ref={(node) => { frameRefs.current[index] = node; }}
              className="task-folder-frame"
              style={style}
              key={task.id}
            >
              <article
                ref={(node) => { cardRefs.current[index] = node; }}
                className={`task-folder-card ${task.completed ? 'is-completed' : ''}`}
              >
                <button
                  className="folder-open-target"
                  type="button"
                  id={`task-trigger-${task.id}`}
                  aria-label={`${task.title}. ${status}`}
                  aria-haspopup="dialog"
                  onClick={(event) => onOpenTask(task, event.currentTarget)}
                >
                  <span className="sr-only">Открыть задачу «{task.title}»</span>
                </button>

                <div className="task-folder-tab" aria-hidden="true">
                  {task.completed ? <FolderCheck /> : <Folder />}
                  <span>Дело {number}</span>
                  <small>{status}</small>
                </div>

                <div className="task-folder-sheet">
                  <header className="task-folder-header">
                    <div className="task-folder-index">
                      <span>{number}</span>
                      <i aria-hidden="true" />
                    </div>
                    <p className={`task-folder-status ${task.completed ? 'is-completed' : ''}`}>
                      {task.completed ? <Check aria-hidden="true" /> : <Circle aria-hidden="true" />}
                      {status}
                    </p>
                    <p className="task-folder-date">Создано {formatCreatedAt(task.createdAt)}</p>
                  </header>

                  <div className="task-folder-copy">
                    <p>Рабочая папка</p>
                    <h2>{task.title}</h2>
                    <span className={task.description ? '' : 'is-placeholder'}>
                      {task.description || 'Описание не добавлено'}
                    </span>
                  </div>

                  <footer className="task-folder-footer">
                    <span><CalendarDays aria-hidden="true" /> {formatDueDate(task.dueDate)}</span>
                    <span>Открыть дело <ArrowUpRight aria-hidden="true" /></span>
                  </footer>
                </div>
              </article>
            </div>
          );
        })
      )}
    </section>
  );
};
