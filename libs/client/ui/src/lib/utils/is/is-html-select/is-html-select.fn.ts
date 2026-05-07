export function isHTMLSelectElement(
  target: EventTarget | null,
): target is HTMLSelectElement {
  return target instanceof HTMLSelectElement && target.tagName === "SELECT";
}
