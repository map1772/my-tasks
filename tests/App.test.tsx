import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { STORAGE_KEY } from '../src/lib/storage';

describe('Список задач', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('показывает четыре демонстрационные задачи и прогресс', () => {
    render(<App />);
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
    expect(screen.getByText('Прогресс: 50%')).toBeInTheDocument();
    expect(screen.getByText('(4 задачи)')).toBeInTheDocument();
  });

  it('добавляет новую задачу по Enter и очищает поле', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Новая задача' });
    await user.type(input, '  Позвонить клиенту{Enter}');
    expect(screen.getByText('Позвонить клиенту')).toBeInTheDocument();
    expect(input).toHaveValue('');
    expect(screen.getAllByRole('checkbox')).toHaveLength(5);
  });

  it('не добавляет пустую задачу', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Добавить' }));
    expect(screen.getByText('Введите название задачи')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
  });

  it('переключает выполнение и пересчитывает прогресс', async () => {
    const user = userEvent.setup();
    render(<App />);
    const item = screen.getByText('Подготовить отчет для команды').closest('li');
    expect(item).not.toBeNull();
    await user.click(within(item!).getByRole('checkbox'));
    expect(screen.getByText('Прогресс: 75%')).toBeInTheDocument();
    await user.click(within(item!).getByRole('checkbox'));
    expect(screen.getByText('Прогресс: 50%')).toBeInTheDocument();
  });

  it('удаляет выбранную задачу', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole('button', {
        name: 'Удалить задачу: Завершить дизайн-концепцию проекта',
      }),
    );
    expect(screen.queryByText('Завершить дизайн-концепцию проекта')).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(3);
  });

  it('восстанавливает задачи из localStorage', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'stored',
          title: 'Сохранённая задача',
          completed: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    );
    render(<App />);
    expect(screen.getByText('Сохранённая задача')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  });

  it('не ломается при повреждённых сохранённых данных', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');
    render(<App />);
    expect(screen.getByText('Список свободен')).toBeInTheDocument();
    expect(screen.getByText('Прогресс: 0%')).toBeInTheDocument();
  });
});
