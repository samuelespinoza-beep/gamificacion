import { addDays, isAfter } from 'date-fns';

export const savePoints = (amount, gameName) => {
  const now = new Date();
  const newEntry = {
    id: Math.random().toString(36).substr(2, 9),
    amount: amount,
    game: gameName,
    createdAt: now.toISOString(),
    expiresAt: addDays(now, 7).toISOString(),
    redeemed: false
  };

  const existing = JSON.parse(localStorage.getItem('user_points') || '[]');
  localStorage.setItem('user_points', JSON.stringify([...existing, newEntry]));
};

export const getValidPoints = () => {
  if (typeof window === 'undefined') return 0;
  const allPoints = JSON.parse(localStorage.getItem('user_points') || '[]');
  const now = new Date();

  const valid = allPoints.filter(p => 
    !p.redeemed && isAfter(new Date(p.expiresAt), now)
  );

  return valid.reduce((acc, curr) => acc + curr.amount, 0);
};