import { useMemo, useState } from 'react';
import { formatIDR } from '@/lib/format';

export { formatIDR };
export const TIP_PRESETS = [5, 10, 15, 18, 20, 25];

export function useTipCalculator() {
  const [billText, setBillText] = useState('');
  const [tipPercent, setTipPercent] = useState(15);
  const [people, setPeople] = useState(1);

  const bill = useMemo(() => {
    const clean = billText.replace(/[^\d]/g, '');
    return parseInt(clean || '0', 10);
  }, [billText]);

  const result = useMemo(() => {
    const tip = bill * (tipPercent / 100);
    const total = bill + tip;
    return {
      tipAmount: tip,
      totalAmount: total,
      perPerson: total / Math.max(1, people),
      tipPerPerson: tip / Math.max(1, people),
    };
  }, [bill, tipPercent, people]);

  const reset = () => {
    setBillText('');
    setTipPercent(15);
    setPeople(1);
  };

  const incrementPeople = () => setPeople((p) => p + 1);
  const decrementPeople = () => setPeople((p) => Math.max(1, p - 1));

  return {
    billText,
    setBillText,
    tipPercent,
    setTipPercent,
    people,
    incrementPeople,
    decrementPeople,
    bill,
    ...result,
    reset,
  };
}
