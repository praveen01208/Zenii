import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, MoreVertical, X, CheckCheck, MessageCircle, User as UserIcon, Trash2 } from 'lucide-react';
import { apiFetch } from '../api/client';
import { getImgSrc } from '../utils/image';
import { io, Socket } from 'socket.io-client';

export default function TherapistChatView({ therapist }: { therapist: any }) {
  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(therapist.blockedUsers || []);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedChatIds, setSelectedChatIds] = useState<string[]>([]);
  
  const [showOptions, setShowOptions] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [selectedMsg, setSelectedMsg] = useState<any | null>(null);
  const [showClearChatModal, setShowClearChatModal] = useState(false);
  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [toastError, setToastError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = window.innerWidth < 768;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Init socket and fetch chats
  useEffect(() => {
    let s: Socket;
    let isMounted = true;

    const init = async () => {
      try {
        const res = await apiFetch<any>('/chat/therapist-chats');
        if (!isMounted) return;
        setChats(res.chats || []);
        setLoading(false);

        const socketUrl = import.meta.env.VITE_SOCKET_URL ?? (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);
        s = io(socketUrl, { withCredentials: true });
        setSocket(s);

        s.on('connect', () => {
          // Join all active chat rooms to receive messages
          (res.chats || []).forEach((c: any) => {
            s.emit('join-chat', c._id);
          });
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
        setError(err.message || 'Failed to load chats');
        setLoading(false);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (s) s.disconnect();
    };
  }, [therapist._id]);

  // Fetch messages when a chat is selected
  useEffect(() => {
    if (!selectedChat) return;
    
    let isMounted = true;
    const fetchMsgs = async () => {
      try {
        const res = await apiFetch<any>(`/chat/${selectedChat._id}/messages`);
        if (isMounted) setMessages(res.messages || []);
      } catch (e: any) {
        setToastError(e.message || 'Failed to load messages');
        setTimeout(() => setToastError(''), 3000);
      }
    };
    fetchMsgs();
    
    return () => { isMounted = false; };
  }, [selectedChat]);

  const sendMessage = async () => {
    if (!inputText.trim() || !selectedChat) return;
    
    const text = inputText;
    setInputText('');

    try {
      const res = await apiFetch<any>(`/chat/${selectedChat._id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text })
      });

      setMessages(prev => [...prev, res.message]);
      if (socket) {
        socket.emit('send-chat-message', { chatId: selectedChat._id, message: res.message });
      }
    } catch (err: any) {
      setToastError(err.message || 'Failed to send message');
      setTimeout(() => setToastError(''), 3000);
    }
  };

  const deleteMessage = async (msgId: string, type: 'me' | 'everyone') => {
    try {
      await apiFetch<any>(`/chat/messages/${msgId}?type=${type}`, { method: 'DELETE' });
      
      setMessages(prev => {
        if (type === 'everyone') {
          return prev.map(m => m._id === msgId ? { ...m, deletedForEveryone: true } : m);
        } else {
          return prev.filter(m => m._id !== msgId);
        }
      });

      if (socket && selectedChat) {
        socket.emit('delete-chat-message', { chatId: selectedChat._id, messageId: msgId, deletedForEveryone: type === 'everyone' });
      }
      setSelectedMsg(null);
    } catch (err: any) {
      setToastError(err.message || 'Failed to delete message');
      setTimeout(() => setToastError(''), 3000);
    }
  };

  const clearChat = async () => {
    if (!selectedChat) return;
    try {
      await apiFetch(`/chat/${selectedChat._id}/clear`, { method: 'DELETE' });
      setChats(prev => prev.filter(c => c._id !== selectedChat._id));
      setSelectedChat(null);
      setMessages([]);
      setShowOptions(false);
      setShowClearChatModal(false);
    } catch (err: any) {
      setShowClearChatModal(false);
      setToastError(err.message || 'Failed to clear chat');
      setTimeout(() => setToastError(''), 3000);
    }
  };

  const bulkClearChats = async (chatIds: string[]) => {
    if (chatIds.length === 0) return;
    try {
      await Promise.all(chatIds.map(id => apiFetch(`/chat/${id}/clear`, { method: 'DELETE' })));
      setChats(prev => prev.filter(c => !chatIds.includes(c._id)));
      if (selectedChat && chatIds.includes(selectedChat._id)) {
        setSelectedChat(null);
        setMessages([]);
        setShowOptions(false);
      }
      setIsSelectMode(false);
      setSelectedChatIds([]);
      setToastError('Chats deleted successfully.');
      setTimeout(() => setToastError(''), 3000);
    } catch (err: any) {
      setToastError(err.message || 'Failed to clear some chats');
      setTimeout(() => setToastError(''), 3000);
    }
  };

  const blockUser = async () => {
    if (!selectedChat) return;
    try {
      await apiFetch(`/chat/${selectedChat._id}/block`, { method: 'POST' });
      setBlockedUserIds(prev => [...prev, selectedChat.user._id]);
      setToastError('User blocked successfully.');
      setTimeout(() => setToastError(''), 3000);
      setShowOptions(false);
      setShowBlockUserModal(false);
    } catch (err: any) {
      setShowBlockUserModal(false);
      setToastError(err.message || 'Failed to block user');
      setTimeout(() => setToastError(''), 3000);
    }
  };

  const unblockUser = async () => {
    if (!selectedChat) return;
    try {
      await apiFetch(`/chat/${selectedChat._id}/unblock`, { method: 'POST' });
      setBlockedUserIds(prev => prev.filter(id => id !== selectedChat.user._id));
      setToastError('User unblocked successfully.');
      setTimeout(() => setToastError(''), 3000);
      setShowOptions(false);
      setShowBlockUserModal(false);
    } catch (err: any) {
      setShowBlockUserModal(false);
      setToastError(err.message || 'Failed to unblock user');
      setTimeout(() => setToastError(''), 3000);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="p-8 text-center text-[#4a7c5d] font-bold">Loading chats...</div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  const showSidebar = !selectedChat || !isMobile;
  const showChat = !!selectedChat;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-[#f0f2f5] dark:bg-[#050505] rounded-3xl overflow-hidden border border-[#0d5d3a]/10 dark:border-white/5 shadow-sm">
      
      {/* Sidebar - Chat List */}
      <div className={`${showSidebar ? 'block' : 'hidden'} w-full md:w-1/3 bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/5 flex flex-col`}>
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#0a2617] dark:text-white flex items-center gap-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            <MessageCircle size={20} className="text-[#0d5d3a] dark:text-[#10b981]" /> Active Chats
          </h2>
          {chats.length > 0 && (
            <button 
              onClick={() => { setIsSelectMode(!isSelectMode); setSelectedChatIds([]); }} 
              className="text-sm text-[#4a7c5d] hover:text-[#0d5d3a] font-bold transition"
            >
              {isSelectMode ? 'Cancel' : 'Select'}
            </button>
          )}
        </div>
        
        {isSelectMode && chats.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] flex items-center justify-between border-b border-gray-100 dark:border-white/5">
            <button 
              onClick={() => {
                if (selectedChatIds.length === chats.length) {
                  setSelectedChatIds([]);
                } else {
                  setSelectedChatIds(chats.map(c => c._id));
                }
              }} 
              className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition"
            >
              {selectedChatIds.length === chats.length ? 'Deselect All' : 'Select All'}
            </button>
            <button 
              disabled={selectedChatIds.length === 0}
              onClick={() => bulkClearChats(selectedChatIds)}
              className="text-xs font-bold text-red-500 hover:text-red-700 disabled:opacity-50 transition"
            >
              Delete ({selectedChatIds.length})
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm">No active chats yet.</div>
          ) : (
            chats.map(chat => {
              const u = chat.user;
              if (!u) return null;
              const isSelected = selectedChat?._id === chat._id;
              
              return (
                <div 
                  key={chat._id} 
                  onClick={() => {
                    if (isSelectMode) {
                      setSelectedChatIds(prev => prev.includes(chat._id) ? prev.filter(id => id !== chat._id) : [...prev, chat._id]);
                    } else {
                      setSelectedChat(chat);
                    }
                  }}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition border-b border-gray-50 dark:border-white/5 ${isSelected ? 'bg-[#e6f4ea] dark:bg-[#0d5d3a]/20' : 'hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'} group`}
                >
                  {isSelectMode && (
                    <div className="shrink-0 mr-1 flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedChatIds.includes(chat._id)} 
                        onChange={() => {}}
                        className="w-4 h-4 text-[#0d5d3a] rounded border-gray-300 pointer-events-none"
                      />
                    </div>
                  )}
                  <div className="relative shrink-0">
                    {u.avatar?.data ? (
                      <img src={`data:${u.avatar.mime};base64,${u.avatar.data}`} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#0d5d3a]/10 dark:bg-[#1a8a5a]/20 text-[#0d5d3a] dark:text-[#10b981] flex items-center justify-center font-bold text-lg">
                        {u.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#0a2617] dark:text-white truncate">{u.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Tap to {isSelectMode ? 'select' : 'open conversation'}</p>
                  </div>
                  
                  {!isSelectMode && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        bulkClearChats([chat._id]);
                      }}
                      className="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition md:opacity-0 md:group-hover:opacity-100"
                      title="Delete Chat"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {showChat ? (
        <div className="flex-1 flex flex-col min-w-0 bg-[#f7fbf8] dark:bg-[#0a0a0a]">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#0d5d3a]/10 dark:border-white/5 bg-white dark:bg-[#111111]">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 -ml-2 rounded-xl text-[#4a7c5d] hover:bg-gray-100 dark:hover:bg-[#222]">
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowUserInfo(true)}>
                <div className="relative shrink-0">
                  {selectedChat.user.avatar?.data ? (
                    <img src={`data:${selectedChat.user.avatar.mime};base64,${selectedChat.user.avatar.data}`} alt={selectedChat.user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#0d5d3a]/10 dark:bg-[#1a8a5a]/20 text-[#0d5d3a] dark:text-[#10b981] flex items-center justify-center font-bold">
                      {selectedChat.user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#0a2617] dark:text-white text-base">{selectedChat.user.name}</h3>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tap to view details</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="p-2 rounded-xl text-[#4a7c5d] hover:bg-gray-100 dark:hover:bg-[#222] transition">
                <MoreVertical size={20} />
              </button>
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
                  <button onClick={() => { setShowUserInfo(true); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] font-medium transition border-b border-gray-50 dark:border-white/5">
                    User Details
                  </button>
                  <button onClick={() => { setShowClearChatModal(true); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition border-b border-gray-50 dark:border-white/5">
                    Delete Chat
                  </button>
                  <button onClick={() => { setShowBlockUserModal(true); setShowOptions(false); }} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition">
                    {selectedChat && blockedUserIds.includes(selectedChat.user._id) ? 'Unblock User' : 'Block User'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
            {toastError && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-xl shadow-md text-sm font-bold flex items-center gap-2">
                {toastError}
              </div>
            )}
            {messages.length === 0 && (
              <div className="text-center text-gray-500 text-sm mt-10">
                This is the beginning of your chat with {selectedChat.user.name}.
              </div>
            )}
            
            {messages.map((msg, idx) => {
              const isMe = msg.senderModel === 'Therapist';
              
              if (msg.deletedForEveryone) {
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className="bg-gray-200 dark:bg-[#1a1a1a] text-gray-500 dark:text-gray-400 italic rounded-2xl px-4 py-2 text-sm shadow-sm border border-transparent dark:border-white/5">
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
                        ? 'bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-tr-sm' 
                        : 'bg-white dark:bg-[#222] text-[#0a2617] dark:text-gray-100 border border-gray-100 dark:border-white/5 rounded-tl-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${isMe ? 'text-green-100 dark:text-gray-300' : 'text-gray-400'} text-[10px]`}>
                      {formatTime(msg.createdAt)}
                      {isMe && <CheckCheck size={12} className="opacity-80" />}
                    </div>
                  </div>

                  {isSelected && (
                    <div className={`absolute top-full mt-1 z-20 flex gap-2 p-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 ${isMe ? 'right-0' : 'left-0'}`}>
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
                className="flex-1 bg-[#f0f2f5] dark:bg-[#1a1a1a] border border-transparent dark:border-white/5 rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0d5d3a]/20 text-[#0a2617] dark:text-white transition"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white hover:bg-[#0a4a2e] dark:hover:bg-[#10b981] disabled:opacity-50 transition shadow-md shrink-0"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f7fbf8] dark:bg-[#0a0a0a] border-l border-[#0d5d3a]/10 dark:border-white/5">
          <div className="w-20 h-20 rounded-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 flex items-center justify-center shadow-sm mb-4">
            <MessageCircle size={32} className="text-[#0d5d3a]/50 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Select a chat</h3>
          <p className="text-sm text-gray-500 mt-2">Choose a conversation from the sidebar to start messaging.</p>
        </div>
      )}

      {/* User Info Modal */}
      <AnimatePresence>
        {showUserInfo && selectedChat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowUserInfo(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-[#0d5d3a]/10 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowUserInfo(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center mb-6">
                {selectedChat.user.avatar?.data ? (
                  <img src={`data:${selectedChat.user.avatar.mime};base64,${selectedChat.user.avatar.data}`} alt={selectedChat.user.name} className="w-24 h-24 rounded-full object-cover border-4 border-[#e6f4ea] dark:border-white/10 shadow-sm mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#0d5d3a]/10 dark:bg-[#1a8a5a]/20 text-[#0d5d3a] dark:text-[#10b981] flex items-center justify-center font-bold text-3xl border-4 border-[#e6f4ea] dark:border-white/10 shadow-sm mb-4">
                    {selectedChat.user.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-xl font-black text-[#0a2617] dark:text-white">{selectedChat.user.name}</h3>
              </div>

              <div className="space-y-3 border-t border-gray-100 dark:border-white/5 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Age</span>
                  <span className="font-bold text-[#0a2617] dark:text-white">{selectedChat.user.age}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Gender</span>
                  <span className="font-bold text-[#0a2617] dark:text-white capitalize">{selectedChat.user.gender}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Phone</span>
                  <span className="font-bold text-[#0a2617] dark:text-white">{selectedChat.user.phone}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Chat Confirmation Modal */}
      <AnimatePresence>
        {showClearChatModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearChatModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </div>
                <h3 className="text-lg font-black text-[#0a2617] dark:text-white">Delete Chat</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Are you sure you want to delete this chat? This removes the user from your list. If they message again, the chat will reappear.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowClearChatModal(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
                <button onClick={clearChat} className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition shadow-md">Delete Chat</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block User Confirmation Modal */}
      <AnimatePresence>
        {showBlockUserModal && selectedChat && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowBlockUserModal(false)}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="bg-white dark:bg-[#111111] rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-white/10" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className={`w-14 h-14 rounded-full ${blockedUserIds.includes(selectedChat.user._id) ? 'bg-green-100 dark:bg-green-500/10' : 'bg-red-100 dark:bg-red-500/10'} flex items-center justify-center`}>
                  <UserIcon className={`w-7 h-7 ${blockedUserIds.includes(selectedChat.user._id) ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <h3 className="text-lg font-black text-[#0a2617] dark:text-white">{blockedUserIds.includes(selectedChat.user._id) ? 'Unblock User' : 'Block User'}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {blockedUserIds.includes(selectedChat.user._id) 
                    ? `Are you sure you want to unblock ${selectedChat.user.name}? They will be able to message you again.`
                    : `Are you sure you want to block ${selectedChat.user.name}? They will no longer be able to message you.`}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowBlockUserModal(false)} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">Cancel</button>
                <button onClick={blockedUserIds.includes(selectedChat.user._id) ? unblockUser : blockUser} className={`flex-1 py-3 rounded-2xl text-white text-sm font-bold transition shadow-md ${blockedUserIds.includes(selectedChat.user._id) ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  {blockedUserIds.includes(selectedChat.user._id) ? 'Unblock' : 'Block'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
