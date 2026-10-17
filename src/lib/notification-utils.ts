// Notification utility functions
export interface NotificationSettings {
  email: boolean;
  browserNotifications: boolean;
}

export const getNotificationSettings = (): NotificationSettings => {
  const saved = localStorage.getItem('prodify-notification-settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Error parsing saved notification settings:', error);
    }
  }
  // Default values
  return {
    email: true,
    browserNotifications: true,
  };
};

export const sendBrowserNotification = (title: string, body: string) => {
  const settings = getNotificationSettings();
  
  if (settings.browserNotifications && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'prodify-notification'
    });
  }
};

import { apiService } from './api';

// The server sends it to the signed-in user's own address; userEmail only signals that one exists
export const sendEmailNotification = async (subject: string, message: string, userEmail?: string) => {
  const settings = getNotificationSettings();

  if (settings.email && userEmail) {
    try {
      await apiService.sendEmailNotification({ subject, body: message });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }
};

export const sendNotification = async (title: string, message: string, type: 'browser' | 'email' | 'both' = 'both', userEmail?: string) => {
  if (type === 'browser' || type === 'both') {
    sendBrowserNotification(title, message);
  }
  
  if (type === 'email' || type === 'both') {
    await sendEmailNotification(title, message, userEmail);
  }
}; 