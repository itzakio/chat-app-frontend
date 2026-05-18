'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';
import {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useSearchUsersMutation,
  SearchedUser,
} from '@/lib/redux/services/chatApi';
import {
  setConversations,
  setCurrentConversation,
  Conversation,
} from '@/lib/redux/slices/chatSlice';

interface Props {
  userId: string;
  onSelectConversation: (conversationId: string) => void;
}

export default function ChatSidebar({ userId, onSelectConversation }: Props) {
  const dispatch = useDispatch();
  const { data: fetchedConversations, isLoading } = useGetConversationsQuery();
  const [createConversation] = useCreateConversationMutation();
  const [searchUsers] = useSearchUsersMutation();
  
  const { onlineUsers, currentConversationId, conversations } = useSelector(
    (state: RootState) => state.chat
  );
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  // Store conversations in Redux when fetched
  useEffect(() => {
    if (fetchedConversations) {
      dispatch(setConversations(fetchedConversations));
    }
  }, [fetchedConversations, dispatch]);

  const getOtherUser = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.userId !== userId);
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.some(u => u.userId === userId);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const result = await searchUsers(query).unwrap();
      setSearchResults(result);
    } else {
      setSearchResults([]);
    }
  };

  const handleStartChat = async (participantId: string) => {
    const conversation = await createConversation(participantId).unwrap();
    if (conversation) {
      dispatch(setCurrentConversation(conversation._id));
      onSelectConversation(conversation._id);
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 h-full border-r flex items-center justify-center">
        <div className="text-gray-50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full border-r flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Messages</h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-3 py-1 bg-blue-500 rounded-lg text-sm hover:bg-blue-600"
          >
            New Chat
          </button>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="mt-3">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {searchResults.length > 0 && (
              <div className="mt-2 border rounded-lg overflow-hidden">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleStartChat(user._id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2 rounded-md transition"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Online Users */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium mb-2">
          Online ({onlineUsers.length})
        </h3>
        <div className="space-y-2">
          {onlineUsers.slice(0, 5).map((user) => (
            <div key={user.userId} className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{user.name}</span>
            </div>
          ))}
          {onlineUsers.length > 5 && (
            <div className="text-xs">
              +{onlineUsers.length - 5} more
            </div>
          )}
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center  text-sm">
            No conversations yet. Start a new chat!
          </div>
        ) : (
          conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            if (!otherUser) return null;
            
            const isOnline = isUserOnline(otherUser.userId);
            
            return (
              <div
                key={conversation._id}
                onClick={() => {
                  dispatch(setCurrentConversation(conversation._id));
                  onSelectConversation(conversation._id);
                }}
                className={`p-4 cursor-pointer transition ${
                  currentConversationId === conversation._id ? 'bg-black/10 dark:bg-white/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-medium">
                      {otherUser.name.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{otherUser.name}</div>
                    <div className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}