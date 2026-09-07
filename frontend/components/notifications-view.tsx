'use client';

import { useEffect, useState } from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingState } from '@/components/loading-state';
import { EmptyState } from '@/components/empty-state';
import { listNotificationsRequest, markNotificationReadRequest, markAllNotificationsReadRequest } from '@/services/notification.service';
import { Notification } from '@/types';
import { formatDateTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export function NotificationsView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listNotificationsRequest()
      .then((res) => setNotifications(res.data))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    markNotificationReadRequest(id).catch(() => undefined);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await markAllNotificationsReadRequest();
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Unable to update notifications.');
    }
  }

  if (isLoading) return <LoadingState />;

  if (notifications.length === 0) {
    return <EmptyState icon={<Bell className="h-8 w-8" />} title="No notifications" description="You're all caught up." />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck className="mr-1 h-4 w-4" /> Mark all as read
        </Button>
      </div>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={cn('cursor-pointer transition', !notification.isRead && 'border-primary/40 bg-primary/5')}
            onClick={() => !notification.isRead && handleMarkRead(notification.id)}
          >
            <CardContent className="flex items-start justify-between gap-4 pt-4">
              <div>
                <p className="font-medium text-foreground">{notification.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(notification.createdAt)}</p>
              </div>
              {!notification.isRead && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
