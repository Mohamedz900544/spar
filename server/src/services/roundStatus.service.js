import Round from "../models/Round.js";

const getTodayDateOnlyInCairo = () =>
  new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Cairo",
  });

export const completeFinishedRounds = async () => {
  const todayDateOnly = getTodayDateOnlyInCairo();
  const startOfToday = new Date(`${todayDateOnly}T00:00:00.000Z`);

  const result = await Round.updateMany(
    {
      status: { $ne: "Completed" },
      endDate: { $lt: startOfToday },
    },
    { $set: { status: "Completed" } }
  );

  return result.modifiedCount || result.nModified || 0;
};
