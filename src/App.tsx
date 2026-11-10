import { Header } from './components/Header';
import { ImageStrip } from './components/ImageStrip';
import { ProgressFooter } from './components/ProgressFooter';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { useTasks } from './hooks/useTasks';

const App = () => {
  const { tasks, addTask, toggleTask, deleteTask, progress } = useTasks();

  return (
    <main className="page-shell">
      <section className="task-card" aria-labelledby="page-title">
        <div id="page-title" className="sr-only">
          Приложение «Мои задачи»
        </div>
        <Header taskCount={tasks.length} />
        <ImageStrip />
        <TaskForm onAdd={addTask} />
        <TaskList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
        <ProgressFooter progress={progress} taskCount={tasks.length} />
      </section>
    </main>
  );
};

export default App;
