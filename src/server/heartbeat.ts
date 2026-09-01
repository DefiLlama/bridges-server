import axios from "axios";

export const CRON_CYCLE_CHECK = "cron-cycle-ran";

export async function pushHeartbeat(check: string): Promise<void> {
  const url = process.env.LLAMA_METRICS_URL;
  const token = process.env.LLAMA_PUSH_TOKEN;
  if (!url || !token) {
    console.log(`[heartbeat] ${check}: LLAMA_METRICS_URL/LLAMA_PUSH_TOKEN not set, skipping`);
    return;
  }

  const body = new URLSearchParams({
    service: "bridges-api",
    check,
    team: "bridges",
    severity: "ticket",
    tier: "0",
    status: "ok",
  }).toString();

  try {
    await axios.post(`${url.replace(/\/$/, "")}/job`, body, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 10_000,
    });
    console.log(`[heartbeat] ${check}: ok`);
  } catch (e: any) {
    console.error(`[heartbeat] ${check} push failed:`, e?.response?.status ?? "", e?.message);
  }
}
