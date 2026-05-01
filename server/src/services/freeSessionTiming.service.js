export const getFreeSessionDurationMinutes = () => {
  const parsed = Number(process.env.FREE_SESSION_DURATION_MINUTES || 60);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
};

export const getFreeSessionFollowUpDelayMinutes = () => {
  const parsed = Number(process.env.FREE_SESSION_FOLLOW_UP_DELAY_MINUTES || 60);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 60;
};
