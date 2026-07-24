import fetch from "node-fetch";

const DISCORD_MESSAGE_LIMIT = 2000;
const DISCORD_MAX_ATTEMPTS = 2;

const truncateDiscordMessage = (message: string): string => {
  if (message.length <= DISCORD_MESSAGE_LIMIT) return message;
  return `${message.substring(0, DISCORD_MESSAGE_LIMIT - 3)}...`;
};

export const formatDiscordErrorDigest = (messages: string[]): string => {
  const uniqueMessages = Array.from(new Set(messages.map((message) => message.trim()).filter(Boolean)));
  if (uniqueMessages.length === 0) return "";

  const heading = `Bridges cron failures (${uniqueMessages.length}):`;
  let digest = heading;
  for (const message of uniqueMessages) {
    const nextLine = `\n- ${message}`;
    if (digest.length + nextLine.length > DISCORD_MESSAGE_LIMIT) {
      const omitted = uniqueMessages.length - digest.split("\n- ").length + 1;
      const suffix = `\n... ${omitted} more failure(s) omitted`;
      return truncateDiscordMessage(`${digest.substring(0, DISCORD_MESSAGE_LIMIT - suffix.length)}${suffix}`);
    }
    digest += nextLine;
  }
  return digest;
};

export const getDiscordRetryAfterMs = (responseBody: string, retryAfterHeader?: string | null): number => {
  try {
    const retryAfter = Number(JSON.parse(responseBody)?.retry_after);
    if (Number.isFinite(retryAfter) && retryAfter > 0) return Math.ceil(retryAfter * 1000);
  } catch {}
  const retryAfter = Number(retryAfterHeader);
  return Number.isFinite(retryAfter) && retryAfter > 0 ? Math.ceil(retryAfter * 1000) : 1000;
};

const wait = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function sendDiscordText(message: string): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK;
  if (!webhookUrl) {
    console.warn("Discord webhook is not configured; skipping notification.");
    return false;
  }

  try {
    if (message.length > DISCORD_MESSAGE_LIMIT) {
      console.warn("Discord message exceeds 2000 characters. Truncating...");
      message = truncateDiscordMessage(message);
    }

    for (let attempt = 1; attempt <= DISCORD_MAX_ATTEMPTS; attempt++) {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: message }),
      });

      const errorText = await res.text();
      if (res.ok) {
        console.log("Message sent to Discord successfully");
        return true;
      }

      if (res.status === 429 && attempt < DISCORD_MAX_ATTEMPTS) {
        const retryAfterMs = getDiscordRetryAfterMs(errorText, res.headers.get("retry-after"));
        console.warn(`Discord rate limited notification; retrying in ${retryAfterMs}ms.`);
        await wait(retryAfterMs);
        continue;
      }

      console.error(`Failed to send message to Discord: Status ${res.status} ${res.statusText}`);
      if (errorText) console.error("Error details:", errorText);
      return false;
    }
  } catch (error: any) {
    console.error("Failed to send message to Discord:", error);
  }
  return false;
}
