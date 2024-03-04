# Known Issues

This is a list of known issues. For the latest list of all issues see the [Github Issues page](https://github.com/deepgram-devs/deepgram-conversational-demo/issues).

## Microphone continues to listen when you tab away from the site.

Mute microphone when tab no longer visible.

Possible fix is to use `visibilitychange` event to detect when the page is !== 'visible' and pause the microphone audio.

See: https://stackoverflow.com/questions/10338704/javascript-to-detect-if-user-changes-tab
Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/3

## iOS Autoplay Issues

Seems to be a very well-known issue with iOS devices. Apple requires a user event to play audio in the browser - basically.

A possible fix is to use the launchpage click to start the app to play a zero-audio mp3 file, and change the context of that audio object when playing audio from the queue.

See: https://matt-harrison.com/posts/web-audio/
Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/4

## Echocancellation doesn't always work in Chrome/Chromium browsers

Caused by a user not using peer-devices. Here is the ticket: https://bugs.chromium.org/p/chromium/issues/detail?id=687574 It basically says that the echo cancellation only works for audio that is coming from a peer connection. As soon as it is processed locally by the Web Audio API it will not be considered anymore by the echo cancellation.

Possible fix is to go ahead and volume-down the playback when you start speaking. This will improve the barge-in experience, and possibly duck the playback under the microphones' decibel threshold so it doesn't pick itself up.

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/5

## ErrorContextProvider should also handle system messages and warnings

Rename ErrorContextProvider to be a general toast message handler.

See: https://tailwindui.com/components/application-ui/overlays/notifications
Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/6

## Errors added to ErrorContextProvider do not display

We have not plugged ANY errors into the ErrorContextProvider yet.

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/7

## Request errors should retry up to X times

Request errors should retry (and display notice when "taking longer than usual" using the ErrorContextProvider)

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/8

## Mobile UX Tweaks

Small tweaks to the mobile user experience, like scroll position on opening keyboard, buttons and icons in the controls bar, etc.

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/9

## Setup OpenGraph and metadata

We have some missing OG and meta information.

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/10

## Better prompt injection protection

Examples of role play and phonetically explicit responses can be prompted.

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/11

## Chunking TTS request and return stream from serverless function

We'd like to be able to start the TTS response earlier. We have chunking logic for JavaScript, so we want to buffer the TTS input as a stream, clear the buffer into individual TTS requests, and combine the responses into a single response stream.

See: https://www.npmjs.com/package/multistream
Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/12

## STT sometimes hangs and needs extra words to finalise

I think we get an is_final but not a speech_final. Is this a case of tuning utterance_end_ms?

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/14

## Mini control panel to allow for changing various settings

Add a control panel that will allow for the adjusting of settings, and that will restart the websocket or other connections when settings change where appropriate.

Issue: https://github.com/deepgram-devs/deepgram-conversational-demo/issues/15

## Name change

Rebranding of the app
