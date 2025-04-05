import express from "express";
import multer from "multer";
import fs from "fs";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors"; 
import OpenAI from "openai";
import path from "path";

dotenv.config();

const app = express();
const port = 8002;
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1]; // Get extension from MIME type
      cb(null, `audio_${Date.now()}.${ext}`);
    },
  });
  
  const upload = multer({ 
    storage, 
    fileFilter: (req, file, cb) => {
      const allowedTypes = ["audio/wav", "audio/mpeg", "audio/mp3", "audio/mp4"];
      if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error("Only .wav, .mp3, and .mp4 files are allowed"));
      }
      cb(null, true);
    }
  });
app.use(cors()); // Enable CORS for all requests
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is loaded
});

// Speech-to-Text (Whisper API)
app.post("/transcribe", upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No audio file provided" });
        }

        console.log("Uploaded file:", req.file);

        // 🔴 Check if the file is empty before sending to OpenAI
        if (req.file.size === 0) {
            return res.status(400).json({ error: "Uploaded file is empty" });
        }

        const audioPath = req.file.path;

        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(audioPath),
            model: "whisper-1",
        });

        fs.unlinkSync(audioPath); // Cleanup after processing
        res.json({ transcript: response.text });
    } catch (error) {
        console.error("Error transcribing audio:", error);
        res.status(500).json({ error: "Failed to transcribe audio" });
    }
});


// AI Response (GPT or Llama Model)
app.post("/ai-response", async (req, res) => {
    try {
        const { text } = req.body;
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "assistant", content: "You are an English tutor." },
                {
                    role: "user",
                    content: text,
                },
            ],
            store: true,
        });

        res.json({ response: completion.choices[0].message });
    } catch (error) {
        console.error("Error getting AI response:", error);
        res.status(500).json({ error: "Failed to get AI response" });
    }
  
    
});

// ✅ Text-to-Speech (OpenAI TTS)
app.post("/speak", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        // 🟢 Generate Speech
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text, // Use dynamic text input
        });

        // Convert to Buffer
        const buffer = Buffer.from(await mp3.arrayBuffer());

        // ✅ Define file path correctly
        const speechFile = path.join(process.cwd(), "tts_output.mp3");
        await fs.promises.writeFile(speechFile, buffer);

        // Send MP3 response
        res.set({ "Content-Type": "audio/mpeg" }).send(buffer);
    } catch (error) {
        console.error("Error in text-to-speech:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
});

// ✅ Only one `app.listen` should be here
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
