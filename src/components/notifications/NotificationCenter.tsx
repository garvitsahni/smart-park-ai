import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Info, AlertTriangle, CheckCircle, AlertOctagon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, NotificationType } from '@/context/NotificationContext';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-4 h-4 text-blue-400" />,
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  alert: <AlertOctagon className="w-4 h-4 text-rose-400" />,
};

const typeBgColors: Record<NotificationType, string> = {
  info: 'bg-blue-500/10 border-blue-500/20',
  success: 'bg-emerald-500/10 border-emerald-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  alert: 'bg-rose-500/10 border-rose-500/20',
};

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in-gentle">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 md:w-96 max-h-[70vh] bg-card border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-scale-in-gentle">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold">Notifications</h3>
                <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    Read All
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <button
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full text-left p-4 border-b border-border/30 transition-colors hover:bg-secondary/30 ${
                      !notif.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg border ${typeBgColors[notif.type]} shrink-0 mt-0.5`}>
                        {notif.icon ? (
                          <span className="text-sm">{notif.icon}</span>
                        ) : (
                          typeIcons[notif.type]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{notif.title}</span>
                          {!notif.read && (
                            <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {new Date(notif.timestamp).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border/50">
                <Button variant="ghost" size="sm" onClick={clearAll} className="w-full text-xs text-muted-foreground gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
