import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import styles from './NotificationInboxOverlay.module.css';

interface Notification {
    notification_id: number;
    title: string;
    message: string;
    push_date: string;
    was_read: boolean;
}

interface Props {
    anchorRef: React.RefObject<HTMLDivElement | null>;
    onClose: () => void;
}

const NotificationInboxOverlay: React.FC<Props> = ({ anchorRef, onClose }) => {
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const [overlayWidth, setOverlayWidth] = useState<string>('30vw'); // Default width
    const overlayRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useLayoutEffect(() => {
        // Initial position calculation
        if (anchorRef.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
        }
    }, [anchorRef]);

    useEffect(() => {
        const updateOverlayWidth = () => {
            if (window.innerWidth < 480) {
                setOverlayWidth('80vw');
            } else if (window.innerWidth < 768) {
                setOverlayWidth('50vw');
            } else {
                setOverlayWidth('30vw');
            }
        };

        updateOverlayWidth();

        window.addEventListener('resize', updateOverlayWidth);

        return () => {
            window.removeEventListener('resize', updateOverlayWidth);
        };
    }, []);

    useEffect(() => {
        const updatePosition = () => {
            if (anchorRef.current) {
                const rect = anchorRef.current.getBoundingClientRect();
                setPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
            }
        };

        window.addEventListener('resize', updatePosition);
        return () => window.removeEventListener('resize', updatePosition);
    }, [anchorRef]);

    useEffect(() => {
        fetchNotifications();
    }, [notifications]);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/notifications/getAllNotifications');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notification_id: number) => {
        try {
            await axios.post('http://localhost:5000/api/notifications/markNotficationAsRead', { notification_id });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const deleteNotification = (id: number) => {
        setNotifications((prev) => prev.filter((notification) => notification.notification_id !== id));
    };

    const handleOutsideClick = (e: MouseEvent) => {
        if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    return (
        <div
            ref={overlayRef}
            className={styles.overlay}
            style={{
                top: `${position.top + 20}px`, // 20px padding from the bell icon
                left: `${position.left}px`,
                transform: 'translateX(-85%)',
                width: overlayWidth,
                maxWidth: '400px',
                minWidth: '250px',
                backgroundColor: '#fff',
                padding: '10px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px',
                zIndex: 1000,
            }}
        >
            <div className={styles.header}>
                <h2>Notifications</h2>
                <button className={styles.closeButton} onClick={onClose}>
                    ✕
                </button>
            </div>
            <div className={styles.notificationList}>
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div
                            key={notification.notification_id}
                            className={`${styles.notificationItem} ${notification.was_read ? styles.read : ''}`}
                        >
                            <div className={styles.notificationContent}>
                                <h3>{notification.title}</h3>
                                <p>{notification.message}</p>
                                <span className={styles.timestamp}>
                                    {new Date(notification.push_date).toLocaleString()}
                                </span>
                            </div>
                            <div className={styles.notificationActions}>
                                {!notification.was_read && (
                                    <button onClick={() => markAsRead(notification.notification_id)}>Mark as Read</button>
                                )}
                                <button onClick={() => deleteNotification(notification.notification_id)}>Delete</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.emptyMessage}>No notifications</p>
                )}
            </div>
        </div>
    );
};

export default NotificationInboxOverlay;
