import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
  AlertTriangle,
  Send,
  HelpCircle,
  Leaf,
  Bot,
  User as UserIcon,
  CheckCircle,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  image?: string;
  isAiGenerated?: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        language === 'mr'
          ? 'नमस्कार शेतकरी बंधूंनो! मी आपला कृषी मित्र AI आहे. आपल्या पिकावरील रोग, कीड, खत व्यवस्थापन, बाजारभाव किंवा सेंद्रिय उपायांविषयी काहीही विचारा. आपण फोटो देखील अपलोड करू शकता.'
          : language === 'hi'
          ? 'नमस्ते किसान भाइयों! मैं आपका कृषि मित्र AI हूँ। फसल रोग, कीट प्रबंधन, खाद, सिंचाई या बाजार भाव के संबंध में कोई भी सवाल पूछें या फोटो अपलोड करें।'
          : 'Welcome to Krishi Mitra AI Doctor! Ask me any question regarding crop diseases, pest remedies, irrigation, or fertilizer management. You can also upload a leaf/crop photo for instant visual diagnosis.',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = true;
      recog.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recog.onresult = (e: any) => {
        let transcript = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
        }
        if (transcript) {
          setInputQuery(transcript);
        }
      };

      recog.onerror = (e: any) => {
        console.warn('Speech recog error:', e.error);
        setIsListening(false);
        if (e.error !== 'no-speech') {
          setSpeechError(`Voice error: ${e.error}. Please type manually.`);
        }
      };

      recog.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recog;
    }
  }, [language]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please type.');
      return;
    }
    setSpeechError('');

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn(err);
        setIsListening(false);
      }
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText !== undefined ? queryText : inputQuery;
    if (!textToSend.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      image: selectedImage || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    const curImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          language,
          imageBase64: curImage || undefined,
        }),
      });

      const data = await res.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'Apologies, could not process request.',
        isAiGenerated: data.isAiGenerated,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'mr'
              ? 'क्षमस्व, नेटवर्क त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
              : language === 'hi'
              ? 'क्षमा करें, नेटवर्क त्रुटि हुई। कृपया पुनः प्रयास करें।'
              : 'Network error communicating with AI server. Please retry.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-To-Speech for accessibility
  const handleReadAloud = (text: string) => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown asterisks and hashtags for audio
    const plainText = text.replace(/[*#_~`]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.lang = language === 'mr' ? 'mr-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/70 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-2xl h-[92vh] sm:h-[86vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-gradient-to-r from-emerald-800 via-green-800 to-teal-800 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base leading-tight">
                {t.aiAssistantTitle}
              </h2>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Powered by Gemini 2.5 Flash</span>
                <span className="text-emerald-300">• Trilingual</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Safety Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            {t.safetyWarning}
          </p>
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 max-w-[88%] ${
                m.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {m.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-1.5">
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-xs'
                      : 'bg-white text-stone-900 border border-stone-200 shadow-xs rounded-tl-xs'
                  }`}
                >
                  {m.image && (
                    <img
                      src={m.image}
                      alt="Crop symptom"
                      className="w-48 h-36 object-cover rounded-xl mb-2.5 border border-white/20"
                    />
                  )}
                  {m.text}
                </div>

                {/* Read aloud button for assistant responses */}
                {m.sender === 'assistant' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReadAloud(m.text)}
                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 bg-white border border-stone-200 px-2 py-0.5 rounded-md shadow-xs transition-colors"
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 text-red-600" />
                          <span>{t.stopSpeaking}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{t.speakAnswer}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2.5 max-w-[80%] mr-auto">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 text-xs text-stone-500">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-150"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce delay-300"></span>
                <span>Krishi Mitra is analyzing symptoms...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="px-3 py-2 bg-stone-100/70 border-t border-stone-200 overflow-x-auto flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-stone-500 shrink-0">Try:</span>
          {t.suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(q)}
              className="text-[11px] bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Selected image preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-emerald-50/50 border-t border-stone-200 flex items-center gap-3 shrink-0">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-12 h-12 rounded-lg object-cover border border-emerald-300"
            />
            <div className="flex-1 text-xs text-stone-600">
              <p className="font-bold text-stone-900">Crop symptom image attached</p>
              <p className="text-[11px] text-stone-500">Will be analyzed for disease diagnosis</p>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-stone-400 hover:text-red-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Voice Error notice */}
        {speechError && (
          <div className="px-4 py-1 bg-amber-50 text-[11px] text-amber-800 text-center">
            {speechError}
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Hidden file input for photo upload */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Photo upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
              title={t.uploadCropPhoto}
            >
              <Camera className="w-5 h-5 text-emerald-700" />
            </button>

            {/* Microphone button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse border-red-600'
                  : 'border-stone-200 hover:bg-stone-50 text-emerald-700'
              }`}
              title={isListening ? t.stopListening : t.speakQuestion}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isListening ? t.listening : t.askPlaceholder}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isLoading || (!inputQuery.trim() && !selectedImage)}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
              title="Send"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
