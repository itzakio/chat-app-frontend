import { baseApi } from './baseApi';
import { Conversation, Message } from '../slices/chatSlice';

export interface SearchedUser {
  _id: string;
  name: string;
  email: string;
}

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations
    getConversations: builder.query<Conversation[], void>({
      query: () => '/chat/conversations',
      transformResponse: (response: { success: boolean; conversations: Conversation[] }) => response.conversations,
      providesTags: ['Conversations'],
    }),
    
    // Get messages for a conversation
    getMessages: builder.query<Message[], string>({
      query: (conversationId) => `/chat/messages/${conversationId}`,
      transformResponse: (response: { success: boolean; messages: Message[] }) => response.messages,
      providesTags: (result, error, id) => [{ type: 'Messages', id }],
    }),
    
    // Create new conversation
    createConversation: builder.mutation<Conversation, string>({
      query: (participantId) => ({
        url: '/chat/conversation',
        method: 'POST',
        body: { participantId },
      }),
      transformResponse: (response: { success: boolean; conversation: Conversation }) => response.conversation,
      invalidatesTags: ['Conversations'],
    }),
    
    // Search users
    searchUsers: builder.mutation<SearchedUser[], string>({
      query: (query) => `/chat/users/search?q=${query}`,
      transformResponse: (response: { success: boolean; users: SearchedUser[] }) => response.users,
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetMessagesQuery,
  useCreateConversationMutation,
  useSearchUsersMutation,
} = chatApi;