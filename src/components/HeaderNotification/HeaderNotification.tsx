import React, {useEffect, useState} from 'react';
import {defaultNotificationsTime} from '../../constants/constants';
import {useNotifications} from '../../hooks/NotificationsHook';
import {INotification, NotificationPriority} from '../../_types/types';
import DisplayNotification from './DisplayNotification';

function HeaderNotification(): JSX.Element {
    const {notificationsStack, updateNotificationsStack, baseNotification} = useNotifications();

    const [message, setMessage] = useState<INotification>(baseNotification);
    const [activeTimeouts, setActiveTimeouts] = useState<{notification: any; base: any}>({
        notification: null,
        base: null
    });

    useEffect(() => {
        if (notificationsStack.length) {
            // Sort notification by priority
            const sortNotificationsStack = [...notificationsStack].sort((a, b) => {
                switch (a.priority) {
                    case NotificationPriority.low:
                        switch (b.priority) {
                            case NotificationPriority.low:
                                return 0;
                            case NotificationPriority.medium:
                                return 1;
                            case NotificationPriority.high:
                                return 1;
                        }
                        return 0;
                    case NotificationPriority.medium:
                        switch (b.priority) {
                            case NotificationPriority.low:
                                return -1;
                            case NotificationPriority.medium:
                                return 0;
                            case NotificationPriority.high:
                                return 1;
                        }
                        return 0;
                    case NotificationPriority.high:
                        switch (b.priority) {
                            case NotificationPriority.low:
                                return -1;
                            case NotificationPriority.medium:
                                return -1;
                            case NotificationPriority.high:
                                return 0;
                        }
                        return 0;
                }
                return 0;
            });

            // Take the first notification
            const [notification, ...restNotifications] = sortNotificationsStack;

            if (notification && !activeTimeouts.notification) {
                setMessage(notification);

                const notificationTime = notification.time ?? defaultNotificationsTime;

                if (activeTimeouts.base) {
                    setActiveTimeouts(timeouts => {
                        clearTimeout(timeouts.base);

                        return {
                            base: null,
                            notification: timeouts.notification
                        };
                    });
                }

                // Reset notifications
                const notificationTimeout = setTimeout(() => {
                    if (!activeTimeouts.notification) {
                        const baseTimeout = setTimeout(() => {
                            setMessage(baseNotification);
                        }, 100);

                        setActiveTimeouts(timeouts => ({
                            notification: timeouts.notification,
                            base: baseTimeout
                        }));
                    }

                    setActiveTimeouts(at => ({
                        notification: null,
                        base: at.base
                    }));
                }, notificationTime);

                setActiveTimeouts(timeouts => ({
                    notification: notificationTimeout,
                    base: timeouts.base
                }));

                updateNotificationsStack(restNotifications);
            }
        } else if (!activeTimeouts.notification) {
            setMessage(msg => {
                if (baseNotification.content !== msg.content) {
                    return baseNotification;
                }
                return msg;
            });
        }
    }, [setMessage, updateNotificationsStack, notificationsStack, baseNotification, setActiveTimeouts, activeTimeouts]);

    const cancelNotification = () => {
        clearTimeout(activeTimeouts.notification);
        setActiveTimeouts(timeouts => ({
            notification: null,
            base: timeouts.base
        }));
    };

    return (
        <DisplayNotification
            message={message}
            activeTimeouts={activeTimeouts}
            cancelNotification={cancelNotification}
        />
    );
}

export default HeaderNotification;
