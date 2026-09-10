import React, { useState, useEffect, useRef } from 'react';
import { TraceResult } from '../types';
import Markdown from 'react-markdown';
import { 
  Bot, 
  User, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Trash2, 
  Sparkles, 
  Shield, 
  Building2, 
  CornerDownLeft,
  ChevronUp
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AiChatBoxProps {
  traceResult: TraceResult | null;
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export const AiChatBox: React.FC<AiChatBoxProps> = ({
  traceResult,
  isOpen,
  onClose,
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation with welcoming forensic intelligence prompt
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          role: 'assistant',
          content: `**CryptoTrace Forensic AI Assistant** is ready.\n\nI am synced with active case \`${traceResult?.suspectAddress || 'No wallet loaded'}\`. You can ask me to:\n- Explain the laundering typology & peel chain mechanics\n- Break down transaction volumes, fees, and timestamps\n- Formulate freeze orders under **Section 94, BNSS 2023**\n- Identify KYC/AML subpoena questions for the recipient exchange`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Handle external prompt injection from summary card
  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt.trim());
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          traceResult,
          history: messages.slice(-8).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'No response from assistant');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `*Forensic Engine connection error.* Unable to contact intelligence service. Please check your network or try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `cleared-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. Analyzing case \`${traceResult?.suspectAddress?.slice(0, 12)}...\`. How can I assist your investigation?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div
      id="ai-chat-drawer"
      className={`fixed z-50 transition-all duration-300 shadow-2xl flex flex-col bg-white border border-slate-300 rounded-2xl overflow-hidden ${
        isExpanded 
          ? 'inset-4 md:inset-10 max-w-5xl mx-auto' 
          : 'bottom-4 right-4 w-[92vw] sm:w-[450px] h-[580px] max-h-[85vh]'
      }`}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="text-xs font-bold text-white tracking-wide">CryptoTrace AI Forensic Assistant</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="truncate max-w-[140px]">
                {traceResult?.suspectAddress ? `${traceResult.suspectAddress.slice(0, 8)}...` : 'Ready'}
              </span>
              {traceResult?.targetVasp && (
                <>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                    <Building2 className="w-2.5 h-2.5" />
                    {traceResult.targetVasp.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Window controls */}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-md hover:bg-slate-800 transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Case Context Strip */}
      {traceResult && (
        <div className="bg-slate-100/90 border-b border-slate-200 px-4 py-1.5 flex items-center justify-between text-[10px] text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <Shield className="w-3 h-3 text-blue-600 shrink-0" />
            <span className="font-medium text-slate-800">
              {traceResult.found 
                ? `${traceResult.totalHops} hops mapped to ${traceResult.targetVasp?.name}`
                : 'No centralized VASP detected in current breadth'
              }
            </span>
          </div>
          <span className="text-slate-400 hidden sm:inline">BNSS 2023 §94 Mode</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs shadow-2xs ${
                isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-800 text-blue-300 border border-slate-700'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-2xs ${
                isUser
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
              }`}>
                {isUser ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                ) : (
                  <div className="prose prose-xs max-w-none text-slate-800 prose-headings:text-slate-900 prose-headings:font-bold prose-h4:text-xs prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1 prose-code:py-0.2 prose-code:rounded prose-code:text-[11px]">
                    <Markdown>{m.content}</Markdown>
                  </div>
                )}
                <div className={`text-[9px] mt-1 text-right ${isUser ? 'text-blue-200' : 'text-slate-400'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-blue-300 flex items-center justify-center shrink-0 text-xs shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 shadow-2xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-slate-500 font-medium pl-1">Analyzing blockchain topology...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <span className="text-slate-400 font-semibold uppercase text-[9px] shrink-0">Prompts:</span>
        <button
          type="button"
          onClick={() => handleSendMessage("How does the peel chain obfuscate funds here?")}
          className="whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shrink-0 transition-colors"
        >
          Explain peel chain
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage("Draft the statutory Section 94 notice requisition points.")}
          className="whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shrink-0 transition-colors"
        >
          Draft Section 94 points
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage("What KYC records should we request from the exchange?")}
          className="whitespace-nowrap bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shrink-0 transition-colors"
        >
          KYC Subpoena Checklist
        </button>
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }} 
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              id="ai-chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this trace, hops, hashes, or BNSS Section 94..."
              className="w-full resize-none max-h-24 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button
            id="ai-chat-send-btn"
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 px-1">
          <span>Press Enter to send, Shift+Enter for newline</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
            Gemini Forensic AI
          </span>
        </div>
      </div>
    </div>
  );
};
