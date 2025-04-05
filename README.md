# AI English Tutor

An interactive AI-powered English tutoring application that provides real-time conversation practice using voice interaction. This application uses OpenAI's advanced AI models for speech-to-text, natural language processing, and text-to-speech capabilities.

## Features

- 🎤 Real-time voice interaction
- 🤖 AI-powered English tutoring
- 🔊 Natural text-to-speech responses
- 💬 Interactive conversation interface
- 🎯 Personalized learning experience

## Tech Stack

- **Frontend:**
  - Next.js 15
  - React 19
  - Material-UI
  - TailwindCSS
  - TypeScript

- **Backend:**
  - Express.js
  - OpenAI API (GPT-4, Whisper, TTS)
  - Multer (file handling)

## Prerequisites

- Node.js (v18 or higher)
- OpenAI API key
- Modern web browser with microphone access

## Environment Variables

Create a `.env` file in the backend directory with:

```
OPENAI_API_KEY=your_openai_api_key_here
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ai-english-tutor
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
node server.js
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Click the "Start Listening" button to begin a conversation
2. Speak in English - the AI will transcribe your speech
3. Receive AI tutor responses with natural voice synthesis
4. Continue the conversation to practice English

## API Endpoints

- `POST /transcribe` - Converts speech to text using OpenAI Whisper
- `POST /ai-response` - Generates AI tutor responses using GPT-4
- `POST /speak` - Converts AI responses to speech using OpenAI TTS

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for providing the AI models
- Next.js team for the amazing framework
- All contributors and users of this project
