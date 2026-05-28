import { useMemo, useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';

export type Todo = {
  id: string;
  text: string;
  done: boolean;
};

export type TodoFilter = 'all' | 'active' | 'completed';

const SEED: Todo[] = [
  { id: '1', text: 'Belajar useState', done: true },
  { id: '2', text: 'Pelajari NativeWind', done: false },
  { id: '3', text: 'Buat aplikasi pertama', done: false },
];

export function useTodos() {
  const [todos, setTodos] = useStoredState<Todo[]>('@app/todos', SEED);
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState<TodoFilter>('all');

  const filtered = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'completed') return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const remaining = todos.filter((t) => !t.done).length;
  const hasCompleted = todos.some((t) => t.done);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [{ id: String(Date.now()), text, done: false }, ...prev]);
    setInput('');
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((t) => !t.done));
  };

  return {
    todos,
    filter,
    input,
    filtered,
    remaining,
    hasCompleted,
    setFilter,
    setInput,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
  };
}
