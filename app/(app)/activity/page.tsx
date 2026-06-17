"use client";

import { AlertTriangle, Trophy, Target, Check, Users, Home, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

interface StatCard {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
}

interface Notification {
  id: string;
  type: "streak" | "achievement" | "contribution" | "squad" | "milestone";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  button?: {
    label: string;
    action: string;
  };
  read: boolean;
}

const stats: StatCard[] = [
  {
    label: "12 Days",
    value: "ACTIVE STREAK",
    subtitle: "Keep it up!",
    icon: <Zap className="w-6 h-6 text-orange-500" />,
  },
  {
    label: "Rank #1",
    value: "TOP CONTRIBUTOR",
    subtitle: "Investment Titans",
    icon: <Trophy className="w-6 h-6 text-yellow-500" />,
  },
  {
    label: "$1,240",
    value: "SAVED TOGETHER",
    subtitle: "With your squads",
    icon: <Home className="w-6 h-6 text-green-500" />,
  },
];

const notifications: Notification[] = [
  {
    id: "1",
    type: "streak",
    title: "🔥 Your streak is at risk!",
    description:
      "Contribute to maintain your 12-day hot streak in the 'Vacation Squad'.",
    timestamp: "2m ago",
    icon: <AlertTriangle className="w-5 h-5" />,
    borderColor: "border-l-4 border-l-red-500",
    bgColor: "bg-red-50/50 dark:bg-red-950/20",
    button: { label: "Save Now", action: "contribute" },
    read: false,
  },
  {
    id: "2",
    type: "achievement",
    title: "🏆 You moved to #1 on the leaderboard!",
    description:
      "Great job! Your consistent contributions have pushed you to the top of the 'Investment Titans' squad.",
    timestamp: "1h ago",
    icon: <Trophy className="w-5 h-5" />,
    borderColor: "border-l-4 border-l-yellow-500",
    bgColor: "bg-yellow-50/50 dark:bg-yellow-950/20",
    button: { label: "View Rank", action: "leaderboard" },
    read: true,
  },
  {
    id: "3",
    type: "contribution",
    title: "⏰ Contribution due tomorrow",
    description:
      'Your scheduled $50 contribution for "Dream Home Fund" is approaching. Ensure your balance is ready.',
    timestamp: "5h ago",
    icon: <Target className="w-5 h-5" />,
    borderColor: "border-l-4 border-l-blue-500",
    bgColor: "bg-blue-50/50 dark:bg-blue-950/20",
    button: { label: "Ready Up", action: "prepare" },
    read: true,
  },
  {
    id: "4",
    type: "milestone",
    title: "🎯 Squad reached 70% of goal",
    description:
      "Exciting! Your squad 'Dream Home Fund' is making progress. Only $300 left to reach the final goal.",
    timestamp: "Yesterday",
    icon: <Check className="w-5 h-5" />,
    borderColor: "border-l-4 border-l-green-500",
    bgColor: "bg-green-50/50 dark:bg-green-950/20",
    button: { label: "Celebrate with Squad", action: "squad" },
    read: true,
  },
  {
    id: "5",
    type: "squad",
    title: "👥 New member joined your squad",
    description:
      "Alex just joined your 'Dream Home Fund' squad just hit a major milestone. Only $300 left to reach the final goal.",
    timestamp: "2 days ago",
    icon: <Users className="w-5 h-5" />,
    borderColor: "border-l-4 border-l-purple-500",
    bgColor: "bg-purple-50/50 dark:bg-purple-950/20",
    button: { label: "Share", action: "share" },
    read: true,
  },
];

export default function ActivityPage() {
  const [allNotifications, setAllNotifications] = useState<Notification[]>(
    notifications
  );

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const handleMarkAllAsRead = () => {
    setAllNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleAction = (id: string) => {
    setAllNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-4 md:px-6 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-1">Notifications</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Your squads are waiting for your energy.
          </p>

          {/* Mark all as read button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-black dark:bg-white text-white dark:text-black text-xs md:text-sm font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              <Check size={16} />
              Mark all as read
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 md:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border border-border rounded-2xl p-6 text-center hover:shadow-lg transition-shadow bg-card"
              >
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <p className="text-2xl md:text-3xl font-bold mb-1">{stat.label}</p>
                <p className="text-xs md:text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="px-4 md:px-6">
        <div className="max-w-4xl mx-auto space-y-4 pb-12">
          {allNotifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground font-medium">
                No notifications yet
              </p>
            </div>
          ) : (
            allNotifications.map((notification, idx) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
                className={`${notification.borderColor} ${notification.bgColor} border border-border rounded-xl p-5 md:p-6 hover:shadow-md transition-all`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0 text-accent mt-1">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-2">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {notification.description}
                    </p>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </p>
                      {notification.button && (
                        <button
                          onClick={() => handleAction(notification.id)}
                          className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs md:text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          {notification.button.label}
                        </button>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full mt-2" />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
