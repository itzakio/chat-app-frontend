import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface OnlineUser {
  userId: string;
  name: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  readBy: { userId: string; readAt: string }[];
}

export interface Conversation {
  _id: string;
  participants: {
    userId: string;
    name: string;
    email: string;
  }[];
  lastMessage?: string;
  lastMessageAt?: string;
}

interface ChatState {
  onlineUsers: OnlineUser[];
  currentConversationId: string | null;
  typingUsers: string[];
  conversations: Conversation[];
  messages: Record<string, Message[]>; // conversationId -> messages[]
}

const initialState: ChatState = {
  onlineUsers: [],
  currentConversationId: null,
  typingUsers: [],
  conversations: [],
  messages: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Online users
    setOnlineUsers: (state, action: PayloadAction<OnlineUser[]>) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action: PayloadAction<OnlineUser>) => {
      if (!state.onlineUsers.some(u => u.userId === action.payload.userId)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(u => u.userId !== action.payload);
    },
    
    // Current conversation
    setCurrentConversation: (state, action: PayloadAction<string | null>) => {
      state.currentConversationId = action.payload;
    },
    
    // Conversations
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    addConversation: (state, action: PayloadAction<Conversation>) => {
      const exists = state.conversations.some(c => c._id === action.payload._id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    },
    updateConversationLastMessage: (state, action: PayloadAction<{ conversationId: string; message: string; timestamp: string }>) => {
      const conversation = state.conversations.find(c => c._id === action.payload.conversationId);
      if (conversation) {
        conversation.lastMessage = action.payload.message;
        conversation.lastMessageAt = action.payload.timestamp;
      }
    },
    
    // Messages
    setMessages: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);
    },
    
    // Typing indicators
    addTypingUser: (state, action: PayloadAction<string>) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action: PayloadAction<string>) => {
      state.typingUsers = state.typingUsers.filter(name => name !== action.payload);
    },
    clearTypingUsers: (state) => {
      state.typingUsers = [];
    },
  },
});

export const {
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setCurrentConversation,
  setConversations,
  addConversation,
  updateConversationLastMessage,
  setMessages,
  addMessage,
  addTypingUser,
  removeTypingUser,
  clearTypingUsers,
} = chatSlice.actions;

export default chatSlice.reducer;