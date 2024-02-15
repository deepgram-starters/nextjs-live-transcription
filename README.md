# AI Notetaker Project

## Overview

AI Notetaker is a cutting-edge application designed to enhance meeting productivity by generating notes using the latest in AI technology. Powered by Deepgram for speech recognition and OpenAI for text generation, this application offers a seamless experience for capturing and summarizing meeting discussions.

## Features

- **Real-time Transcription**: Utilizes Deepgram's speech-to-text capabilities to provide real-time transcription of meetings.
- **AI-Powered Summaries**: Leverages OpenAI's GPT models to generate concise summaries of meeting transcripts, making it easier to capture the essence of discussions.
- **Interactive UI**: Built with Next.js and Tailwind CSS for a responsive and intuitive user interface.
- **Speaker Identification**: Diarization support to identify and differentiate speakers throughout the meeting.
- **Meeting Management**: Users can create, view, and manage their meetings with ease.
- **Chat Interface**: A chat feature that allows users to interact with the AI for quick summaries or answers to specific questions about the meeting content.
- **Customizable Experience**: Users can toggle the inclusion of transcripts in AI interactions and choose between different AI models for summaries.

## Technologies Used

- **Next.js**: A React framework for building server-side rendering and static web applications.
- **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
- **Deepgram**: Provides real-time speech recognition and transcription services.
- **OpenAI**: Offers powerful AI models like GPT-3.5 and GPT-4 for generating text-based content.
- **Shadcn/UI**: A component library used for building the UI elements in the application.
- **Lucide Icons**: A beautifully crafted icon library for use in web projects.

## Getting Started

To get started with AI Notetaker, follow these steps:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-repository/ai-notetaker.git
   ```

2. **Set up environment variables**:
   Create a `.env.local` file at the root of your project and add your Deepgram API key and OpenAI API key:

   ```plaintext
   NEXT_PUBLIC_DEEPGRAM_API_KEY=your_deepgram_api_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Contributing

Contributions are welcome! If you have a feature request or bug report, please open an issue to discuss it. Pull requests should be made against the `main` branch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
