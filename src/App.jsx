import React, { useState, useEffect } from 'react';

const TextToSpeechDashboard = () => {
  const [text, setText] = useState('Hello! Adjust the configurations below to see how my voice dynamically adapts.');
  const [voices, setVoices] = useState([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [volume, setVolume] = useState(1.0);
  const [rate, setRate] = useState(1.1);
  const [pitch, setPitch] = useState(1.0);
  const [status, setStatus] = useState('Idle');
  const [isPaused, setIsPaused] = useState(false);
  
  // New States for Word Limit Control
  const [wordLimit, setWordLimit] = useState(20); 
  const [actualWordCount, setActualWordCount] = useState(0);

  // Dynamically calculate the word count of the current text string
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setActualWordCount(words.length);
  }, [text]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      if (availableVoices.length > 0 && !selectedVoiceName) {
        const defaultVoice = availableVoices.find(v => v.lang.startsWith('en')) || availableVoices[0];
        setSelectedVoiceName(defaultVoice.name);
      }
    };

    updateVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [selectedVoiceName]);

  // Play Execution Logic Pipeline with Word Limiter
  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    // 1. Process the text array to enforce word limit constraints
    const wordsArray = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    // Slice array up to the specified limit and join back into a sentence string
    const processedText = wordsArray.slice(0, wordLimit).join(' ');

    if (!processedText) return;

    const utterance = new SpeechSynthesisUtterance(processedText);

    // Bind custom ranges state
    utterance.volume = volume;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Find and map matching voice profile
    const targetVoice = voices.find(v => v.name === selectedVoiceName);
    if (targetVoice) {
      utterance.voice = targetVoice;
      utterance.lang = targetVoice.lang;
    }

    utterance.onstart = () => {
      setStatus(`Speaking (Limited to ${wordLimit} words)...`);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setStatus('Finished');
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      setStatus(`Error encountered (${e.error})`);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePauseResume = () => {
    if (!window.speechSynthesis) return;

    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setStatus('Paused');
      setIsPaused(true);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus('Speaking...');
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setStatus('Stopped / Queue Cleared');
    setIsPaused(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc] flex items-center justify-center p-5">
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-8 w-full max-w-xl shadow-2xl">
        
        <h1 className="text-3xl font-bold mb-6 text-center text-[#38bdf8] border-b-2 border-[#334155] pb-4">
          Web TTS Customizer
        </h1>

        {/* Text Input Block */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-[#94a3b8]">Text to Speak</label>
            <span className="text-xs font-mono text-[#94a3b8]">
              Total Words: <span className={actualWordCount > wordLimit ? "text-yellow-500 font-bold" : "text-[#38bdf8]"}>{actualWordCount}</span>
            </span>
          </div>
          <textarea
            className="w-full h-24 bg-[#0f172a] border border-[#334155] rounded-md text-[#f8fafc] p-3 box-border resize-y text-base outline-none focus:border-[#38bdf8]"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Word Limit Slider block */}
        <div className="mb-5 p-3 bg-[#0f172a]/50 rounded-lg border border-[#334155]/60">
          <label className="block text-sm font-semibold text-[#94a3b8] mb-2">Word Limit Cap</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              className="flex-1 accent-yellow-500 cursor-pointer"
              value={wordLimit}
              onChange={(e) => setWordLimit(parseInt(e.target.value))}
            />
            <span className="min-w-[45px] text-right font-mono text-yellow-500 font-bold">{wordLimit} words</span>
          </div>
        </div>

        {/* Voice Select Element */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#94a3b8] mb-2">
            Select Engine Voice
          </label>
          <select
            className="w-full bg-[#0f172a] border border-[#334155] rounded-md text-[#f8fafc] p-3 text-sm cursor-pointer outline-none focus:border-[#38bdf8]"
            value={selectedVoiceName}
            onChange={(e) => setSelectedVoiceName(e.target.value)}
          >
            {voices.length === 0 ? (
              <option>Loading engine profiles...</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang}) {voice.localService ? '[Local]' : '[Cloud]'}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Volume Settings Slider */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#94a3b8] mb-2">Volume (0 to 1)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="flex-1 accent-[#38bdf8] cursor-pointer"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
            <span className="min-w-[35px] text-right font-mono text-[#38bdf8]">{volume.toFixed(1)}</span>
          </div>
        </div>

        {/* Rate / Speed Settings Slider */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#94a3b8] mb-2">Rate / Speed (0.1 to 3)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              className="flex-1 accent-[#38bdf8] cursor-pointer"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
            />
            <span className="min-w-[35px] text-right font-mono text-[#38bdf8]">{rate.toFixed(1)}</span>
          </div>
        </div>

        {/* Pitch Settings Slider */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#94a3b8] mb-2">Pitch (0 to 2)</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              className="flex-1 accent-[#38bdf8] cursor-pointer"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
            />
            <span className="min-w-[35px] text-right font-mono text-[#38bdf8]">{pitch.toFixed(1)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <button
            onClick={handleSpeak}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold p-3 rounded-md transition-all active:scale-[0.98]"
          >
            Speak
          </button>
          <button
            onClick={handlePauseResume}
            className="bg-[#eab308] hover:bg-[#ca8a04] text-white font-bold p-3 rounded-md transition-all active:scale-[0.98]"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button
            onClick={handleStop}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-bold p-3 rounded-md transition-all active:scale-[0.98]"
          >
            Stop
          </button>
        </div>

        {/* Status Window */}
        <div className="mt-5 text-sm text-center text-[#94a3b8] italic">
          Status: {status}
        </div>

      </div>
    </div>
  );
};

export default TextToSpeechDashboard;
