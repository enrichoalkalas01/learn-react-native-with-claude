import { useMemo, useState } from 'react';
import { useStoredState } from '@/hooks/use-stored-state';
import { formatIDR } from '@/lib/format';

export { formatIDR };

export type TransactionType = 'income' | 'expense';

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  createdAt: number;
};

export const EXPENSE_CATEGORIES = [
  'Makanan',
  'Transport',
  'Belanja',
  'Hiburan',
  'Tagihan',
  'Lainnya',
];

export const INCOME_CATEGORIES = ['Gaji', 'Bonus', 'Hadiah', 'Lainnya'];

const SEED: Transaction[] = [
  {
    id: '1',
    type: 'income',
    amount: 5000000,
    category: 'Gaji',
    note: 'Gaji bulan ini',
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: '2',
    type: 'expense',
    amount: 50000,
    category: 'Makanan',
    note: 'Makan siang',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: '3',
    type: 'expense',
    amount: 30000,
    category: 'Transport',
    note: 'Bensin',
    createdAt: Date.now() - 86400000,
  },
];

export function useExpenses() {
  const [transactions, setTransactions] = useStoredState<Transaction[]>(
    '@app/transactions',
    SEED
  );
  const [type, setType] = useState<TransactionType>('expense');
  const [amountText, setAmountText] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    }
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const amount = useMemo(() => {
    const clean = amountText.replace(/[^\d]/g, '');
    return parseInt(clean || '0', 10);
  }, [amountText]);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const switchType = (newType: TransactionType) => {
    setType(newType);
    const list = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setCategory(list[0]);
  };

  const addTransaction = () => {
    if (amount <= 0) return;
    setTransactions((prev) => [
      {
        id: String(Date.now()),
        type,
        amount,
        category,
        note: note.trim(),
        createdAt: Date.now(),
      },
      ...prev,
    ]);
    setAmountText('');
    setNote('');
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    transactions,
    type,
    amountText,
    amount,
    category,
    note,
    categories,
    totals,
    setAmountText,
    setCategory,
    setNote,
    switchType,
    addTransaction,
    deleteTransaction,
  };
}
