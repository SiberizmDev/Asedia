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
  // Fiziksel bir cihaz mı kontrol edelim (bildirimler simülatörlerde çalışmaz)
  const deviceType = await Device.getDeviceTypeAsync();
  if (deviceType !== Device.DeviceType.PHONE) {
    console.log('Bildirimler için fiziksel cihaz gerekli');
    return;
  }

  // İzin durumunu kontrol edelim
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  // Eğer izin henüz alınmamışsa isteyelim
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // İzin yoksa çıkalım
  if (finalStatus !== 'granted') {
    console.log('Bildirim izni alınamadı!');
    return;
  }

  try {
    // Project ID kontrolü ekleyelim
    if (!Constants.expoConfig || !Constants.expoConfig.extra || !Constants.expoConfig.extra.eas) {
      console.error('Project ID bulunamadı!');
      return null;
    }

    // Push token alalım
    const expoPushToken = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig.extra.eas.projectId,
    });
    console.log('Push token:', expoPushToken.data);
    return expoPushToken.data;
  } catch (error) {
    console.error('Token alınırken hata:', error);
    return null;
  }
}

export async function sendTestNotification() {
  // Önce izin kontrolü yapalım
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    console.log('Bildirim izni yok');
    return;
  }

  if (!Constants.expoConfig || !Constants.expoConfig.extra || !Constants.expoConfig.extra.eas) {
    console.error('Project ID bulunamadı!');
    return null;
  }
  
  // Hemen görüntülenecek bir bildirim planlayalım
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Bildirimi 🔔",
      body: "Bildirimler başarıyla çalışıyor!",
      sound: true, // Ses etkinleştir
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: null, // Hemen gönder
  });
  
  console.log('Test bildirimi gönderildi!');
}