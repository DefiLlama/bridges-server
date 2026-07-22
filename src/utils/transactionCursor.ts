export const DEFAULT_TRANSACTIONS_LIMIT = 10_000;
export const MAX_TRANSACTIONS_LIMIT = 10_000;

export interface TransactionCursor {
  timestamp: string;
  id: string;
}

interface TransactionCursorPayload {
  v: 1;
  t: string;
  i: string;
}

const cursorTimestampPattern = /^([1-9]\d{3})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.\d{6}Z$/;
const cursorIdPattern = /^[1-9]\d*$/;
const cursorValuePattern = /^[A-Za-z0-9_-]+$/;
const transactionsLimitPattern = /^(?:[1-9]\d{0,3}|10000)$/;
const maxPostgresBigint = "9223372036854775807";

const isValidCursorTimestamp = (value: string) => {
  const match = cursorTimestampPattern.exec(value);
  if (!match) return false;

  const [year, month, day, hour, minute, second] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day &&
    date.getUTCHours() === hour &&
    date.getUTCMinutes() === minute &&
    date.getUTCSeconds() === second
  );
};

const isValidCursorId = (value: string) =>
  cursorIdPattern.test(value) &&
  (value.length < maxPostgresBigint.length ||
    (value.length === maxPostgresBigint.length && value <= maxPostgresBigint));

export const parseTransactionsLimit = (value?: string) => {
  if (value === undefined) return DEFAULT_TRANSACTIONS_LIMIT;
  if (!transactionsLimitPattern.test(value)) return undefined;
  return Number(value);
};

export const encodeTransactionCursor = ({ timestamp, id }: TransactionCursor) =>
  Buffer.from(JSON.stringify({ v: 1, t: timestamp, i: id } satisfies TransactionCursorPayload), "utf8").toString(
    "base64url"
  );

export const decodeTransactionCursor = (value: string): TransactionCursor | undefined => {
  if (!value || value.length > 512 || !cursorValuePattern.test(value)) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<TransactionCursorPayload>;
    if (
      payload.v !== 1 ||
      typeof payload.t !== "string" ||
      !isValidCursorTimestamp(payload.t) ||
      typeof payload.i !== "string" ||
      !isValidCursorId(payload.i)
    ) {
      return undefined;
    }

    return { timestamp: payload.t, id: payload.i };
  } catch {
    return undefined;
  }
};
