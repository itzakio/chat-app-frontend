'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import {
  useGetMessagesQuery,
} from '@/lib/redux/services/chatApi';
import {
  setMessages,
  addMessage,
  addTypingUser,
  removeTypingUser,
  Message,
} from '@/lib/redux/slices/chatSlice';
import { getSocket } from './socket';

interface Props {
  conversationId: string;
  token: string;
  currentUserId: string;
}

interface UserTypingData {
  userId: string;
  isTyping: boolean;
  name: string;
}

export default function ChatWindow({ conversationId, token, currentUserId }: Props) {
  const dispatch = useDispatch();
  const { data: fetchedMessages, isLoading: messagesLoading } = useGetMessagesQuery(conversationId);
  const { messages, typingUsers } = useSelector((state: RootState) => state.chat);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get current conversation messages
  const currentMessages = useMemo(() => messages[conversationId] || [], [messages, conversationId]);

  // Initialize socket
  useEffect(() => {
    const newSocket = getSocket(token);

    if (newSocket) {
      newSocket.emit('join_conversation', conversationId);

      // Listen for new messages
      newSocket.on('new_message', (message: Message) => {
        if (message.conversationId === conversationId) {
          dispatch(addMessage(message));
        }
      });

      // Listen for typing indicators
      newSocket.on('user_typing', (data: UserTypingData) => {
        if (data.userId !== currentUserId) {
          if (data.isTyping) {
            dispatch(addTypingUser(data.name));
          } else {
            dispatch(removeTypingUser(data.name));
          }
        }
      });
    }

    return () => {
      if (newSocket) {
        newSocket.emit('leave_conversation', conversationId);
        newSocket.off('new_message');
        newSocket.off('user_typing');
      }
    };
  }, [conversationId, token, currentUserId, dispatch]);

  // Store messages in Redux when fetched
  useEffect(() => {
    if (fetchedMessages) {
      dispatch(setMessages({ conversationId, messages: fetchedMessages }));
    }
  }, [fetchedMessages, conversationId, dispatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const currentSocket = getSocket(token);
    if (!inputMessage.trim() || !currentSocket) return;

    currentSocket.emit('send_message', {
      conversationId,
      content: inputMessage,
      type: 'text',
    });

    setInputMessage('');
    handleStopTyping();
  };

  const handleTyping = () => {
    const currentSocket = getSocket(token);
    if (!currentSocket || !conversationId) return;
    
    currentSocket.emit('typing_start', { conversationId, isTyping: true });
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    const currentSocket = getSocket(token);
    if (!currentSocket || !conversationId) return;
    currentSocket.emit('typing_stop', { conversationId });
  };

  if (messagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          currentMessages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg ${
                  message.senderId === currentUserId
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 shadow-sm'
                }`}
              >
                {message.senderId !== currentUserId && (
                  <div className="text-xs font-medium mb-1 text-gray-500">
                    {message.senderName}
                  </div>
                )}
                <div className="wrap-break-word">{message.content}</div>
                <div className={`text-xs mt-1 ${message.senderId === currentUserId ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm text-gray-500 italic">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyUp={handleTyping}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="px-6 py-2 bg-blue-500 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}