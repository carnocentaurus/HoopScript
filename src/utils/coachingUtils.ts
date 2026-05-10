export const getAdjustmentLevel = (iq: number) => {
  if (iq >= 8) return { label: 'High', color: '#FF4444' };
  if (iq >= 4) return { label: 'Moderate', color: '#FFD700' };
  return { label: 'Low', color: '#00C851' };
};
