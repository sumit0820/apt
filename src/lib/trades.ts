export function formatTradeDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function directionClass(direction: "Long" | "Short") {
  return direction === "Long" ? "text-bull font-semibold" : "text-bear font-semibold";
}

export function toDateInputValue(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}
