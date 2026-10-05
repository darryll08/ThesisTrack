const jakartaDateFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const wallClockFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const jakartaDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  timeZone: "Asia/Jakarta",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function formatJakartaDate(date: Date) {
  return jakartaDateFormatter.format(date);
}

export function formatDatabaseTime(date: Date) {
  return wallClockFormatter.format(date).replace(".", ":");
}

export function formatJakartaDateTime(date: Date) {
  return jakartaDateTimeFormatter.format(date).replace(".", ":");
}

export function dateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function timeInputValue(date: Date) {
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}
