import { App } from "@slack/bolt";
import "dotenv/config";
import OpenAI from "openai";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const openai = new OpenAI();
const model = "gpt-3.5-turbo-1106";

app.message(
  async ({ message, next }) => {
    if (message.subtype) return;
    next();
  },
  async ({ message, say }) => {
    if (message.subtype) return;
    if (!message.text) return;
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: message.text }],
    });
    await say(chatCompletion.choices[0].message.content || "");
  }
);

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log("⚡️ Bolt app is running!");
})();
