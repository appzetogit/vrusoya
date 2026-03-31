import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Firebase configuration - These will need to be replaced with actual values
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// VAPID key for web push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Initialize Firebase
let app;
let messaging;
const isFirebaseConfigComplete = Object.values(firebaseConfig).every(Boolean) && Boolean(VAPID_KEY);

try {
  if (isFirebaseConfigComplete) {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase web config is incomplete. Push notifications will not work until all VITE_FIREBASE_* values are set.');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!isFirebaseConfigComplete || !messaging) {
      console.error('Firebase messaging is not configured. Missing VITE_FIREBASE_* values or VAPID key.');
      return null;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Register service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log('Service Worker registered:', registration);
        
        // Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          console.log('FCM Token:', token);
          return token;
        } else {
          console.log('No registration token available');
          return null;
        }
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages (returns unsubscribe function)
export const onMessageListener = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

export { messaging, isFirebaseConfigComplete };
