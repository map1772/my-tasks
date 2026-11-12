import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { STORAGE_KEY } from '../src/lib/storage';
import { getTaskWord } from '../src/lib/taskProgress';

const getTaskButton = (title: string) =>
  screen.getByRole('button', { name: new RegExp(title) });

const openTask = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
  await user.click(getTaskButton(title));
  return screen.getByRole('dialog');
};

const getStoredTask = (id: string) => {
  const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
  return stored.find((task: { id: string }) => task.id === id);
};

describe('Мои задачи', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('показывает четыре демонстрационные задачи и реальный прогресс', () => {
    render(<App />);

    expect(screen.getAllByRole('button', { name: /В работе|Выполнено/ })).toHaveLength(4);
    expect(screen.getByLabelText('Прогресс: 50%')).toBeInTheDocument();
    expect(screen.getByText('2 из 4')).toBeInTheDocument();
  });

  it('добавляет новую задачу по Enter и сохраняет её', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole('textbox', { name: 'Новая задача' });
    await user.type(input, '  Позвонить клиенту{Enter}');

    expect(getTaskButton('Позвонить клиенту')).toBeInTheDocument();
    expect(input).toHaveValue('');
    await waitFor(() => {
      expect(getStoredTask('demo-design')).toBeDefined();
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toEqual(
        expect.arrayContaining([expect.objectContaining({ title: 'Позвонить клиенту' })]),
      );
    });
  });

  it('не добавляет пустую задачу', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Добавить' }));

    expect(screen.getByText('Введите название задачи')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /В работе|Выполнено/ })).toHaveLength(4);
  });

  it('редактирует название и описание и сохраняет изменения в localStorage', async () => {
    const user = userEvent.setup();
    render(<App />);
    const dialog = await openTask(user, 'Завершить дизайн-концепцию проекта');
    await user.click(within(dialog).getByRole('button', { name: 'Редактировать' }));

    await user.clear(within(dialog).getByRole('textbox', { name: 'Название' }));
    await user.type(within(dialog).getByRole('textbox', { name: 'Название' }), 'Утвердить дизайн проекта');
    await user.clear(within(dialog).getByRole('textbox', { name: 'Описание' }));
    await user.type(within(dialog).getByRole('textbox', { name: 'Описание' }), 'Проверить макеты на двух экранах');
    fireEvent.change(within(dialog).getByLabelText('Срок'), {
      target: { value: '2026-11-15' },
    });
    await user.click(within(dialog).getByRole('button', { name: 'Сохранить' }));

    expect(within(dialog).getByRole('heading', { name: 'Утвердить дизайн проекта' })).toBeInTheDocument();
    expect(within(dialog).getByText('Проверить макеты на двух экранах')).toBeInTheDocument();
    expect(getTaskButton('Утвердить дизайн проекта')).toBeInTheDocument();
    await waitFor(() => {
      expect(getStoredTask('demo-design')).toEqual(
        expect.objectContaining({
          title: 'Утвердить дизайн проекта',
          description: 'Проверить макеты на двух экранах',
          dueDate: '2026-11-15',
          updatedAt: expect.any(String),
        }),
      );
    });
  });

  it('отменяет редактирование без изменения задачи', async () => {
    const user = userEvent.setup();
    render(<App />);
    const dialog = await openTask(user, 'Подготовить отчет для команды');
    await user.click(within(dialog).getByRole('button', { name: 'Редактировать' }));
    const titleInput = within(dialog).getByRole('textbox', { name: 'Название' });
    await user.clear(titleInput);
    await user.type(titleInput, 'Черновое название');
    await user.click(within(dialog).getByRole('button', { name: 'Отмена' }));

    expect(within(dialog).getByRole('heading', { name: 'Подготовить отчет для команды' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Черновое название/ })).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Редактировать' }));
    expect(within(dialog).getByRole('textbox', { name: 'Название' })).toHaveValue('Подготовить отчет для команды');
  });

  it('не сохраняет пустое название', async () => {
    const user = userEvent.setup();
    render(<App />);
    const dialog = await openTask(user, 'Завершить дизайн-концепцию проекта');
    await user.click(within(dialog).getByRole('button', { name: 'Редактировать' }));
    await user.clear(within(dialog).getByRole('textbox', { name: 'Название' }));
    await user.click(within(dialog).getByRole('button', { name: 'Сохранить' }));

    expect(within(dialog).getByRole('alert')).toHaveTextContent('Название нужно заполнить');
    expect(within(dialog).getByRole('textbox', { name: 'Название' })).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => {
      expect(getStoredTask('demo-design')).toEqual(
        expect.objectContaining({ title: 'Завершить дизайн-концепцию проекта' }),
      );
    });
  });

  it('закрывает detail-view по Escape и возвращает фокус на ту же папку', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openTask(user, 'Подготовить отчет для команды');

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(getTaskButton('Подготовить отчет для команды')).toHaveFocus());
  });

  it('переводит задачу в выполненные и сохраняет состояние', async () => {
    const user = userEvent.setup();
    render(<App />);
    const dialog = await openTask(user, 'Подготовить отчет для команды');
    await user.click(within(dialog).getByRole('button', { name: 'Выполнить' }));

    expect(getTaskButton('Подготовить отчет для команды')).toHaveAccessibleName(
      'Подготовить отчет для команды. Выполнено',
    );
    expect(screen.getByLabelText('Прогресс: 75%')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Вернуть в работу' })).toBeInTheDocument();
    await waitFor(() => {
      expect(getStoredTask('demo-report')).toEqual(
        expect.objectContaining({ completed: true, updatedAt: expect.any(String) }),
      );
    });
  });

  it('удаляет выбранную задачу из detail-view', async () => {
    const user = userEvent.setup();
    render(<App />);
    const dialog = await openTask(user, 'Завершить дизайн-концепцию проекта');
    await user.click(within(dialog).getByRole('button', { name: 'Удалить' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Завершить дизайн-концепцию проекта/ })).not.toBeInTheDocument();
    expect(screen.getByText('2 из 3')).toBeInTheDocument();
  });

  it('загружает старые задачи без description, dueDate и updatedAt', async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: 'legacy',
          title: 'Старая задача',
          completed: false,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ]),
    );
    const user = userEvent.setup();
    render(<App />);

    const dialog = await openTask(user, 'Старая задача');
    expect(within(dialog).getByText('Описание пока не добавлено')).toBeInTheDocument();
    expect(within(dialog).getByText('Не задан')).toBeInTheDocument();
    expect(screen.getByText('0 из 1')).toBeInTheDocument();
  });

  it('не ломается при повреждённых сохранённых данных', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');
    render(<App />);

    expect(screen.getByText('Стол свободен')).toBeInTheDocument();
    expect(screen.getByLabelText('Прогресс: 0%')).toBeInTheDocument();
  });
});

describe('Склонение количества задач', () => {
  it.each([
    [1, 'задача'],
    [2, 'задачи'],
    [5, 'задач'],
    [11, 'задач'],
    [21, 'задача'],
    [24, 'задачи'],
  ])('для %i возвращает «%s»', (count, word) => {
    expect(getTaskWord(count)).toBe(word);
  });
});
