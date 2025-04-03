# Next.js Live Transcription Starter

[![Discord](https://dcbadge.vercel.app/api/server/xWRaCDBtW4?style=flat)](https://discord.gg/xWRaCDBtW4)

The purpose of this demo is to showcase how you can build a NextJS speech to text app using [Deepgram](https://deepgram.com/).

## Live Demo
You can see the demo in action on Vercel: https://nextjs-live-transcription.vercel.app/

## Demo features

Capture streaming audio using [Deepgram Streaming Speech to Text](https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio).

## What is Deepgram?

[Deepgram’s](https://deepgram.com/) voice AI platform provides APIs for speech-to-text, text-to-speech, and full speech-to-speech voice agents. Over 200,000+ developers use Deepgram to build voice AI products and features.

## Sign-up to Deepgram

Want to start building using this project? [Sign-up now for Deepgram and create an API key](https://console.deepgram.com/signup?jump=keys).

## Quickstart

### Manual

Follow these steps to get started with this starter application.

#### Clone the repository

Go to GitHub and [clone the repository](https://github.com/deepgram-starters/nextjs-live-transcription).

#### Install dependencies

Install the project dependencies.

```bash
npm install
```

#### Edit the config file

Copy the code from `sample.env.local` and create a new file called `.env.local`.

```bash
DEEPGRAM_API_KEY=YOUR-DG-API-KEY
```

For `DEEPGRAM_API_KEY` paste in the key you generated in the [Deepgram console](https://console.deepgram.com/).

#### Run the application

Once running, you can [access the application in your browser](http://localhost:3000).

```bash
npm run dev
```

## Custom Connect/Disconnect Feature

This project includes a custom connect/disconnect mechanism to streamline your workflow:

### Connect Button

- Initiates the microphone setup by requesting access with the appropriate audio settings.
- Sets up a `MediaRecorder` for streaming audio.
- Connects to Deepgram’s live transcription service using the provided API key.
- Displays a visualizer to provide real-time feedback on the audio input.

### Disconnect Button

- Stops the `MediaRecorder` and all underlying media stream tracks.
- Disconnects from Deepgram.
- Resets the UI, ensuring that components like the Visualizer unmount and remount with fresh data on the next connection.
- Clears any residual transcription data to prepare for a clean session.

### Additional Notes

- The connect/disconnect feature is designed to handle edge cases, such as microphone access denial or network interruptions, ensuring a robust user experience.
- The implementation is modular, making it easy to extend or customize for different use cases, such as multi-language transcription or integrating additional audio processing libraries.

This functionality makes it straightforward to integrate live transcription into your own projects or use this starter as a quick prototype.


## Issue Reporting

If you have found a bug or if you have a feature request, please report them at this repository issues section. Please do not report security vulnerabilities on the public GitHub issue tracker. The [Security Policy](./SECURITY.md) details the procedure for contacting Deepgram.


## Getting Help

We love to hear from you so if you have questions, comments or find a bug in the project, let us know! You can either:

- [Open an issue in this repository](https://github.com/deepgram-starters/nextjs-live-transcription/issues)
- [Join the Deepgram Github Discussions Community](https://github.com/orgs/deepgram/discussions)
- [Join the Deepgram Discord Community](https://discord.gg/xWRaCDBtW4)

## Author

[Deepgram](https://deepgram.com)

## License

This project is licensed under the MIT license. See the [LICENSE](./LICENSE) file for more info.
