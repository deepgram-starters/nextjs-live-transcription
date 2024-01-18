# Live Audio Next.js Starter

[![Discord](https://dcbadge.vercel.app/api/server/xWRaCDBtW4?style=flat)](https://discord.gg/xWRaCDBtW4)

This sample demonstrates interacting with Deepgram from Next.js to transcribe your microphone audio. It uses the Deepgram JavaScript SDK. This was originally a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Demo features

- Persistent connection to Deepgram
  - This demo will automatically reconnect in the event the websocket disconnects.
- Microphone audio buffer
  - The microphone audio is buffered and instantly sent to Deepgram. In the event the socket disconnects, the audio continues to buffer and then catches up once the connection is re-established.
- Uses temporary API keys
  - This demo mints it's own temporary short-lived (a few seconds), limited scope API keys in a server route, to protect your main API key.
- Browser-side transcription
  - The connection to Deepgram is established directly from the client, and does not use a server-side component to transcribe the audio.

## What is Deepgram?

[Deepgram](https://deepgram.com/) is a foundational AI company providing speech-to-text and language understanding capabilities to make data readable and actionable by human or machines.

## Sign-up to Deepgram

Before you start, it's essential to generate a Deepgram API key to use in this project. [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys).

## Quickstart

### Manual

Follow these steps to get started with this starter application.

#### Clone the repository

Go to GitHub and [clone the repository](https://github.com/deepgram-starters/live-nextjs-starter).

#### Install dependencies

Install the project dependencies.

```bash
npm install
```

#### Edit the config file

Copy the code from `sample.env.local` and create a new file called `.env.local`. Paste in the code and enter your API key you generated in the [Deepgram console](https://console.deepgram.com/).

```bash
DEEPGRAM_API_KEY=%api_key%
```

#### Run the application

Once running, you can [access the application in your browser](http://localhost:3000).

```bash
npm run dev
```

## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Security Policy](./SECURITY.md) details the procedure for contacting Deepgram.

## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the project, let us know! You can either:

- [Open an issue in this repository](https://github.com/deepgram-starters/live-nextjs-starter/issues/new)
- [Join the Deepgram Github Discussions Community](https://github.com/orgs/deepgram/discussions)
- [Join the Deepgram Discord Community](https://discord.gg/xWRaCDBtW4)

## Author

[Deepgram](https://deepgram.com)

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.
