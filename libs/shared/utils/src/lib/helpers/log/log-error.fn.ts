export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const stack = error instanceof Error ? error.stack : undefined;
  const prefix = context ? `[${timestamp}] [${context}]` : `[${timestamp}]`;

  if (error instanceof Error) {
    console.error(prefix, error.message, error);
  } else {
    console.error(prefix, String(error));
  }
  if (stack) {
    console.error(stack);
  }
}
