export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}
