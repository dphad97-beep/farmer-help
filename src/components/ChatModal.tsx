import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Phone, MessageSquare, User as UserIcon } from 'lucide-react';
import { User, ChatMessage } from '../types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  recipientName: string;
  currentUser: User;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  listingId,
  recipientName,
  currentUser,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !listingId) return;
    fetch(`/api/messages/${listingId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch((err) => console.warn(err));
  }, [isOpen, listingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: inputText.trim(),
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInputText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    'Can we arrange pickup this Friday morning?',
    'What is the moisture level and bag size?',
    'Will you accept full digital NEFT payment upon weighing?',
    'Can we close the deal at current benchmark rate?',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/70 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg h-[80vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 to-green-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-300 font-bold text-xs">
              💬
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {recipientName}
              </h3>
              <p className="text-[11px] text-emerald-100">Direct Trade Negotiation</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/60">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              No messages yet in this trade discussion. Send a greeting or trade inquiry below!
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderId === currentUser.id;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <span className="text-[10px] text-stone-400 mb-0.5 px-1 font-medium">
                    {m.senderName} ({m.senderRole})
                  </span>
                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-emerald-700 text-white rounded-tr-xs'
                        : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[9px] text-stone-400 mt-0.5 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Negotiate Chips */}
        <div className="px-3 py-1.5 bg-stone-100 border-t border-stone-200 overflow-x-auto flex items-center gap-1 shrink-0">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInputText(prompt)}
              className="text-[10px] bg-white text-stone-600 hover:text-emerald-800 border border-stone-200 px-2 py-0.5 rounded-full whitespace-nowrap"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message or delivery term..."
            className="flex-1 text-xs sm:text-sm p-2.5 rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="p-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
