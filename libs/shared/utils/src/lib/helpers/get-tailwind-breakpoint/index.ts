export type TailwindBreakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export function getTailwindBreakpoint(width: number): TailwindBreakpoint {
  if (width >= 1536) {
    return "2xl";
  }
  if (width >= 1280) {
    return "xl";
  }
  if (width >= 1024) {
    return "lg";
  }
  if (width >= 768) {
    return "md";
  }
  if (width >= 640) {
    return "sm";
  }
  if (width >= 480) {
    return "xs";
  }
  return "xs"; // fallback sécurité, mais 480 est le min ici
}
