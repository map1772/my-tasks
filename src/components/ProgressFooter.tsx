import { getTaskWord } from '../lib/taskProgress';

type ProgressFooterProps = {
  progress: number;
  taskCount: number;
};

export const ProgressFooter = ({ progress, taskCount }: ProgressFooterProps) => (
  <footer className="progress-footer">
    <span>Прогресс: {progress}%</span>
    <span>
      ({taskCount} {getTaskWord(taskCount)})
    </span>
  </footer>
);
