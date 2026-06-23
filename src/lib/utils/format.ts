export function formatPrice(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-NP").format(value)}`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
