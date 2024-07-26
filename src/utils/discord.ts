import fetch from "node-fetch";

export async function sendDiscordText(message: string): Promise<void> {
  try {
    if (message.length > 2000) {
      console.warn("Discord message exceeds 2000 characters. Truncating...");
      message = message.substring(0, 1997) + "...";
    }

    const res = await fetch(process.env.DISCORD_WEBHOOK as string, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to send message to Discord: Status ${res.status} ${res.statusText}`);
      console.error("Error details:", errorText);
    }

    console.log("Message sent to Discord successfully");
  } catch (error: any) {
    console.error("Failed to send message to Discord:", error);
  }
}
