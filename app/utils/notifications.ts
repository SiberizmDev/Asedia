import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

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
      alert('Bildirim izni olmadan güncellemelerden haberdar olamazsınız!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: '73b063a3-1c70-4291-9653-2a51150c88e5'
    })).data;
  } else {
    alert('Fiziksel bir cihaz kullanmalısınız!');
  }

  return token;
}

export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Yeni Güncelleme! 🎉",
      body: "Asedia uygulaması güncellendi! Hemen göz at.",
      data: { data: 'goes here' },
    },
    trigger: null,
  });
} 