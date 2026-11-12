import { ArrowDown, CalendarDays, Check, Circle, Layers3 } from 'lucide-react';
import { useMemo, type CSSProperties } from 'react';
import { getTaskWord } from '@/lib/taskProgress';
import type { Task } from '@/types/task';
import { TaskForm } from './task-form';

type DashboardProps = {
  tasks: Task[];
  completedCount: number;
  progress: number;
  onAddTask: (title: string) => boolean;
};

const formatDueDate = (value?: string) => {
  if (!value) return 'Без срока';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(
    new Date(`${value}T00:00:00`),
  );
};

export const Dashboard = ({ tasks, completedCount, progress, onAddTask }: DashboardProps) => {
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [],
  );
  const progressStyle = { '--progress': progress / 100 } as CSSProperties;

  const scrollToFolders = () => {
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('#folders')?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="dashboard-stage" aria-labelledby="page-title">
      <div className="dashboard-frame">
        <header className="dashboard-bar">
          <a className="wordmark" href="#top" aria-label="Мои задачи, наверх">
            <span aria-hidden="true"><Layers3 /></span>
            Мои задачи
          </a>
          <p>{currentDate}</p>
          <span className="save-status"><i aria-hidden="true" /> Сохранено локально</span>
        </header>

        <div className="dashboard-window" id="top">
          <header className="dashboard-heading">
            <div>
              <p className="eyebrow"><span aria-hidden="true" /> Рабочий стол</p>
              <h1 id="page-title">Мои задачи</h1>
            </div>
            <p>План на сегодня и рабочие папки с заметками, сроками и текущим состоянием.</p>
          </header>

          <div className="dashboard-layout">
            <section className="progress-card" aria-label={`Выполнено ${progress}%`}>
              <div className="panel-kicker">
                <span>Выполнено</span>
                <small>{completedCount}/{tasks.length || 0}</small>
              </div>
              <div className="progress-orbit" aria-hidden="true">
                <svg viewBox="0 0 160 160">
                  <circle className="progress-orbit__track" cx="80" cy="80" r="68" />
                  <circle
                    className="progress-orbit__value"
                    cx="80"
                    cy="80"
                    r="68"
                    pathLength="100"
                    style={{ strokeDashoffset: 100 - progress }}
                  />
                </svg>
                <strong>{String(progress).padStart(2, '0')}<small>%</small></strong>
              </div>
              <p>{activeTasks.length === 0 ? 'Все текущие дела закрыты' : `${activeTasks.length} ${getTaskWord(activeTasks.length)} осталось`}</p>
            </section>

            <section className="active-card" aria-labelledby="active-title">
              <header className="panel-heading">
                <div>
                  <p className="panel-kicker">В работе</p>
                  <h2 id="active-title">Ближайшие задачи</h2>
                </div>
                <span>{String(activeTasks.length).padStart(2, '0')}</span>
              </header>

              {activeTasks.length > 0 ? (
                <ol className="active-list">
                  {activeTasks.slice(0, 3).map((task, index) => (
                    <li key={task.id}>
                      <span className="active-list__number">{String(index + 1).padStart(2, '0')}</span>
                      <Circle aria-hidden="true" />
                      <strong>{task.title}</strong>
                      <span className="active-list__date"><CalendarDays aria-hidden="true" /> {formatDueDate(task.dueDate)}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="active-empty">
                  <Check aria-hidden="true" />
                  <p>Новых дел нет. Можно добавить следующую задачу ниже.</p>
                </div>
              )}
            </section>

            <section className="capture-card" aria-labelledby="capture-title">
              <header className="panel-heading">
                <div>
                  <p className="panel-kicker">Быстрая запись</p>
                  <h2 id="capture-title">Новая задача</h2>
                </div>
                <span>01</span>
              </header>
              <TaskForm onAdd={onAddTask} />
              <p className="capture-card__note">Enter сохранит задачу и создаст для неё отдельную папку</p>
            </section>

            <section className="metrics-card" aria-label="Сводка задач">
              <div><span>В работе</span><strong>{activeTasks.length}</strong></div>
              <div><span>Готово</span><strong>{completedCount}</strong></div>
              <div><span>Осталось</span><strong>{activeTasks.length}</strong></div>
              <div><span>Всего</span><strong>{tasks.length}</strong></div>
            </section>
          </div>

          <footer className="dashboard-footer">
            <span><b>{completedCount} из {tasks.length}</b> завершено</span>
            <div
              className="progress-track"
              role="progressbar"
              aria-label={`Прогресс: ${progress}%`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              style={progressStyle}
            >
              <span />
            </div>
            <span>{String(progress).padStart(2, '0')}%</span>
          </footer>
        </div>

        <button
          className="folder-pull-hint"
          type="button"
          onClick={scrollToFolders}
        >
          <span>{tasks.length} {getTaskWord(tasks.length)} ниже</span>
          <small>Прокрутите, чтобы собрать стек</small>
          <ArrowDown aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};
