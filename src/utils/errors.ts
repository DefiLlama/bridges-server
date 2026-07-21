export class NonRetryableError extends Error {
  readonly retryable = false;

  constructor(message: string) {
    super(message);
    this.name = "NonRetryableError";
  }
}

export const isNonRetryableError = (error: unknown): error is NonRetryableError =>
  error instanceof NonRetryableError ||
  (typeof error === "object" && error !== null && "retryable" in error && (error as any).retryable === false);

export const createAbortError = (message: string = "Operation aborted") => {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
};

export const isAbortError = (error: unknown) => error instanceof Error && error.name === "AbortError";

export const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw createAbortError();
};
