import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User as UserIcon, Sparkles } from 'lucide-react';
import { getScanChat, sendChatMessage, ChatMessage } from '../../api/chat.js';
import toast from 'react-hot-toast';

interface ScanChatPanelProps {
  scanId: string;
}

const SUGGESTED_QUESTIONS = [
  'Can I apply organic spray if rain is expected in 24 hours?',
  'Is this infection seed-borne or spread by wind/insects?',
  'What cultural sanitation steps prevent recurrence next season?',
  'How do I sanitize pruning shears after trimming infected leaves?',
];

export const ScanChatPanel: React.FC<ScanChatPanelProps> = ({ scanId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    getScanChat(scanId)
      .then((res) => {
        setMessages(res.messages || []);
      })
      .catch(() => {
        // silent fail on initial chat history
      })
      .finally(() => {
        setIsFetching(false);
      });
  }, [scanId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: textToSend,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const res = await sendChatMessage(scanId, textToSend);
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, res.reply]);
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl bg-cream-50 border border-soil-600/15 overflow-hidden warm-shadow">
      {/* Header */}
      <div className="px-4 py-3 bg-cream-100 border-b border-soil-600/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-leaf-700 text-cream-50 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif text-sm font-semibold text-soil-900 leading-tight">
              Agronomy Advisory Chat
            </h4>
            <p className="text-[11px] text-soil-500">
              Grounded exclusively in this scan's visual diagnosis
            </p>
          </div>
        </div>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-cream-200 text-soil-700">
          Gemini Grounded
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && !isFetching && (
          <div className="p-4 rounded-xl bg-cream-100/60 border border-soil-600/10 text-center space-y-2 my-auto">
            <Sparkles className="w-5 h-5 text-wheat-500 mx-auto" />
            <h5 className="font-serif text-xs font-semibold text-soil-800">
              Ask specific agronomic questions about this diagnosis
            </h5>
            <p className="text-[11px] text-soil-600">
              Ask about weather impact, organic spray timing, spread mechanics, or safety intervals.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-soil-900 text-cream-50'
                  : 'bg-leaf-700 text-cream-50'
              }`}
            >
              {msg.role === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-soil-950 text-cream-50 rounded-tr-none'
                  : 'bg-cream-100 text-soil-900 border border-soil-600/10 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 mr-auto text-xs text-soil-500 bg-cream-100 px-3 py-2 rounded-xl rounded-tl-none border border-soil-600/10">
            <div className="w-3.5 h-3.5 border-2 border-leaf-700 border-t-transparent rounded-full animate-spin" />
            <span>Consulting agronomy pathology context…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips */}
      {messages.length < 3 && (
        <div className="px-3 py-2 bg-cream-100/70 border-t border-soil-600/10 flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <span className="text-soil-500 whitespace-nowrap font-serif text-[10px] uppercase tracking-wider">
            Suggested:
          </span>
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-full bg-cream-50 hover:bg-cream-200 text-soil-700 whitespace-nowrap border border-soil-600/10 transition-colors cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-cream-100 border-t border-soil-600/15 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this diagnosis…"
          maxLength={1000}
          disabled={isLoading}
          className="flex-1 bg-cream-50 border border-soil-600/20 focus:border-leaf-600 rounded-xl px-3.5 py-2 text-xs text-soil-900 placeholder:text-soil-400 focus:outline-none focus:ring-1 focus:ring-leaf-600"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-leaf-700 hover:bg-leaf-800 disabled:opacity-40 text-cream-50 transition-colors btn-press cursor-pointer shadow-xs"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
