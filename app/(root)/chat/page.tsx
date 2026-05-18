'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import { useRouter } from 'next/navigation';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { getSocket } from '@/components/chat/socket';
import { useDispatch } from 'react-redux';
import {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
} from '@/lib/redux/slices/chatSlice';

export default function ChatPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state: RootState) => state.auth);
  const { currentConversationId } = useSelector((state: RootState) => state.chat);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted status on client load
  useEffect(() => {
    queueMicrotask(() => {
      setIsMounted(true);
    });
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (isMounted && (!accessToken || !user)) {
      router.push('/login');
    }
  }, [accessToken, user, router, isMounted]);

  // Initialize socket and listen for online users
  useEffect(() => {
    if (!isMounted || !accessToken || !user) return;

    const socket = getSocket(accessToken);

    if (socket) {
      socket.on('online_users', (users) => {
        dispatch(setOnlineUsers(users));
      });

      socket.on('user_online', (userData) => {
        dispatch(addOnlineUser(userData));
      });

      socket.on('user_offline', (userData) => {
        dispatch(removeOnlineUser(userData.userId));
      });
    }

    return () => {
      if (socket) {
        socket.off('online_users');
        socket.off('user_online');
        socket.off('user_offline');
      }
    };
  }, [accessToken, user, dispatch, isMounted]);

  if (!isMounted || !accessToken || !user) {
    return null;
  }

  const conversationId = selectedConversation || currentConversationId;

  return (
    <div className="h-screen flex overflow-hidden">
      <ChatSidebar 
        userId={user._id || user.id} 
        onSelectConversation={setSelectedConversation}
      />
      
      <div className="flex-1 flex flex-col">
        {conversationId ? (
          <ChatWindow
            conversationId={conversationId}
            token={accessToken}
            currentUserId={user._id || user.id}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg">Select a conversation</p>
              <p className="text-sm">or start a new chat</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}