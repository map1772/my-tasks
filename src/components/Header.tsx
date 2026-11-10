type HeaderProps = {
  taskCount: number;
};

const formatDate = (date: Date) => {
  const value = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date);
  return value.replace(' г.', '').toLocaleUpperCase('ru-RU');
};

export const Header = ({ taskCount }: HeaderProps) => (
  <header className="header">
    <div>
      <h1>Мои задачи</h1>
      <p className="header__date">{formatDate(new Date())}</p>
    </div>
    <div className="header__count" aria-label={`Всего задач: ${taskCount}`}>
      #{String(taskCount).padStart(3, '0')}
    </div>
  </header>
);
