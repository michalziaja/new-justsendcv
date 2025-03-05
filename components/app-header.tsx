//components/app-header.tsx

"use client";

import { ThemeToggle } from "@/components/mode-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { createClerkSupabaseClient } from "@/utils/supabaseClient";
import { memo, useEffect, useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { 
  Badge 
} from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Typ dla powiadomienia
interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

const NotificationBell = () => {
  const { session } = useSession();
  const { user } = useUser();
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const initSupabase = async () => {
      if (!session || !user) return;
      
      try {
        const client = await createClerkSupabaseClient(session);
        setSupabaseClient(client);

        // Pobierz wszystkie powiadomienia (odczytane i nieodczytane)
        const { data, error } = await client
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3); // Pobierz tylko 3 ostatnie powiadomienia
          
        if (data && !error) {
          setNotifications(data);
          // Policz tylko nieodczytane powiadomienia
          const unread = data.filter(n => !n.read).length;
          setUnreadCount(unread);
        }

        // Konfiguracja kanału realtime
        const channel = client.channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            (payload: { new: Notification }) => {
              console.log('Nowe powiadomienie:', {
                id: payload.new.id,
                typ: payload.new.type,
                wiadomość: payload.new.message,
                data: new Date(payload.new.created_at).toLocaleString(),
                przeczytane: payload.new.read,
                user_id: payload.new.user_id
              });
              
              // Dodaj nowe powiadomienie na początku listy i zachowaj limit 3
              setNotifications(prev => {
                const newNotifications = [payload.new, ...prev].slice(0, 3);
                return newNotifications;
              });
              
              // Zaktualizuj licznik nieodczytanych
              if (!payload.new.read) {
                setUnreadCount(prev => prev + 1);
              }
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Błąd inicjalizacji Supabase:", error);
      }
    };

    initSupabase();
  }, [session, user]);

  const markAsRead = async (id: string) => {
    if (!supabaseClient || !id) return;

    const { error } = await supabaseClient
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (!supabaseClient || !user) return;

    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    const { error } = await supabaseClient
      .from('notifications')
      .update({ read: true })
      .in('id', unreadIds);

    if (!error) {
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    }
  };

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-120 overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Powiadomienia</h3>
          {unreadCount > 0 && (
            <button 
              onClick={markAllAsRead} 
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">Brak powiadomień</div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={cn(
                  "p-4 border-b last:border-b-0 cursor-pointer transition-colors",
                  "hover:bg-accent/50",
                  !notification.read && "bg-accent/30 border-l-4 border-l-blue-500"
                )}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <div className={cn(
                    "font-medium",
                    !notification.read && "text-blue-600"
                  )}>
                    {notification.type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString('pl-PL', {
                      hour: '2-digit',
                      minute: '2-digit',
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </div>
                </div>
                <div className={cn(
                  "text-sm mt-1",
                  !notification.read && "font-medium"
                )}>
                  {notification.message}
                </div>
                {!notification.read && (
                  <div className="mt-2 text-xs text-blue-500">
                    Kliknij, aby oznaczyć jako przeczytane
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

interface HeaderProps {
  pageName: string;
}

export const Header = memo(function Header({ pageName }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">JustSend.cv</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
      <ThemeToggle />
      </div>
    </header>
  );
}); 

export default Header;