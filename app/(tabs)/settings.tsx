import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Moon, Volume2, Clock, ChevronRight } from 'lucide-react-native';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useState } from 'react';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(false);
  const [soundEffects, setSoundEffects] = useState(true);
  
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#101013', '#1a1a1a']}
      style={styles.container}
    >
      <Text style={styles.title}>Ayarlar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ses ve Bildirimler</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Bell size={24} color="#fff" />
            <Text style={styles.settingText}>Bildirimler</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#333', true: '#7B4DFF' }}
            thumbColor={notifications ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Volume2 size={24} color="#fff" />
            <Text style={styles.settingText}>Ses Efektleri</Text>
          </View>
          <Switch
            value={soundEffects}
            onValueChange={setSoundEffects}
            trackColor={{ false: '#333', true: '#7B4DFF' }}
            thumbColor={soundEffects ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Moon size={24} color="#fff" />
            <Text style={styles.settingText}>Karanlık Mod</Text>
          </View>
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Clock size={24} color="#fff" />
            <Text style={styles.settingText}>Hatırlatıcı Zamanı</Text>
          </View>
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hakkında</Text>
        
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Gizlilik Politikası</Text>
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Kullanım Koşulları</Text>
          <ChevronRight size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Versiyon 1.0.0</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 32,
    color: '#fff',
    marginTop: 60,
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 20,
    color: '#fff',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
  },
});