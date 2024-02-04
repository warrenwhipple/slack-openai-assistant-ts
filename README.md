# Slack OpenAI Assistant Prototype in TypeScript

## Local project setup

1. Install npm dependencies
2. Copy enviromental variables template to `.env`
3. Create [Slack app](https://api.slack.com/apps) via `slack-api-manifest.yml` and install to your workspace
4. Add Slack bot token to `.env`
5. Enable socket mode: Settings > Socket Mode > Connect... > switch on
6. Generate app token: Settings > Basic... > App-Level Tokens > Generate... > any name e.g. "openai assistant" > Add Scope `connections:write` > Generate
7. Add Slack app token to `.env`
8. Enable DM to bot: Features > App Home > Show Tabs > Messages Tab > Allow users to send... > checked > Reload Slack client `Cmd + R`
9. Add [OpenAI API key](https://platform.openai.com/api-keys) to `.env`

```sh
npm install
cp .env.example .env
cat slack-api-manifest.yml
nano .env
```

## Launch local dev Slack app server

```sh
npm start
```
