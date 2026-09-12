import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, ArrowLeft, Trash2, Check, CheckCheck, User, Info, MoreVertical, X } from 'lucide-react';
import { apiFetch } from '../api/client';
import { getImgSrc } from '../utils/image';
import { io, Socket } from 'socket.io-client';

export default function UserChat({ therapist, onBack, me }: { therapist: any; onBack: () => void; me: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [chatId, setChatId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  const [showOptions, setShowOptions] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  const [showClearChatModal, setShowClearChatModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Init socket and fetch messages
  useEffect(() => {
    let s: Socket;
    let currentChatId: string | null = null;
    let isMounted = true;

    const initChat = async () => {
      try {
        const res = await apiFetch<any>(`/chat/user/${therapist._id}`);
        if (!isMounted) return;
        currentChatId = res.chat._id;
        setChatId(res.chat._id);

        const msgRes = await apiFetch<any>(`/chat/${res.chat._id}/messages`);
        if (!isMounted) return;
        setMessages(msgRes.messages || []);
        setLoading(false);

        // Init socket for real-time messaging only (no status tracking)
        const socketUrl = import.meta.env.VITE_SOCKET_URL ?? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : undefined);
        s = io(socketUrl, { withCredentials: true });
        setSocket(s);

        s.on('connect', () => {
          s.emit('join-chat', currentChatId);
        });

        s.on('receive-chat-message', (msg) => {
          setMessages(prev => [...prev, msg]);
        });

        s.on('chat-message-deleted', (data) => {
          setMessages(prev => {
            if (data.deletedForEveryone) {
              return prev.map(m => m._id === data.messageId ? { ...m, deletedForEveryone: true } : m);
            }
            return prev;
          });
        });

      } catch (err: any) {
        if (!isMounted) return;
        setError(err.message || 'Failed to load chat');
        setLoading(false);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (s) s.disconnect();
    };
  }, [therapist._id, me.id]);

  const sendMessage = async () => {
    if (!inputText.trim() || !chatId) return;
    
    const text = inputText;
    setInputText('');

    try {
      const res = await apiFetch<any>(`/chat/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text })
      });

      setMessages(prev => [...prev, res.message]);
      if (socket) {
        socket.emit('send-chat-message', { chatId, message: res.message });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteMessage = async (msgId: string, type: 'me' | 'everyone') => {
    try {
      const res = await apiFetch<any>(`/chat/messages/${msgId}?type=${type}`, { method: 'DELETE' });
      
      setMessages(prev => {
        if (type === 'everyone') {
          return prev.map(m => m._id === msgId ? { ...m, deletedForEveryone: true } : m);
        } else {
          return prev.filter(m => m._id !== msgId);
        }
      });

      if (socket) {
        socket.emit('delete-chat-message', { chatId, messageId: msgId, deletedForEveryone: type === 'everyone' });
      }
      setSelectedMsg(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete message');
      setTimeout(() => setError(''), 3000);
    }
  };

  const clearChat = async () => {
    if (!chatId) return;
    try {
      await apiFetch(`/chat/${chatId}/clear`, { method: 'DELETE' });
      setMessages([]);
      setShowOptions(false);
      setShowClearChatModal(false);
    } catch (err: any) {
      setShowClearChatModal(false);
      setError(err.message || 'Failed to clear chat');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-8 text-center text-[#4a7c5d] font-bold h-full flex items-center justify-center">Loading chat...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col h-full w-full bg-[#fbfdfb] dark:bg-[#050505]">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#0d5d3a]/10 dark:border-white/5 bg-white dark:bg-[#111111] shadow-sm z-10 sticky top-0 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl text-[#4a7c5d] hover:bg-[#0d5d3a]/5 dark:text-gray-400 dark:hover:bg-white/5 transition">
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            {therapist.profilePicture ? (
              <img src={getImgSrc(therapist.profilePicture)} alt={therapist.name} className="w-10 h-10 rounded-full object-cover border-2 border-[#e6f4ea] dark:border-[#0d5d3a]/30" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-lg font-bold border-2 border-[#e6f4ea] dark:border-[#0d5d3a]/30">
                {therapist.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="font-bold text-[#0a2617] dark:text-white text-base leading-tight">{therapist.name}</h2>
            <div className="text-xs text-gray-500 dark:text-gray-400">{therapist.specialization}</div>
          </div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-xl text-[#4a7c5d] hover:bg-[#0d5d3a]/5 dark:text-gray-400 dark:hover:bg-white/5 transition">
            <MoreVertical size={20} />
          </button>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
              <button onClick={() => { setShowClearChatModal(true); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition">
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5] dark:bg-[#0a0a0a] relative">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl shadow-md text-sm font-bold flex items-center gap-2">
            {error}
          </div>
        )}
        
        {messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm mt-10">
            Start a conversation with {therapist.name}. Your messages are private and secure.
          </div>
        )}
        
        {messages.map((msg, idx) => {
          const isMe = msg.senderModel === 'User';
          
          if (msg.deletedForEveryone) {
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 italic rounded-2xl px-4 py-2 text-sm shadow-sm">
                  This message was deleted
                </div>
              </div>
            );
          }

          const isSelected = selectedMsg?._id === msg._id;

          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative group`}>
              <div 
                onClick={() => setSelectedMsg(isSelected ? null : msg)}
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm cursor-pointer transition-transform ${isSelected ? 'scale-95' : ''} ${
                  isMe 
                    ? 'bg-[#0d5d3a] text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-[#1a1a1a] text-[#0a2617] dark:text-gray-100 border border-gray-100 dark:border-white/5 rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-green-100' : 'text-gray-400'} text-[10px]`}>
                  {formatTime(msg.createdAt)}
                  {isMe && <CheckCheck size={12} className="opacity-80" />}
                </div>
              </div>

              {isSelected && (
                <div className={`absolute top-full mt-1 z-20 flex gap-2 p-2 bg-white dark:bg-[#222222] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 ${isMe ? 'right-0' : 'left-0'}`}>
                  <button onClick={() => deleteMessage(msg._id, 'me')} className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg transition">
                    Delete for me
                  </button>
                  {isMe && (
                    <button onClick={() => deleteMessage(msg._id, 'everyone')} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition whitespace-nowrap">
                      Delete for everyone
                    </button>
                  )}
                  <button onClick={() => setSelectedMsg(null)} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg transition">
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-[#111111] border-t border-[#0d5d3a]/10 dark:border-white/5 pb-6">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#f0f2f5] dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 dark:focus:ring-[#10b981]/30 text-[#0a2617] dark:text-white transition"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0d5d3a] dark:bg-[#10b981] text-white hover:opacity-90 disabled:opacity-50 transition shadow-md shrink-0"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>

      {/* Clear Chat Confirmation Modal */}
      {showClearChatModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowClearChatModal(false)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-black text-[#0a2617] dark:text-white">Clear Chat</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to clear this chat? This only clears it for you and cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowClearChatModal(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
              <button onClick={clearChat} className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shadow-md">Clear Chat</button>
            </div>
          </motion.div>
        </motion.div>
      )}

    </motion.div>
  );
}
