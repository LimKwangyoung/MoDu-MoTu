import { DateTime } from "luxon";

export const COLORS = {
  positive: "#CF5055",
  negative: "#4881FF",
  neutral: "#888888",
};

// ex. 1일 전
export const stringToRelativeDate = (date: string) => {
  return DateTime.fromISO(date).toRelative();
};
