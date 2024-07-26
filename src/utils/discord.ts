import fetch from "node-fetch";

export async function sendDiscordText(message: string): Promise<void> {
  try {
    const res = await fetch(process.env.DISCORD_WEBHOOK as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });
    if (!res.ok) {
      console.error("Failed to send message to Discord:", res.statusText);
    }
    if (res.ok) {
      console.log("Message sent to Discord:", message);
    }
  } catch (error) {
    console.error("Failed to send message to Discord:", error);
  }
}
