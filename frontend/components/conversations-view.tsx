'use client';

import { useEffect, useState, FormEvent } from 'react';
import { MessageCircle, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/lib/auth-context';
import { listConversationsRequest, getConversationMessagesRequest, postMessageRequest } from '@/services/conversation.service';
import { Conversation, Message } from '@/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ConversationsView() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);

  function loadConversations() {
    listConversationsRequest()
      .then((res) => setConversations(res.data))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting loading flag before fetching the selected thread
    setIsLoadingThread(true);
    getConversationMessagesRequest(selectedId)
      .then((res) => setMessages(res.data.messages))
      .finally(() => setIsLoadingThread(false));
  }, [selectedId]);

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!selectedId || !draft.trim()) return;
    setIsSending(true);
    try {
      const res = await postMessageRequest(selectedId, draft);
      setMessages((prev) => [...prev, res.data]);
      setDraft('');
      loadConversations();
    } catch {
      toast.error('Unable to send message.');
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) return <LoadingState label="Loading conversations..." />;

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={<MessageCircle className="h-8 w-8" />}
        title="No conversations yet"
        description="Conversations start automatically when you send or receive an enquiry."
      />
    );
  }

  const selected = conversations.find((c) => c.id === selectedId);
  const otherPartyName = (conversation: Conversation) =>
    user?.role === 'LANDLORD'
      ? `${conversation.student?.firstName} ${conversation.student?.lastName}`
      : conversation.landlord?.businessName || `${conversation.landlord?.firstName} ${conversation.landlord?.lastName}`;

  return (
    <div className="grid h-[calc(100vh-10rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card md:grid-cols-[320px_1fr]">
      <div className={cn('overflow-y-auto border-r border-border', selectedId ? 'hidden md:block' : 'block')}>
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => setSelectedId(conversation.id)}
            className={cn(
              'flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition hover:bg-muted',
              selectedId === conversation.id && 'bg-muted'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">{otherPartyName(conversation)}</span>
              <span className="text-xs text-muted-foreground">{formatDateTime(conversation.updatedAt)}</span>
            </div>
            <span className="line-clamp-1 text-xs text-muted-foreground">{conversation.listing?.title}</span>
            {conversation.messages?.[0] && (
              <span className="line-clamp-1 text-sm text-muted-foreground">{conversation.messages[0].content}</span>
            )}
          </button>
        ))}
      </div>

      <div className={cn('flex flex-col', !selectedId ? 'hidden md:flex' : 'flex')}>
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Select a conversation to view messages
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedId(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <p className="font-medium text-foreground">{otherPartyName(selected)}</p>
                <p className="text-xs text-muted-foreground">{selected.listing?.title}</p>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {isLoadingThread ? (
                <LoadingState label="Loading messages..." />
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn('flex', message.senderId === user?.id ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[75%] rounded-2xl px-4 py-2 text-sm',
                        message.senderId === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      <p>{message.content}</p>
                      <p className={cn('mt-1 text-[10px] opacity-70')}>{formatDateTime(message.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." />
              <Button type="submit" disabled={isSending || !draft.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
