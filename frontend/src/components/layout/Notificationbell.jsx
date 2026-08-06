import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    CalendarClock,
    BookOpen,
    GraduationCap,
    Megaphone,
    Award,
    ClipboardCheck,
    CheckCheck,
    Loader2
} from "lucide-react";

import {
    getMyNotifications,
    getUnreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from "../../services/notificationService";
import { useLanguage } from "../../context/LanguageContext";

const ICONS_BY_TYPE = {
    leave: CalendarClock,
    homework: BookOpen,
    exam: GraduationCap,
    notice: Megaphone,
    result: Award,
    attendance: ClipboardCheck,
    general: Bell
};

const COLORS_BY_TYPE = {
    leave: "bg-orange-50 text-orange-600",
    homework: "bg-blue-50 text-blue-600",
    exam: "bg-violet-50 text-violet-600",
    notice: "bg-amber-50 text-amber-600",
    result: "bg-emerald-50 text-emerald-600",
    attendance: "bg-indigo-50 text-indigo-600",
    general: "bg-slate-100 text-slate-600"
};

const POLL_INTERVAL_MS = 30000;

const formatRelativeTime = (dateString, language) => {
    const now = new Date();
    const then = new Date(dateString);
    const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));

    const isGujarati = language === "gu";

    if (diffSeconds < 60) {
        return isGujarati ? "હમણાં જ" : "Just now";
    }

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return isGujarati ? `${diffMinutes} મિનિટ પહેલા` : `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return isGujarati ? `${diffHours} કલાક પહેલા` : `${diffHours}h ago`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
        return isGujarati ? `${diffDays} દિવસ પહેલા` : `${diffDays}d ago`;
    }

    return then.toLocaleDateString(isGujarati ? "gu-IN" : "en-IN", {
        day: "numeric",
        month: "short"
    });
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const { language, t } = useLanguage();

    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

    const containerRef = useRef(null);

    // Poll just the unread count in the background so the badge
    // stays fresh even when the dropdown is closed.
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const data = await getUnreadCount();
                setUnreadCount(data.unreadCount || 0);
            } catch {
                // Silent — a failed poll shouldn't show an error to the user,
                // it'll just try again on the next interval.
            }
        };

        fetchCount();

        const interval = setInterval(fetchCount, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, []);

    // Close the dropdown when clicking outside it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getMyNotifications(20);
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
            setHasLoadedOnce(true);
        } catch {
            // Leave whatever was already shown in place on failure
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);

        if (nextIsOpen && !hasLoadedOnce) {
            loadNotifications();
        }
    };

    const handleNotificationClick = async (notification) => {
        setIsOpen(false);

        if (!notification.read) {
            // Optimistic update — flip it locally right away, don't
            // make the user wait on the network before navigating.
            setNotifications((previous) =>
                previous.map((item) =>
                    item._id === notification._id
                        ? { ...item, read: true }
                        : item
                )
            );
            setUnreadCount((previous) => Math.max(0, previous - 1));

            try {
                await markNotificationAsRead(notification._id);
            } catch {
                // Not critical enough to roll back the optimistic update —
                // worst case it shows as read locally until next refresh.
            }
        }

        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllRead = async (event) => {
        event.stopPropagation();

        setNotifications((previous) =>
            previous.map((item) => ({ ...item, read: true }))
        );
        setUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
        } catch {
            // Next poll/open will resync if this failed silently
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={handleToggle}
                className="relative rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-indigo-600"
                title={t("navbar.notifications")}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-40 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:w-96">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-800">
                            {t("navbar.notifications")}
                        </h3>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                            >
                                <CheckCheck className="h-3.5 w-3.5" />
                                {t("navbar.markAllRead")}
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && notifications.length === 0 && (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                            </div>
                        )}

                        {!loading && notifications.length === 0 && (
                            <div className="px-4 py-10 text-center">
                                <Bell className="mx-auto h-8 w-8 text-slate-300" />
                                <p className="mt-2 text-sm text-slate-400">
                                    {t("navbar.noNotifications")}
                                </p>
                            </div>
                        )}

                        {notifications.map((notification) => {
                            const Icon =
                                ICONS_BY_TYPE[notification.type] || Bell;

                            const colorClass =
                                COLORS_BY_TYPE[notification.type] ||
                                COLORS_BY_TYPE.general;

                            return (
                                <button
                                    key={notification._id}
                                    type="button"
                                    onClick={() =>
                                        handleNotificationClick(notification)
                                    }
                                    className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                                        notification.read
                                            ? ""
                                            : "bg-indigo-50/40"
                                    }`}
                                >
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}
                                    >
                                        <Icon className="h-4.5 w-4.5" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-slate-800">
                                            {notification.title}
                                        </p>
                                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                                            {notification.message}
                                        </p>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            {formatRelativeTime(
                                                notification.createdAt,
                                                language
                                            )}
                                        </p>
                                    </div>

                                    {!notification.read && (
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;