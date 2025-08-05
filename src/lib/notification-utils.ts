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

export const sendEmailNotification = async (subject: string, message: string, userEmail?: string) => {
  const settings = getNotificationSettings();
  
  console.log('=== EMAIL NOTIFICATION DEBUG ===');
  console.log('Email notification settings:', { 
    emailEnabled: settings.email, 
    userEmail: userEmail,
    willSend: settings.email && userEmail 
  });
  
  if (settings.email && userEmail) {
    try {
      console.log('🚀 Sending email notification:', { 
        to: userEmail, 
        subject: subject, 
        message: message.substring(0, 100) + '...' 
      });
      
      const result = await apiService.sendEmailNotification({
        to: userEmail,
        subject: subject,
        body: message
      });
      
      console.log('✅ Email notification sent successfully:', result);
      console.log('📧 Email was sent TO:', userEmail);
    } catch (error) {
      console.error('❌ Failed to send email notification:', error);
    }
  } else {
    console.log('⏸️ Email notifications disabled or no user email provided');
    console.log('Settings:', settings);
    console.log('UserEmail:', userEmail);
  }
  console.log('=== END EMAIL DEBUG ===');
};

export const sendNotification = async (title: string, message: string, type: 'browser' | 'email' | 'both' = 'both', userEmail?: string) => {
  if (type === 'browser' || type === 'both') {
    sendBrowserNotification(title, message);
  }
  
  if (type === 'email' || type === 'both') {
    await sendEmailNotification(title, message, userEmail);
  }
}; 