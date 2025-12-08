import fetch from "node-fetch";

export async function sendWebhook(payload: any) {
  try {
    console.log("Sending Webhook:", payload);
    await fetch("https://hook.eu1.make.com/67h1d8gyj3pxhehqde5ud5tq40iiw0sn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    console.log("Webhook sent successfully.");
  } catch (err) {
    console.error("Webhook error:", err);
  }
}
