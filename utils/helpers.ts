import { formatDistanceToNow } from "date-fns";

export const formatNewsTime = (timeString: string) => {
  try {
    const date = new Date(timeString);
    if (!isNaN(date.getTime())) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  } catch (error) {
    console.warn("Error parsing date:", error);
  }
  return "Just now";
};
