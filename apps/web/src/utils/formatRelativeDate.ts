export const formatRelativeDate = (value: string | Date): string => {
  const date = value instanceof Date ? value : new Date(value);

  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return "Just now";
  }

  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);

    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);

    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const isYesterday = (() => {
    const yesterday = new Date(now);

    yesterday.setDate(now.getDate() - 1);

    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  })();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  if (isYesterday) {
    return `Yesterday ${timeFormatter.format(date)}`;
  }

  const sameYear = date.getFullYear() === now.getFullYear();

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return formatter.format(date);
};
