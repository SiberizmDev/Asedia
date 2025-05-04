import { registerRootComponent } from 'expo';

import App from './App';

// App.js veya index.js içinde
import * as Notifications from 'expo-notifications';

// Bildirim davranışını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Ana bileşeninde bildirim dinleyicilerini kur
useEffect(() => {
  // Uygulama önplandayken bildirimleri yönet
  const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('Ön planda bildirim alındı:', notification);
  });

  // Kullanıcı bildirime tıkladığında 
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Bildirim yanıtı alındı:', response);
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}, []);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
