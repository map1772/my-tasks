import { useCallback, useMemo, useRef, useState } from 'react';
import { Dashboard } from '@/components/dashboard';
import { TaskDialog } from '@/components/task-dialog';
import { TaskFolderStack } from '@/components/ui/task-folders';
import { useTasks } from '@/hooks/useTasks';

const App = () => {
  const {
    tasks,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    completedCount,
    progress,
  } = useTasks();
  const [dialogTaskId, setDialogTaskId] = useState<string | null>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);
  const dialogTask = tasks.find((task) => task.id === dialogTaskId) ?? null;
  const orderedTasks = useMemo(
    () => [
      ...tasks.filter((task) => !task.completed),
      ...tasks.filter((task) => task.completed),
    ],
    [tasks],
  );
  const dialogTaskNumber = dialogTask
    ? orderedTasks.findIndex((task) => task.id === dialogTask.id) + 1
    : 0;

  const closeDialog = useCallback(() => {
    const taskId = dialogTaskId;
    setDialogTaskId(null);
    window.requestAnimationFrame(() => {
      const currentTrigger = taskId
        ? document.getElementById(`task-trigger-${taskId}`)
        : null;
      (currentTrigger ?? dialogTriggerRef.current)?.focus({ preventScroll: true });
    });
  }, [dialogTaskId]);

  const removeTask = (id: string) => {
    deleteTask(id);
    setDialogTaskId(null);
  };

  return (
    <main className="app-shell">
      <Dashboard
        tasks={tasks}
        completedCount={completedCount}
        progress={progress}
        onAddTask={addTask}
      />

      <TaskFolderStack
        tasks={tasks}
        onOpenTask={(task, trigger) => {
          dialogTriggerRef.current = trigger;
          setDialogTaskId(task.id);
        }}
      />

      <TaskDialog
        key={dialogTaskId ?? 'closed'}
        task={dialogTask}
        taskNumber={dialogTaskNumber}
        onClose={closeDialog}
        onUpdate={updateTask}
        onToggle={toggleTask}
        onDelete={removeTask}
      />

      <footer className="site-footer">
        <span>Мои задачи</span>
        <span>Данные остаются в этом браузере</span>
      </footer>
    </main>
  );
};

export default App;
