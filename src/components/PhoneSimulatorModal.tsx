import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Signal,
  Battery,
  Wifi,
  HelpCircle,
  FileText,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { PhoneCallSession } from '../utils/telephonyEngine';

interface PhoneSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated?: () => void;
}

export const PhoneSimulatorModal: React.FC<PhoneSimulatorModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const [callActive, setCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [callerNumber, setCallerNumber] = useState('+91 94220 54321');
  const [session, setSession] = useState<PhoneCallSession | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [spokenInput, setSpokenInput] = useState('');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const timerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Web Audio Context for authentic DTMF keypad tones
  const playDtmfTone = (digit: string) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      const DTMF_FREQS: Record<string, [number, number]> = {
        '1': [697, 1209], '2': [697, 1336], '3': [697, 1477],
        '4': [770, 1209], '5': [770, 1336], '6': [770, 1477],
        '7': [852, 1209], '8': [852, 1336], '9': [852, 1477],
        '*': [941, 1209], '0': [941, 1336], '#': [941, 1477],
      };

      const freqs = DTMF_FREQS[digit] || [700, 1200];
      osc1.frequency.value = freqs[0];
      osc2.frequency.value = freqs[1];

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.18);
      osc2.stop(ctx.currentTime + 0.18);
    } catch (e) {
      // AudioContext not allowed or unsupported
    }
  };

  // Text-to-speech for IVR prompt playback
  const speakIvrPrompt = (text: string, lang: string) => {
    if (!isAudioEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const plain = text.replace(/[*#_~`]/g, '');
    const utter = new SpeechSynthesisUtterance(plain);
    utter.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };

  // Setup Web Speech recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;

      recog.onresult = (e: any) => {
        let text = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        if (text) setSpokenInput(text);
      };

      recog.onend = () => setIsListeningMic(false);
      recog.onerror = () => setIsListeningMic(false);
      recognitionRef.current = recog;
    }
  }, []);

  // Call timer interval
  useEffect(() => {
    if (callActive) {
      timerRef.current = setInterval(() => {
        setCallTimer((t) => t + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      setCallTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [callActive]);

  // Scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.history]);

  if (!isOpen) return null;

  const startCall = async () => {
    setCallActive(true);
    setCallTimer(0);

    try {
      const res = await fetch('/api/telephony/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerNumber,
          language: 'mr',
        }),
      });

      const data = await res.json();
      setSession(data.session);
      setCurrentPrompt(data.responsePrompt);
      speakIvrPrompt(data.responsePrompt, data.session?.language || 'mr');
    } catch (err) {
      console.error('Call start error:', err);
    }
  };

  const endCall = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setCallActive(false);
    if (session) {
      session.currentState = 'CALL_ENDED';
    }
  };

  const sendKeypadDigit = async (digit: string) => {
    playDtmfTone(digit);
    if (!callActive || !session) return;

    try {
      const res = await fetch('/api/telephony/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: session.callId,
          input: digit,
          inputType: 'dtmf',
        }),
      });

      const data = await res.json();
      setSession(data.session);
      setCurrentPrompt(data.responsePrompt);
      speakIvrPrompt(data.responsePrompt, data.session?.language || 'mr');

      if (data.hangup) {
        setTimeout(() => {
          endCall();
          if (onListingCreated) onListingCreated();
        }, 3000);
      }
    } catch (err) {
      console.error('DTMF error:', err);
    }
  };

  const sendSpeechInput = async (spokenText: string) => {
    if (!callActive || !session || !spokenText.trim()) return;

    try {
      const res = await fetch('/api/telephony/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callId: session.callId,
          input: spokenText.trim(),
          inputType: 'speech',
        }),
      });

      const data = await res.json();
      setSession(data.session);
      setCurrentPrompt(data.responsePrompt);
      setSpokenInput('');
      speakIvrPrompt(data.responsePrompt, data.session?.language || 'mr');

      if (data.hangup) {
        setTimeout(() => {
          endCall();
          if (onListingCreated) onListingCreated();
        }, 3000);
      }
    } catch (err) {
      console.error('Speech IVR error:', err);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListeningMic) {
      recognitionRef.current.stop();
      setIsListeningMic(false);
    } else {
      try {
        if (session) {
          recognitionRef.current.lang =
            session.language === 'mr' ? 'mr-IN' : session.language === 'hi' ? 'hi-IN' : 'en-IN';
        }
        recognitionRef.current.start();
        setIsListeningMic(true);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-stone-950 text-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-800 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Indian Feature-Phone Device Shell */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center bg-stone-900/90 border-b md:border-b-0 md:border-r border-stone-800 w-full md:w-[380px] shrink-0">
          {/* Keypad Phone Body */}
          <div className="w-[300px] bg-gradient-to-b from-stone-800 via-stone-850 to-stone-900 rounded-[38px] p-4 border-4 border-stone-700 shadow-2xl relative flex flex-col items-center">
            {/* Earpiece Grill */}
            <div className="w-14 h-1.5 bg-stone-950 rounded-full mb-3 flex items-center justify-center gap-1">
              <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
              <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
              <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
            </div>

            {/* Retro 2.4-inch LCD Screen */}
            <div className="w-full bg-[#183324] text-[#7bf3a4] rounded-2xl p-3 border-2 border-stone-950 shadow-inner flex flex-col h-[220px] font-mono text-xs select-none">
              {/* Status Bar */}
              <div className="flex items-center justify-between pb-1 border-b border-[#2d583e] text-[10px] text-[#55b877]">
                <span className="flex items-center gap-1">
                  <Signal className="w-3 h-3 text-[#7bf3a4]" /> KisanNet 4G
                </span>
                <span className="flex items-center gap-1">
                  {callActive ? formatTimer(callTimer) : '12:45 PM'}
                  <Battery className="w-3 h-3 text-[#7bf3a4]" />
                </span>
              </div>

              {/* Screen Body */}
              <div className="flex-1 overflow-y-auto py-2 space-y-1.5 scrollbar-none text-[11px] leading-tight">
                {!callActive ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-1">
                    <p className="font-bold text-[#b4fcd1]">KrishiConnect Helpline</p>
                    <p className="text-[10px] text-[#55b877]">Toll-Free 1800-180-1551</p>
                    <p className="text-[10px] text-[#3d8356] mt-1">Press Green Key to Call</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-[#55b877]">
                      <span className="bg-[#2d583e] text-[#b4fcd1] px-1.5 py-0.2 rounded font-bold">
                        CALL IN PROGRESS
                      </span>
                      <span>{session?.language?.toUpperCase()}</span>
                    </div>

                    <div className="text-[11px] text-[#e0ffe9] whitespace-pre-wrap font-sans">
                      {currentPrompt || 'Connecting to IVR...'}
                    </div>

                    {session?.collectedData?.ticketId && (
                      <div className="bg-[#0b1f14] p-1.5 rounded border border-[#3d8356] text-[10px]">
                        Ref: {session.collectedData.ticketId}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Softkeys */}
              <div className="pt-1 border-t border-[#2d583e] flex items-center justify-between text-[9px] text-[#55b877]">
                <span>{callActive ? 'Options' : 'Menu'}</span>
                <span>{callActive ? 'Back' : 'Contacts'}</span>
              </div>
            </div>

            {/* D-Pad & Action Keys */}
            <div className="w-full mt-3 grid grid-cols-3 gap-2">
              <button
                onClick={startCall}
                disabled={callActive}
                className="h-10 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center shadow-md active:scale-95 transition-all text-xs"
                title="Dial Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <div className="h-10 bg-stone-800 rounded-xl border border-stone-700 flex items-center justify-center text-stone-400 font-bold text-xs shadow-inner">
                OK
              </div>

              <button
                onClick={endCall}
                disabled={!callActive}
                className="h-10 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white rounded-xl font-bold flex items-center justify-center shadow-md active:scale-95 transition-all text-xs"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>

            {/* Keypad Grid (1-9, *, 0, #) */}
            <div className="w-full mt-2.5 grid grid-cols-3 gap-2">
              {[
                { key: '1', sub: '.,' },
                { key: '2', sub: 'ABC' },
                { key: '3', sub: 'DEF' },
                { key: '4', sub: 'GHI' },
                { key: '5', sub: 'JKL' },
                { key: '6', sub: 'MNO' },
                { key: '7', sub: 'PQRS' },
                { key: '8', sub: 'TUV' },
                { key: '9', sub: 'WXYZ' },
                { key: '*', sub: 'Repeat' },
                { key: '0', sub: 'Space' },
                { key: '#', sub: 'Enter' },
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => sendKeypadDigit(btn.key)}
                  className="h-9 bg-stone-800 hover:bg-stone-700 active:bg-emerald-800 text-stone-100 rounded-xl border border-stone-700 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-transform"
                >
                  <span className="font-bold text-sm leading-none">{btn.key}</span>
                  <span className="text-[8px] text-stone-400 leading-none">{btn.sub}</span>
                </button>
              ))}
            </div>

            {/* Microphone hole */}
            <div className="w-1.5 h-1.5 bg-stone-950 rounded-full mt-3"></div>
          </div>
        </div>

        {/* Right Side: Demo Helper & Live Speech Interaction */}
        <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Feature 13: Non-Smartphone Access
                  </span>
                  <span className="text-xs text-stone-400">Interactive IVR Simulator</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-1">
                  KrishiConnect AI Telephone Helpline
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                  className={`p-2 rounded-xl border transition-colors ${
                    isAudioEnabled
                      ? 'border-emerald-700 bg-emerald-950 text-emerald-400'
                      : 'border-stone-700 text-stone-500'
                  }`}
                  title={isAudioEnabled ? 'Mute Voice Audio' : 'Unmute Voice Audio'}
                >
                  {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Caller Number Setting */}
            <div className="mt-3 flex items-center justify-between text-xs bg-stone-900/60 p-2.5 rounded-xl border border-stone-800">
              <span className="text-stone-400">Simulated Farmer Phone Number:</span>
              <input
                type="text"
                value={callerNumber}
                onChange={(e) => setCallerNumber(e.target.value)}
                className="bg-stone-950 border border-stone-700 text-white font-mono px-2 py-1 rounded text-xs w-40 text-right"
              />
            </div>

            {/* Spoken Response Input (Mic or Typed Speech) */}
            <div className="mt-3 bg-stone-900/80 p-3 rounded-2xl border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-300 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" /> Speak / Type Voice Answer to IVR:
                </span>
                <span className="text-[11px] text-stone-500">Press keypad or speak words</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={toggleMic}
                  className={`p-2 rounded-xl border transition-all ${
                    isListeningMic
                      ? 'bg-red-600 border-red-500 text-white animate-pulse'
                      : 'border-stone-700 bg-stone-800 text-stone-300 hover:text-white'
                  }`}
                  title={isListeningMic ? 'Stop Listening' : 'Speak via Microphone'}
                >
                  {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={spokenInput}
                  onChange={(e) => setSpokenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendSpeechInput(spokenInput);
                  }}
                  placeholder={
                    isListeningMic
                      ? 'Listening to farmer voice... speak now'
                      : 'e.g. "Dattatray Phadke" or "कांदा" or "30 quintal"'
                  }
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:ring-1 focus:ring-emerald-500"
                />

                <button
                  onClick={() => sendSpeechInput(spokenInput)}
                  disabled={!spokenInput.trim()}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold"
                >
                  Send Spoken Input
                </button>
              </div>
            </div>

            {/* Quick Demo Script Shortcuts */}
            <div className="mt-3 space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                Quick 1-Click Telephone Test Scenarios:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  onClick={async () => {
                    await startCall();
                    setTimeout(() => sendKeypadDigit('1'), 1500); // Marathi
                    setTimeout(() => sendKeypadDigit('4'), 3500); // Crop Registration
                  }}
                  className="text-left p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-emerald-600/50 transition-colors"
                >
                  <p className="font-bold text-emerald-400">🌾 1. Marathi Crop Registration</p>
                  <p className="text-[10px] text-stone-400">Registers harvest lot using phone keypad &amp; voice.</p>
                </button>

                <button
                  onClick={async () => {
                    await startCall();
                    setTimeout(() => sendKeypadDigit('1'), 1500); // Marathi
                    setTimeout(() => sendKeypadDigit('1'), 3500); // AI Advice
                  }}
                  className="text-left p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-emerald-600/50 transition-colors"
                >
                  <p className="font-bold text-emerald-400">🤖 2. Voice AI Agronomy Consultation</p>
                  <p className="text-[10px] text-stone-400">Ask pest/crop symptoms &amp; receive spoken advisory.</p>
                </button>

                <button
                  onClick={async () => {
                    await startCall();
                    setTimeout(() => sendKeypadDigit('1'), 1500); // Marathi
                    setTimeout(() => sendKeypadDigit('5'), 3500); // Expert Callback
                  }}
                  className="text-left p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-emerald-600/50 transition-colors"
                >
                  <p className="font-bold text-emerald-400">👨‍🔬 3. KVK Human Expert Callback</p>
                  <p className="text-[10px] text-stone-400">Logs support ticket &amp; issues voice reference token.</p>
                </button>

                <button
                  onClick={async () => {
                    await startCall();
                    setTimeout(() => sendKeypadDigit('1'), 1500);
                    setTimeout(() => sendKeypadDigit('3'), 3500); // Mandi Bhav
                  }}
                  className="text-left p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-emerald-600/50 transition-colors"
                >
                  <p className="font-bold text-emerald-400">📈 4. Spoken Mandi Bhav Check</p>
                  <p className="text-[10px] text-stone-400">Listens to APMC market rates over audio.</p>
                </button>
              </div>
            </div>
          </div>

          {/* Call History / Transcript Log */}
          <div className="bg-stone-900/50 p-3 rounded-2xl border border-stone-800 max-h-44 overflow-y-auto space-y-2 text-xs">
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
              Live Call Audit &amp; Transcript Log:
            </p>
            {session?.history?.map((h, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-[11px] leading-relaxed ${
                  h.speaker === 'ivr'
                    ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-900/40'
                    : 'bg-stone-800 text-stone-200 text-right ml-6'
                }`}
              >
                <span className="text-[9px] text-stone-400 block font-bold mb-0.5">
                  {h.speaker === 'ivr' ? '📞 IVR SYSTEM' : '👤 CALLER INPUT'}
                </span>
                {h.text}
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
