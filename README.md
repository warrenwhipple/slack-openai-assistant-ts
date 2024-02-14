# Slack OpenAI Assistant Prototype in TypeScript

## Local project setup

1. Install npm dependencies
2. Copy enviromental variables template to `.env.local`
3. Create [Slack app](https://api.slack.com/apps) via `slack-api-manifest.yml` and install to your workspace
4. Add Slack bot token to `.env.local`
5. Add Slack signing secret to `.env.local`
6. Enable socket mode: Settings > Socket Mode > Connect... > switch on
7. Enable DM to bot: Features > App Home > Show Tabs > Messages Tab > Allow users to send... > checked > Reload Slack client `Cmd + R`
8. Add [OpenAI API key](https://platform.openai.com/api-keys) to `.env.local`

```sh
npm install
cp .env.example .env.local
cat slack-api-manifest.yml
nano .env.local
```

## Launch local dev Slack app server

1. Start local dev server `npm run dev`
2. Start localtunnel `npx localtunnel --port 3000`
3. Copy localtunnel URL to Slack app > Features > Event Subscriptions > Request URL
4. Reinstall app to Slack workspace

Note you can use a custom localtunnel [`--subdomain`](https://github.com/localtunnel/localtunnel?tab=readme-ov-file#arguments) for a stable tunnel URL. Then skip steps 3 and 4 in the future.

```sh
npm run dev
npx localtunnel --port 3000
```
