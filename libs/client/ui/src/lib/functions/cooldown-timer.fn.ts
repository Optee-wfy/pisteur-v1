/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @rx-angular/no-zone-critical-browser-apis */
export function startCooldown(
  timerSignal: { set: (v: number | null) => void; (): number | null },
  submittedSignal: { set: (v: boolean) => void },
  seconds: number,
): () => void {
  const current = timerSignal();
  if (current !== null) {
    return () => {};
  }
  timerSignal.set(seconds);
  const interval = setInterval(() => {
    const current = timerSignal();
    if (current === null || current <= 1) {
      clearInterval(interval);
      submittedSignal.set(false);
      timerSignal.set(null);
    } else {
      timerSignal.set(current - 1);
    }
  }, 1000);

  return () => {
    clearInterval(interval);
    timerSignal.set(null);
  };
}
