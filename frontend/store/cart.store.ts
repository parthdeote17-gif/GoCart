export function cartTotal(items: any[]) {
  return items.reduce((s, i) => s + Number(i.price), 0);
}
