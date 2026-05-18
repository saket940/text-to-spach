import React, { useEffect, useRef, useState } from "react";

export default function AdvancedTTS() {

  const [text, setText] = useState(
    "Hello! This is an advanced React text to speech generator."
  );

  const [voices, setVoices] = useState([]);

  const [selectedVoice, setSelectedVoice] = useState(0);

  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const [status, setStatus] = useState("Idle");

  const [isGenerating, setIsGenerating] = useState(false);

  const [audioUrl, setAudioUrl] = useState("");

  const mediaRecorderRef = useRef(null);

  const audioChunksRef = useRef([]);

  const MAX_WORDS = 500;
  const MAX_CHARS = 3000;

  // LOAD VOICES

  useEffect(() => {

    const loadVoices = () => {

      const allVoices = speechSynthesis.getVoices();

      setVoices(allVoices);

    };

    loadVoices();

    speechSynthesis.onvoiceschanged = loadVoices;

  }, []);

  // WORD COUNT

  const wordCount =
    text.trim() === ""
      ? 0
      : text.trim().split(/\s+/).length;

  const charCount = text.length;

  // TEXT CHANGE

  const handleTextChange = (e) => {

    let value = e.target.value;

    // CHARACTER LIMIT

    if (value.length > MAX_CHARS) {

      value = value.substring(0, MAX_CHARS);

    }

    // WORD LIMIT

    const words = value.trim().split(/\s+/);

    if (words.length > MAX_WORDS) {

      value = words.slice(0, MAX_WORDS).join(" ");

    }

    setText(value);

  };

  // CREATE SPEECH

  const createUtterance = () => {

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.voice =
      voices[selectedVoice];

    utterance.rate = speed;

    utterance.pitch = pitch;

    utterance.volume = volume;

    return utterance;

  };

  // SPEAK

  const speakText = () => {

    if (!text.trim()) return;

    speechSynthesis.cancel();

    const utterance = createUtterance();

    setIsGenerating(true);

    setStatus("Generating Voice...");

    utterance.onend = () => {

      setIsGenerating(false);

      setStatus("Completed");

    };

    speechSynthesis.speak(utterance);

  };

  // PAUSE

  const pauseSpeech = () => {

    speechSynthesis.pause();

    setStatus("Paused");

  };

  // STOP

  const stopSpeech = () => {

    speechSynthesis.cancel();

    setIsGenerating(false);

    setStatus("Stopped");

  };

  // DOWNLOAD AUDIO

  const downloadAudio = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          audio: true,
          video: true,
        });

      const mediaRecorder =
        new MediaRecorder(stream);

      mediaRecorderRef.current =
        mediaRecorder;

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable =
        (event) => {

          audioChunksRef.current.push(event.data);

        };

      mediaRecorder.onstop = () => {

        const audioBlob =
          new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

        const url =
          URL.createObjectURL(audioBlob);

        setAudioUrl(url);

        const a =
          document.createElement("a");

        a.href = url;

        a.download = "tts-audio.webm";

        a.click();

      };

      mediaRecorder.start();

      const utterance =
        createUtterance();

      setIsGenerating(true);

      setStatus("Generating & Recording...");

      utterance.onend = () => {

        mediaRecorder.stop();

        setIsGenerating(false);

        setStatus("Download Complete");

      };

      speechSynthesis.speak(utterance);

    } catch (error) {

      alert(
        "Recording failed: " +
        error.message
      );

      setIsGenerating(false);

      setStatus("Failed");

    }

  };

  return (

    <div className="min-h-screen bg-slate-900 text-white p-5">

      <div className="max-w-5xl mx-auto bg-slate-800 p-6 rounded-3xl shadow-2xl">

        <h1 className="text-4xl font-bold text-center mb-6">
          🎤 Advanced React TTS Generator
        </h1>

        {/* TEXTAREA */}

        <textarea
          value={text}
          onChange={handleTextChange}
          className="w-full h-52 p-4 rounded-2xl bg-slate-700 outline-none resize-none text-lg"
        />

        {/* COUNTS */}

        <div className="flex justify-between flex-wrap gap-2 mt-3 text-slate-300">

          <p>
            Words: {wordCount} / {MAX_WORDS}
          </p>

          <p>
            Characters: {charCount} / {MAX_CHARS}
          </p>

        </div>

        {/* CONTROLS */}

        <div className="grid md:grid-cols-2 gap-5 mt-6">

          {/* VOICE */}

          <div className="bg-slate-700 p-4 rounded-2xl">

            <label className="font-bold block mb-2">
              Select Voice
            </label>

            <select
              value={selectedVoice}
              onChange={(e) =>
                setSelectedVoice(e.target.value)
              }
              className="w-full p-3 rounded-xl bg-slate-800"
            >

              {voices.map((voice, index) => (

                <option
                  key={index}
                  value={index}
                >
                  {voice.name} ({voice.lang})
                </option>

              ))}

            </select>

          </div>

          {/* SPEED */}

          <div className="bg-slate-700 p-4 rounded-2xl">

            <label className="font-bold block mb-2">
              Speed: {speed}
            </label>

            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) =>
                setSpeed(parseFloat(e.target.value))
              }
              className="w-full"
            />

          </div>

          {/* PITCH */}

          <div className="bg-slate-700 p-4 rounded-2xl">

            <label className="font-bold block mb-2">
              Pitch: {pitch}
            </label>

            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) =>
                setPitch(parseFloat(e.target.value))
              }
              className="w-full"
            />

          </div>

          {/* VOLUME */}

          <div className="bg-slate-700 p-4 rounded-2xl">

            <label className="font-bold block mb-2">
              Volume: {volume}
            </label>

            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) =>
                setVolume(parseFloat(e.target.value))
              }
              className="w-full"
            />

          </div>

        </div>

        {/* BUTTONS */}

        <div className="flex flex-wrap gap-4 mt-8">

          <button
            onClick={speakText}
            className="bg-green-500 hover:scale-105 transition px-6 py-3 rounded-2xl font-bold"
          >
            ▶ Speak
          </button>

          <button
            onClick={pauseSpeech}
            className="bg-yellow-400 text-black hover:scale-105 transition px-6 py-3 rounded-2xl font-bold"
          >
            ⏸ Pause
          </button>

          <button
            onClick={stopSpeech}
            className="bg-red-500 hover:scale-105 transition px-6 py-3 rounded-2xl font-bold"
          >
            ⏹ Stop
          </button>

          <button
            onClick={downloadAudio}
            className="bg-blue-500 hover:scale-105 transition px-6 py-3 rounded-2xl font-bold"
          >
            ⬇ Download
          </button>

        </div>

        {/* GENERATING EFFECT */}

        <div className="bg-slate-700 rounded-3xl p-6 mt-8">

          <h2 className="text-2xl font-bold text-center mb-5">
            🎵 Voice Generating Effect
          </h2>

          <div className="flex justify-center items-end gap-2 h-28">

            {[...Array(10)].map((_, index) => (

              <div
                key={index}
                className={`w-3 rounded-full bg-cyan-400
                ${
                  isGenerating
                    ? "animate-bounce h-20"
                    : "h-6"
                }`}
                style={{
                  animationDelay:
                    `${index * 0.1}s`,
                }}
              />

            ))}

          </div>

          <p className="text-center mt-5 text-cyan-400 text-xl font-bold">
            {status}
          </p>

        </div>

        {/* AUDIO */}

        {audioUrl && (

          <audio
            controls
            src={audioUrl}
            className="w-full mt-6"
          />

        )}

      </div>

    </div>

  );

}
