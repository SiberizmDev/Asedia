import { View, Text, StyleSheet, TouchableOpacity, Switch, Linking, ActivityIndicator, ScrollView, Image, ImageBackground, SafeAreaView, StatusBar, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Moon, Volume2, Clock, ChevronRight, Download, RefreshCw, Sun, Smartphone } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; // FontAwesome ikonları kullanılacak

import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync, sendTestNotification } from '../utils/notifications';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/SiberizmDev/Asedia/main/app.json';

// Güncelleme bilgisi için tip
type UpdateInfo = {
  version: string;
  title: string;
  description: string[];
  image: string;
};

// Bildirim ayarlarını yapılandır
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const currentVersion = Constants.expoConfig?.version || '0.1.0';
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notificationPermission, setNotificationPermission] = useState<boolean>(false);

  const { theme, setTheme, colors } = useTheme();

  const handlePress = (url) => {
    Linking.openURL(url).catch((err) => console.error("Bağlantı yüklenemedi:", err));
  };

  useEffect(() => {
    checkForUpdates();
    checkNotificationPermissions();

    // Her 6 saatte bir güncelleme kontrolü yap
    const updateCheckInterval = setInterval(() => {
      checkForUpdates();
    }, 6 * 60 * 60 * 1000); // 6 saat = 6 * 60 * 60 * 1000 milisaniye

    // Component unmount olduğunda interval'i temizle
    return () => clearInterval(updateCheckInterval);
  }, [notifications]); // notifications değiştiğinde effect'i yeniden çalıştır

  const checkForUpdates = async () => {
    try {
      setIsChecking(true);
      const response = await fetch('https://raw.githubusercontent.com/SiberizmDev/Asedia/main/update.json', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        console.log('Güncelleme bilgisi alınamadı:', response.status);
        return;
      }

      const data = await response.json();
      console.log('Güncelleme verisi:', data);
      
      // Versiyon kontrolü
      if (data.version && data.version !== currentVersion) {
        console.log('Yeni güncelleme bulundu:', data.version);
        // Resim URL'sine timestamp ekle
        if (data.image) {
          data.image = `${data.image}?t=${new Date().getTime()}`;
        }
        setUpdateInfo(data);
        setUpdateAvailable(true);
        setLatestVersion(data.version);
      } else {
        console.log('Güncelleme yok');
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.log('Güncelleme kontrolü hatası:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkNotificationPermissions = async () => {
    try {
      if (!Device.isDevice) {
        Alert.alert('Hata', 'Bildirimler sadece fiziksel cihazlarda çalışır.');
        return;
      }

      // Android 13+ için özel izin kontrolü
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        console.log('Android 13+ bildirim izni durumu:', existingStatus);

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync({
            android: {
              importance: Notifications.AndroidImportance.HIGH,
              allowAlert: true,
              allowBadge: true,
              allowSound: true,
              allowAnnouncements: true,
            }
          });
          
          if (status !== 'granted') {
            console.log('Android 13+ bildirim izni reddedildi');
            setNotificationPermission(false);
            setNotifications(false);
            Alert.alert(
              "Bildirim İzni Gerekli",
              "Android 13 ve üzeri için özel bildirim izni gerekiyor. Lütfen ayarlardan izin verin.",
              [
                { text: "İptal", style: "cancel" },
                { text: "Ayarlara Git", onPress: () => Linking.openSettings() }
              ]
            );
            return;
          }
        }
      } else {
        // Android 13 altı ve diğer platformlar için normal izin kontrolü
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            setNotificationPermission(false);
            setNotifications(false);
            return;
          }
        }
      }

      // Token alma işlemi
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: "73b063a3-1c70-4291-9653-2a51150c88e5"
      });
      
      console.log('Push Token:', token.data);
      setExpoPushToken(token.data);
      setNotificationPermission(true);
      setNotifications(true);

    } catch (error) {
      console.error('Bildirim izni hatası:', error);
      setNotificationPermission(false);
      setNotifications(false);
    }
  };

  const handleNotificationToggle = async () => {
    if (!notifications) {
      if (!Device.isDevice) {
        Alert.alert('Hata', 'Bildirimler sadece fiziksel cihazlarda çalışır.');
        return;
      }

      try {
        // Android 13+ için özel izin kontrolü
        if (Platform.OS === 'android' && Platform.Version >= 33) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync({
              android: {
                importance: Notifications.AndroidImportance.HIGH,
                allowAlert: true,
                allowBadge: true,
                allowSound: true,
                allowAnnouncements: true,
              }
            });
            
            if (status !== 'granted') {
              Alert.alert(
                "Bildirim İzni Gerekli",
                "Android 13 ve üzeri için özel bildirim izni gerekiyor. Lütfen ayarlardan izin verin.",
                [
                  { text: "İptal", style: "cancel" },
                  { text: "Ayarlara Git", onPress: () => Linking.openSettings() }
                ]
              );
              return;
            }
          }
        } else {
          // Android 13 altı ve diğer platformlar için normal izin kontrolü
          const { status } = await Notifications.getPermissionsAsync();
          if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            if (newStatus !== 'granted') {
              Alert.alert(
                "Bildirim İzni Gerekli",
                "Bildirimleri etkinleştirmek için lütfen uygulama ayarlarından izin verin.",
                [
                  { text: "İptal", style: "cancel" },
                  { text: "Ayarlara Git", onPress: () => Linking.openSettings() }
                ]
              );
              return;
            }
          }
        }

        const token = await Notifications.getExpoPushTokenAsync({
          projectId: "73b063a3-1c70-4291-9653-2a51150c88e5"
        });
        
        console.log('Push Token:', token.data);
        setExpoPushToken(token.data);
        setNotificationPermission(true);
        setNotifications(true);
        
        // Test bildirimi gönder
        await handleTestNotification();

      } catch (error) {
        console.error('Bildirim hatası:', error);
        Alert.alert(
          "Bildirim İzni Gerekli",
          "Bildirimleri etkinleştirmek için lütfen uygulama ayarlarından izin verin.",
          [
            { text: "İptal", style: "cancel" },
            { text: "Ayarlara Git", onPress: () => Linking.openSettings() }
          ]
        );
      }
    } else {
      Alert.alert(
        "Bildirimleri Kapat",
        "Bildirimleri kapatmak için cihaz ayarlarını kullanmanız gerekiyor.",
        [
          { text: "İptal", style: "cancel" },
          { text: "Ayarlara Git", onPress: () => Linking.openSettings() }
        ]
      );
    }
  };

  const handleTestNotification = async () => {
    if (!notificationPermission || !expoPushToken) {
      Alert.alert('Hata', 'Bildirim izni verilmemiş veya token alınamadı.');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Bildirimi",
          body: "Bu bir test bildirimidir. Bildirimler başarıyla çalışıyor!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          android: {
            channelId: 'default',
            importance: Notifications.AndroidImportance.HIGH,
            priority: 'high',
            vibrate: [0, 250, 250, 250],
          }
        },
        trigger: null,
      });
      
      console.log('Test bildirimi gönderildi');
      Alert.alert('Başarılı', 'Test bildirimi gönderildi. Lütfen bildirim gelip gelmediğini kontrol edin.');
    } catch (error) {
      console.error('Test bildirimi hatası:', error);
      Alert.alert('Hata', 'Test bildirimi gönderilemedi: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleUpdate = () => {
    Linking.openURL('https://github.com/SiberizmDev/Asedia/releases/latest');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun size={24} color={colors.text} />;
      case 'amoled':
        return <Smartphone size={24} color={colors.text} />;
      default:
        return <Moon size={24} color={colors.text} />;
    }
  };

  const getThemeText = () => {
    switch (theme) {
      case 'light':
        return 'Aydınlık Mod';
      case 'amoled':
        return 'AMOLED Karanlık';
      default:
        return 'Karanlık Mod';
    }
  };

  const cycleTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('amoled');
        break;
      case 'amoled':
        setTheme('light');
        break;
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  // Component mount olduğunda bildirim izinlerini kontrol et
  useEffect(() => {
    checkNotificationPermissions();

    // Bildirim alıcısını ayarla
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Bildirim alındı:', notification);
    });

    // Cleanup
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.background[0] }]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={theme === 'light' ? '#FFFFFF' : theme === 'amoled' ? '#000000' : '#121212'}
        translucent
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>

        {updateAvailable && updateInfo && (
          <TouchableOpacity 
            style={[styles.updateBanner, { backgroundColor: colors.cardBackground }]}
            onPress={handleUpdate}
          >
            <View style={styles.updateContent}>
              <View style={styles.updateHeader}>
                <Download size={24} color={colors.primary} />
                <Text style={[styles.updateTitle, { color: colors.primary }]}>
                  {updateInfo.title}
                </Text>
              </View>

              {updateInfo.image && (
                <ImageBackground 
                  source={{ 
                    uri: updateInfo.image,
                    cache: 'reload'
                  }}
                  style={styles.updateImage}
                  resizeMode="cover"
                />
              )}

              <View style={styles.updateDetails}>
                <Text style={[styles.updateVersion, { color: colors.text }]}>
                  Versiyon {updateInfo.version}
                </Text>
                <View style={styles.updateFeatures}>
                  {updateInfo.description.map((item, index) => (
                    <Text key={index} style={[styles.featureText, { color: colors.text }]}>
                      • {item}
                    </Text>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.updateButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdate}
              >
                <Text style={styles.updateButtonText}>Güncellemeyi İndir</Text>
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Görünüm ve Ses</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/screens/theme')}
          >
            <View style={styles.settingLeft}>
              <Moon size={24} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>
                  Tema
                </Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>
                  {theme === 'amoled' ? 'AMOLED Karanlık' :
                    theme === 'dark' ? 'Karanlık Mod' : 'Aydınlık Mod'}
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLeft}>
              <Bell size={24} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Bildirimler</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>
                  Yeni güncellemelerden haberdar ol
                </Text>
              </View>
          </View>
          <Switch
            value={notifications}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={notifications ? colors.switchThumb : colors.switchThumb}
          />
        </View>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
          <View style={styles.settingLeft}>
              <Volume2 size={24} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Ses Efektleri</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>
                  Uygulama ses efektlerini aç/kapat
                </Text>
              </View>
          </View>
          <Switch
            value={soundEffects}
            onValueChange={setSoundEffects}
              trackColor={{ false: colors.switchTrack, true: colors.primary }}
              thumbColor={soundEffects ? colors.switchThumb : colors.switchThumb}
            />
          </View>

          {/* <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Clock size={24} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Hatırlatıcı Zamanı</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>
                  Günlük hatırlatıcı zamanını ayarla
                </Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity> */}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ayaz Salih Koç Destek</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => handlePress('https://www.instagram.com/piijamali_spiderman/')}
          >
            <View style={styles.settingLeft}>
              <Image
                source={require('../../assets/images/ask.jpg')}
                style={{ width: 24, height: 24, marginRight: 10 }}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Ayaz Salih Koç Instagram</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Bize Ulaşın</Text>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => handlePress('https://forum.asena.space/')}
          >
            <View style={styles.settingLeft}>
              <Image
                source={require('../../assets/images/forum.png')}
                style={{ width: 24, height: 24, marginRight: 10 }}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Asena Forum</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => handlePress('https://www.instagram.com/asena.space/')}
          >
            <View style={styles.settingLeft}>
              <Icon
                name="instagram"
                size={24}
                color={colors.text}
                style={{ marginRight: 10 }}
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>@asena.space</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => handlePress('https://apps.asena.space/Asedia/privacy.html')}>
            <View style={styles.settingLeft}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Gizlilik Politikası</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}
            onPress={() => handlePress('https://apps.asena.space/Asedia/terms.html')}>
            <View style={styles.settingLeft}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Kullanım Koşulları</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, styles.updateCheck, { borderBottomColor: colors.border }]}
            onPress={checkForUpdates}
            disabled={isChecking}
          >
            <View style={styles.settingLeft}>
              <RefreshCw size={24} color={colors.text} />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Güncellemeleri Kontrol Et</Text>
                <Text style={[styles.settingSubText, { color: colors.subText }]}>
                  Son versiyon: {currentVersion}
                </Text>
              </View>
            </View>
            {isChecking ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <ChevronRight size={24} color={colors.text} />
            )}
          </TouchableOpacity>

          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingText, { color: colors.text }]}>Versiyon {currentVersion}</Text>
            {!updateAvailable && !isChecking && latestVersion && (
              <Text style={[styles.upToDate, { color: colors.success }]}>Güncel</Text>
            )}
          </View>
        </View>

        {notifications && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Bildirimi</Text>
            <TouchableOpacity
              style={[
                styles.option,
                {
                  backgroundColor: colors.cardBackground,
                  opacity: notifications ? 1 : 0.5
                }
              ]}
              onPress={notifications ? handleTestNotification : handleNotificationToggle}
              disabled={!notifications}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>
                {notifications ? 'Cihaza Test Bildirimi Gönder' : 'Bildirim İzni Gerekli'}
              </Text>
              <Bell size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: '600',
    fontSize: 32,
    marginTop: 80,
    marginBottom: 20,
  },
  updateBanner: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  updateContent: {
    gap: 16,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  updateImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
  },
  updateTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
  },
  updateDetails: {
    gap: 8,
  },
  updateVersion: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  updateFeatures: {
    gap: 6,
  },
  featureText: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 4,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 20,
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 24,
    flex: 1,
  },
  settingText: {
    fontSize: 16,
  },
  settingSubText: {
    fontSize: 13,
    marginTop: 4,
  },
  updateCheck: {
    opacity: 1,
  },
  upToDate: {
    fontSize: 14,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  copyright: {
    fontSize: 14,
    textAlign: 'center',
  },
});