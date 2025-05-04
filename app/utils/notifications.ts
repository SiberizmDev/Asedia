import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    // Android kanalı oluştur
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Bildirim izni alınamadı!');
      return null;
    }

    try {
      // Expo push token al
      token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      
      console.log('Push token:', token);
      return token.data;
    } catch (error) {
      console.error('Push token alınamadı:', error);
      return null;
    }
  }

  return null;
}

export async function sendTestNotification() {
  try {
    const token = await registerForPushNotificationsAsync();
    
    if (!token) {
      throw new Error('Push token alınamadı');
    }

    // Test bildirimi gönder
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: token,
        title: 'Asedia',
        body: 'Test bildirimi başarıyla gönderildi!',
        data: { type: 'test' },
        sound: 'default',
        priority: 'high',
      }),
    });
  } catch (error) {
    console.error('Test bildirimi gönderilemedi:', error);
    throw error;
  }
}