export const getElapsedTime = (isoString: string): { label: string; minutes: number } => {
  const created = new Date(isoString).getTime();
  const now = new Date().getTime();
  const diffInMinutes = Math.floor((now - created) / (1000 * 60));

  if (diffInMinutes < 1) return { label: 'Hace un momento', minutes: 0 };
  if (diffInMinutes < 60) return { label: `Hace ${diffInMinutes} min`, minutes: diffInMinutes };
  
  const hours = Math.floor(diffInMinutes / 60);
  const mins = diffInMinutes % 60;
  return { label: `Hace ${hours}h ${mins}m`, minutes: diffInMinutes };
};