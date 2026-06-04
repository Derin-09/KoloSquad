"use client";

import { Bell, AlertTriangle, Trophy, Target, Users, Check } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  type: "streak" | "achievement" | "contribution" | "squad" | "milestone";
  title: string;
  message: string;
  timestamp: string;
  icon: React.ReactNode;
  bgColor: string;
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    type: "streak",
    title: "Your streak is at risk!",
    message:
      "Contribute to maintain your 12-day hot streak in the 'Vacation Squad'.",
    timestamp: "2m ago",
    icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    read: false,
  },
  {
    id: "2",
    type: "achievement",
    title: "You moved to #1 on the leaderboard!",
    message:
      "Great job! Your consistent contributions have pushed you to the top of the 'Investment Titans' squad.",
    timestamp: "1h ago",
    icon: <Trophy className="w-5 h-5 text-yellow-500" />,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    read: true,
  },
  {
    id: "3",
    type: "contribution",
    title: "Contribution due tomorrow",
    message:
      'Your scheduled $50 contribution for "Dream Home Fund" is approaching. Ensure your balance is ready.',
    timestamp: "5h ago",
    icon: <Target className="w-5 h-5 text-blue-500" />,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    read: true,
  },
  {
    id: "4",
    type: "milestone",
    title: "Squad reached 70% of goal",
    message:
      "Exciting! Your squad 'Dream Home Fund' is making progress. Only $300 left to reach the final goal.",
    timestamp: "Yesterday",
    icon: <Check className="w-5 h-5 text-green-500" />,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    read: true,
  },
  {
    id: "5",
    type: "squad",
    title: "New member joined your squad",
    message:
      "A new member has joined your squad. See their profile and welcome them!",
    timestamp: "2 days ago",
    icon: <Users className="w-5 h-5 text-purple-500" />,
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    read: true,
  },
];

export default function ActivityPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>(
    notifications
  );
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications =
    filter === "unread"
      ? allNotifications.filter((n) => !n.read)
      : allNotifications;

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setAllNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Activity</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === "all"
                ? "bg-foreground text-background"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all relative ${
              filter === "unread"
                ? "bg-foreground text-background"
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="ml-auto px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground font-medium">
              {filter === "unread"
                ? "No unread notifications"
                : "No notifications yet"}
            </p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification, idx) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleMarkAsRead(notification.id)}
              className={`${notification.bgColor} border border-border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                !notification.read ? "border-accent/50" : ""
              }`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">{notification.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm md:text-base">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
