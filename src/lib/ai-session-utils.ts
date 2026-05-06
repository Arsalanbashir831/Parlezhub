export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getProgressPercentage = (
  timeRemaining: number,
  totalDuration: number
): number => {
  return ((totalDuration - timeRemaining) / totalDuration) * 100;
};
