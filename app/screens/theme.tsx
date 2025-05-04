import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, Smartphone, ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';

export default function ThemeScreen() {
  const { theme, setTheme, colors } = useTheme();
  const router = useRouter();

  const themes = [
    {
      id: 'light',
      title: 'Aydınlık Mod',
      description: 'Gündüz kullanımı için optimize edilmiş aydınlık tema',
      icon: <Sun size={24} color={colors.text} />,
    },
    {
      id: 'dark',
      title: 'Karanlık Mod',
      description: 'Gece kullanımı için optimize edilmiş standart karanlık tema',
      icon: <Moon size={24} color={colors.text} />,
    },
    {
      id: 'amoled',
      title: 'AMOLED Karanlık',
      description: 'OLED ekranlar için optimize edilmiş, pil tasarrufu sağlayan tam siyah tema',
      icon: <Smartphone size={24} color={colors.text} />,
    },
  ] as const;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      <StatusBar 
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={theme === 'light' ? '#FFFFFF' : theme === 'amoled' ? '#000000' : '#121212'} 
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Tema Seçimi</Text>
      </View>

      <View style={styles.themesContainer}>
        {themes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.themeItem,
              { 
                backgroundColor: colors.cardBackground,
                borderColor: theme === item.id ? colors.primary : 'transparent',
              }
            ]}
            onPress={() => setTheme(item.id)}
          >
            <View style={styles.themeHeader}>
              {item.icon}
              <View style={styles.themeInfo}>
                <Text style={[styles.themeTitle, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.themeDescription, { color: colors.subText }]}>
                  {item.description}
                </Text>
              </View>
            </View>
            <View style={[
              styles.checkIndicator,
              { 
                borderColor: theme === item.id ? colors.primary : colors.border,
                backgroundColor: theme === item.id ? colors.primary : 'transparent',
              }
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
  },
  themesContainer: {
    padding: 20,
  },
  themeItem: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  themeInfo: {
    marginLeft: 20,
    flex: 1,
  },
  themeTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  checkIndicator: {
    position: 'absolute',
    right: 20,
    top: 20,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
  },
}); 