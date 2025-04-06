import { View, Text, StyleSheet, TouchableOpacity, Switch, Linking, ActivityIndicator, ScrollView, ImageBackground, SafeAreaView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Moon, Volume2, Clock, ChevronRight, Download, RefreshCw, Sun, Smartphone } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { registerForPushNotificationsAsync, sendTestNotification } from '../utils/notifications';
import * as Notifications from 'expo-notifications';

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/SiberizmDev/Asedia/main/app.json';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [latestVersion, setLatestVersion] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const currentVersion = Constants.expoConfig?.version || '0.1.0';
  
  const { theme, setTheme, colors } = useTheme();

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
    setIsChecking(true);
    try {
      console.log('Checking for updates...');
      console.log('Fetching:', GITHUB_RAW_URL);
      const response = await fetch(GITHUB_RAW_URL);
      const data = await response.json();
      console.log('Current version:', currentVersion);
      console.log('GitHub version:', data.expo.version);
      const githubVersion = data.expo.version;
      setLatestVersion(githubVersion);
      
      if (githubVersion > currentVersion) {
        console.log('Update available!');
        setUpdateAvailable(true);
        
        // Yeni güncelleme varsa ve bildirimler açıksa bildirim gönder
        if (notifications) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Yeni Güncelleme! 🎉",
              body: `Asedia ${githubVersion} sürümü yayınlandı! Güncellemeyi unutmayın!`,
              data: { version: githubVersion },
            },
            trigger: null, // Hemen gönder
          });
        }
      } else {
        console.log('No update available');
        setUpdateAvailable(false);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const checkNotificationPermissions = async () => {
    const token = await registerForPushNotificationsAsync();
    setNotifications(!!token);
  };

  const handleNotificationToggle = async () => {
    if (!notifications) {
      const token = await registerForPushNotificationsAsync();
      setNotifications(!!token);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
    } catch (error) {
      console.error('Test notification error:', error);
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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.background[0] }]}>
      <StatusBar 
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={theme === 'light' ? '#FFFFFF' : theme === 'amoled' ? '#000000' : '#121212'} 
        translucent 
      />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Ayarlar</Text>

        {updateAvailable && (
          <TouchableOpacity style={[styles.updateBanner, { backgroundColor: colors.cardBackground }]} onPress={handleUpdate}>
            <View style={styles.updateContent}>
              <Download size={24} color={colors.primary} />
              <View style={styles.updateTextContainer}>
                <Text style={[styles.updateTitle, { color: colors.primary }]}>Güncelleme Mevcut!</Text>
                <Text style={[styles.updateText, { color: colors.subText }]}>Yeni versiyon {latestVersion} mevcut</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.primary} />
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

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
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
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hakkında</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingText, { color: colors.text }]}>Gizlilik Politikası</Text>
              </View>
            </View>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
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

        {/* {notifications && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Test Bildirimi</Text>
            <TouchableOpacity
              style={[styles.option, { backgroundColor: colors.cardBackground }]}
              onPress={handleTestNotification}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>Test Bildirimi Gönder</Text>
              <Bell size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        )} */}
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  updateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateTextContainer: {
    marginLeft: 12,
  },
  updateTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  updateText: {
    fontSize: 14,
    marginTop: 2,
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