export type AdapterQualityLimits = {
  maxFailedAdapters: number;
  maxFailedRatio: number;
};

export const getAdapterQualityLimits = (env: NodeJS.ProcessEnv = process.env): AdapterQualityLimits => {
  const parseConfiguredNumber = (value: string | undefined, fallback: number) =>
    value === undefined || value.trim() === "" ? fallback : Number(value);
  const maxFailedAdapters = parseConfiguredNumber(env.CRON_MAX_FAILED_ADAPTERS, 20);
  const maxFailedRatio = parseConfiguredNumber(env.CRON_MAX_FAILED_ADAPTER_RATIO, 0.25);
  return {
    maxFailedAdapters: Number.isInteger(maxFailedAdapters) && maxFailedAdapters >= 0 ? maxFailedAdapters : 20,
    maxFailedRatio:
      Number.isFinite(maxFailedRatio) && maxFailedRatio >= 0 && maxFailedRatio <= 1 ? maxFailedRatio : 0.25,
  };
};

export const evaluateAdapterQuality = (
  total: number,
  failed: number,
  limits: AdapterQualityLimits = getAdapterQualityLimits()
) => {
  const failedRatio = total > 0 ? failed / total : 0;
  const exceeded = failed > limits.maxFailedAdapters || failedRatio > limits.maxFailedRatio;
  return { exceeded, failedRatio, ...limits };
};

const failureMatchers: Array<[string, RegExp]> = [
  ["block_range", /block range unavailable/i],
  ["explorer_missing", /No supported explorer configured/i],
  ["explorer_plan", /Free Tier does not support|free api access is not supported/i],
  ["explorer_quota", /free api limit reached|daily request budget exhausted/i],
  ["provider_missing", /No provider configured|Provider initialization failed|reading 'getLogs'/i],
  ["rate_limited", /HTTP 429|status code 429/i],
  ["forbidden", /HTTP 403|status code 403/i],
  ["ibc", /MapOfZones/i],
  ["solana_slot", /Solana slot|slot was skipped|missing in long-term storage/i],
];

export const classifyAdapterFailure = (error: unknown): string[] => {
  const message = error instanceof Error ? error.message : String(error);
  const categories = failureMatchers.filter(([, matcher]) => matcher.test(message)).map(([category]) => category);
  return categories.length ? categories : ["other"];
};
