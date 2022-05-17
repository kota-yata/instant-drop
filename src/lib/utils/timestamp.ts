/**
 * Generate timestamp with the format hh:mm:ss
 * @returns Timestamp string with the format hh:mm:ss
 */
export const getTimestamp = (): string => {
  const day = new Date();
  const hours = day.getHours().toString().padStart(2, '0');
  const minutes = day.getMinutes().toString().padStart(2, '0');
  const seconds = day.getSeconds().toString().padStart(2, '0');
  const timeStamp = `${hours}:${minutes}:${seconds}`;
  return timeStamp;
};
