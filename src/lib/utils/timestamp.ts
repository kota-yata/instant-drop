/**
 * Generate timestamp with the format hh:mm:ss
 * @returns Timestamp string with the format hh:mm:ss
 */
export const getTimestamp = (): string => {
  const day = new Date();
  const timeStamp = `${day.getHours()}:${day.getMinutes()}:${day.getSeconds()}`;
  return timeStamp;
};
