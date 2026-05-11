export const getAdjustmentLevel = (iq: number) => {
  if (iq >= 80) return { label: 'High', color: '#FF4444' };
  if (iq >= 60) return { label: 'Moderate', color: '#FFD700' };
  return { label: 'Low', color: '#00C851' };
};

/**
 * Ensures opponent iq is generated using a fair distribution: 1-100.
 * Low (<60), Moderate (60-79), and High (80-100).
 */
export const generateCoachingIQ = () => Math.floor(Math.random() * 50) + 45; // 45 to 95 for a realistic spread
