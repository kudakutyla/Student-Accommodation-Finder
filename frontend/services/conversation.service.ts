import { apiRequest } from '@/lib/api-client';
import { ApiSuccess, Conversation, Message } from '@/types';

export function listConversationsRequest() {
  return apiRequest<ApiSuccess<Conversation[]>>('/conversations');
}

export function getConversationMessagesRequest(id: string) {
  return apiRequest<ApiSuccess<{ conversation: Conversation; messages: Message[] }>>(
    `/conversations/${id}/messages`
  );
}

export function postMessageRequest(id: string, content: string) {
  return apiRequest<ApiSuccess<Message>>(`/conversations/${id}/messages`, {
    method: 'POST',
    body: { content },
  });
}
