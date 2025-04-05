"use client";
import { useState, useEffect } from "react";
import { Button, Card, CardContent, TextField } from "@mui/material";
import axios from "axios";


export default function Home() {
  const [conversation, setConversation] = useState<{ role: string; content: string }[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<BlobPart[]>([]);

  useEffect(() => {
    if (isListening) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [isListening]);

  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        let audioChunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            if (audioChunks.length === 0) {
                console.error("Error: Recorded audio is empty!");
                return;
            }

            const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
            await sendAudioToBackend(audioBlob);
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), 4000); // Stop after 4 sec (adjust as needed)
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
};


  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        sendAudioToBackend(audioBlob);
        setAudioChunks([]);
      };
    }
  };
  const sendAudioToBackend = async (audioBlob: Blob) => {
    if (audioBlob.size === 0) {
        console.error("Error: Recorded audio is empty!");
        return;
    }

    const formData = new FormData();
    const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" });
    formData.append("audio", audioFile);

    try {
        const response = await axios.post("http://localhost:8002/transcribe", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Transcription:", response.data.transcript);
        handleUserSpeech(response.data.transcript)
    } catch (error) {
        console.error("Error sending audio:", error);
    }
};


  const handleUserSpeech = async (text: string) => {
    if (!text.trim()) return;
    const userMessage = { role: "user", content: text };
    setConversation([...conversation, userMessage]);
    
    try {
      const aiResponse = await axios.post("http://localhost:8002/ai-response", { text });
        console.log(aiResponse);
        
      const aiMessage = { role: "ai", content: aiResponse.data.response.content };

      
      setConversation([...conversation, userMessage, aiMessage]);
      speak(aiMessage.content);
    } catch (error) {
      console.error("Error getting AI response:", error);
    }
  };

  const speak = async (text: string) => {
    try {
      const response = await axios.post("http://localhost:8002/speak", { text }, { responseType: "blob" });
      const audioBlob = new Blob([response.data], { type: "audio/mp3" });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      audio.onended = () => setIsListening(true); // Resume listening after AI speaks
    } catch (error) {
      console.error("Error in text-to-speech:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-bold mb-4">AI English Tutor</h1>
      <Card className="w-full max-w-md border border-gray-700 bg-gray-800 shadow-lg">
        <CardContent className="p-4 h-80 overflow-y-auto">
          {conversation.map((msg, index) => (
            <div key={index} className={`mb-2 p-2 rounded-lg ${msg.role === "user" ? "text-right bg-blue-500" : "text-left bg-green-500"}`}>
              <span>{msg.content}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="mt-4 flex gap-2 w-full max-w-md">
        <Button
          variant="contained"
          color={isListening ? "error" : "primary"}
          onClick={() => setIsListening(!isListening)}
          className="w-full"
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </Button>
      </div>
    </div>
  );
}