import Slack from "@slack/bolt";
import "dotenv/config";
import fetch from "node-fetch";
import OpenAI from "openai";
import { sleep } from "openai/core";
import { Assistant } from "openai/resources/beta/assistants/assistants";

const { App, subtype } = Slack;
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const openai = new OpenAI();
const model = "gpt-3.5-turbo-1106";
let assistant: Assistant | undefined;

/** Listener for default message from human */
const noSubtype: ReturnType<typeof subtype> = async ({ message, next }) => {
  if (!message.subtype) await next();
};

app.message(noSubtype, async ({ message, say }) => {
  if (message.subtype) return;
  if (!message.text) return;
  if (message.text.toLocaleLowerCase() === "ping") {
    await say("pong");
    return;
  }
  const chatCompletion = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: message.text }],
  });
  await say(chatCompletion.choices[0].message.content || "");
});

app.message(subtype("file_share"), async ({ message, say }) => {
  if (message.subtype !== "file_share") return;
  const file = message.files?.[0];
  if (!file?.url_private) throw Error("No file URL");
  const response = await fetch(file.url_private, {
    headers: { Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}` },
  });
  if (!response.ok) {
    await say(`You shared file "${file.name}", but I could not access it.`);
    return;
  }
  await say(`You shared file "${file.name}". Uploading to OpenAI...`);
  const openaiFile = await openai.files.create({
    file: response,
    purpose: "assistants",
  });
  if (!assistant) {
    await say("Finding OpenAI document assistant...");
    const assistants = await openai.beta.assistants.list();
    assistant = assistants.data.find((a) => a.name === "Document Assistant");
  }
  if (!assistant) {
    await say("Document assistant not found, creating...");
    assistant = await openai.beta.assistants.create({
      name: "Document Assistant",
      instructions:
        "You are a helpful assistant that answers questions about documents.",
      model,
      tools: [{ type: "retrieval" }],
    });
  }
  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content: "Summarize this file.",
        file_ids: [openaiFile.id],
      },
    ],
  });
  let run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });
  const runId = run.id;
  let status = run.status;
  await say(`Summarizing... ${status}`);
  while (status === "queued" || status === "in_progress") {
    await sleep(1000);
    run = await openai.beta.threads.runs.retrieve(thread.id, runId);
    if (run.status !== status) {
      status = run.status;
      await say(`Summarizing... ${status}`);
    }
  }
  if (status !== "completed") {
    await say("Sorry, I could not summarize that file.");
    return;
  }
  const messages = await openai.beta.threads.messages.list(thread.id);
  const content = messages.data[0]?.content?.[0];
  if (content?.type !== "text") {
    await say(`OpenAI sent ${content?.type}`);
    return;
  }
  await say(content.text.value);
});

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log("⚡️ Bolt app is running!");
})();
