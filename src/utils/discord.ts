import fetch from "node-fetch";

export async function sendDiscordText(message: string): Promise<void> {
  try {
    await fetch(process.env.DISCORD_WEBHOOK as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });
  } catch (error) {
    console.error("Failed to send message to Discord:", error);
  }
}
