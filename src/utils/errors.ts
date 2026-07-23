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

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    const cause = (error as Error & { cause?: unknown }).cause;
    return cause === undefined ? error.message : `${error.message}; cause=${formatError(cause)}`;
  }
  if (typeof error === "string") return error;
  if (error === null) return "null";
  if (error === undefined) return "undefined";
  try {
    const serialized = JSON.stringify(error);
    return serialized && serialized !== "{}" ? serialized : String(error);
  } catch {
    return String(error);
  }
};

export const waitWithSignal = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    throwIfAborted(signal);
    const onAbort = () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", onAbort);
      reject(createAbortError());
    };
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) onAbort();
  });
