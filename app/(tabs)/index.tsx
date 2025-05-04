import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Modal, Dimensions, PanResponder, Animated, Platform, SafeAreaView, StatusBar, ActivityIndicator, Alert, AppState } from 'react-native';
import { Audio } from 'expo-av';
import * as Icons from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_500Medium } from '@expo-google-fonts/inter';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

// GitHub raw content URL'leri
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/SiberizmDev/Asedia/main';
const CONTENT_JSON_URL = `${GITHUB_BASE_URL}/content.json`;

type IconComponentType = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

interface Sound {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  background: any; // ImageSourcePropType için
  soundUrl: string;
  isActive: boolean;
}

interface Category {
  title: string;
  subtitle: string;
  sounds: Sound[];
}

const CATEGORIES: Category[] = [
  {
    title: "Ortam Sesleri",
    subtitle: "Doğa sesleri",
    sounds: [
      {
        id: 'rain',
        title: 'Yağmurlu Koru',
        description: 'Yağmurlu bir gün',
        icon: Icons.Cloud,
        color: '#4CAF50',
        background: require('../../assets/images/rained_grove.jpeg'),
        isActive: false
      },
      {
        id: 'grov2e',
        title: 'Koru',
        description: 'Doğanın esintisi',
        icon: Icons.Cloud,
        color: '#4CAF50',
        background: require('../../assets/images/grove.jpg'),
        isActive: false
      },
      {
        id: 'night',
        title: 'Gece',
        description: 'Geceniin dinlendirici sesleri',
        icon: Icons.Leaf,
        color: '#4CAF50',
        background: require('../../assets/images/night.jpg'),
        isActive: false
      },
      {
        id: 'campfire',
        title: 'Şömine',
        description: 'Kamp ateşinin çıtırtısı',
        icon: Icons.Tent,
        color: '#FF5722',
        background: require('../../assets/images/campfire.jpg'),
        isActive: false
      },
      {
        id: 'campfire2',
        title: 'Şömine 2',
        description: 'Kamp ateşinin çıtırtısı',
        icon: Icons.Tent,
        color: '#FF5722',
        background: require('../../assets/images/campfire-2.jpg'),
        isActive: false
      },
      {
        id: 'campfire3',
        title: 'Şömine 3',
        description: 'Kamp ateşinin çıtırtısı',
        icon: Icons.Tent,
        color: '#FF5722',
        background: require('../../assets/images/campfire-3.jpg'),
        isActive: false
      },
      {
        id: 'nightsea',
        title: 'Okyanus Esintisi',
        description: 'Okyanusun sessiz sessizliği',
        icon: Icons.Tent,
        color: '#FF5722',
        background: require('../../assets/images/ocean.jpg'),
        isActive: false
      },
      {
        id: 'river',
        title: 'Gece Nehri',
        description: 'Akarsuyun uyandırıcı sesi',
        icon: Icons.Tent,
        color: '#FF5722',
        background: require('../../assets/images/default.jpg'),
        isActive: false
      }
    ]
  },
  {
    title: "Sakinleş",
    subtitle: "Ruha dokunan melodiler",
    sounds: [
      {
        id: 'memory',
        title: 'Hatıra',
        description: 'Hatıralarınıza dalın',
        icon: Icons.Star,
        color: '#9C27B0',
        background: require('../../assets/images/memory.jpeg'),
        isActive: false
      },
      {
        id: 'winter',
        title: 'Kış',
        description: 'Kış | by TOSH',
        icon: Icons.Music2,
        color: '#2196F3',
        background: require('../../assets/images/winter.jpeg'),
        isActive: false
      },
      {
        id: 'hope',
        title: 'Umut',
        description: 'Umudunuzu canlandırın',
        icon: Icons.Music2,
        color: '#2196F3',
        background: require('../../assets/images/hope.jpeg'),
        isActive: false
      },
      {
        id: 'clouds',
        title: 'Bulutlar',
        description: 'Bulutlar | by TOSH',
        icon: Icons.Music2,
        color: '#2196F3',
        background: require('../../assets/images/clouds.jpg'),
        isActive: false
      },
      // {
      //   id: 'night',
      //   title: 'Ay ışığı',
      //   description: 'Sakin gece melodileri',
      //   icon: Icons.Moon,
      //   color: '#607D8B',
      //   background: require('../../assets/images/night.jpg'),
      //   isActive: false
      // },
    ]
  },
  {
    title: "Odaklan",
    subtitle: "Odaklanmanıza yardımcı olacak sesler",
    sounds: [
      {
        id: 'timer',
        title: 'Saat Tıkırtısı',
        description: 'Geçen sürenin farkına varın',
        icon: Icons.Wind,
        color: '#9E9E9E',
        background: require('../../assets/images/clock.jpg'),
        isActive: false
      },
      {
        id: 'timer2',
        title: 'Saat Tıkırtısı 2',
        description: 'Geçen sürenin farkına varın',
        icon: Icons.Wind,
        color: '#E91E63',
        background: require('../../assets/images/clock2.jpg'),
        isActive: false
      },
      {
        id: 'envcafe',
        title: 'Ortam (Kafe)',
        description: 'Kafe ortamında çalışın',
        icon: Icons.Wind,
        color: '#795548',
        background: require('../../assets/images/cafe.jpg'),
        isActive: false
      },
      {
        id: 'envlib',
        title: 'Ortam (Kütüphane)',
        description: 'Kütüphane ortamında çalışın',
        icon: Icons.Wind,
        color: '#795548',
        background: require('../../assets/images/library.jpg'),
        isActive: false
      },
    ]
  },
  {
    title: "Renkli gürültü",
    subtitle: "Seslerin dijital dünyasına dalın",
    sounds: [
      {
        id: 'meditation',
        title: 'Meditasyon',
        description: 'Meditasyon frekanslı ses',
        icon: Icons.Wind,
        color: '#9E9E9E',
        background: require('../../assets/images/meditation.jpg'),
        isActive: false
      },
      {
        id: 'lullaby',
        title: 'Ninni',
        description: 'Yumuşak frekans sesi',
        icon: Icons.Wind,
        color: '#E91E63',
        background: require('../../assets/images/lullaby.jpg'),
        isActive: false
      },
      {
        id: 'dream',
        title: 'Rüya',
        description: 'Derin frekans sesi',
        icon: Icons.Wind,
        color: '#795548',
        background: require('../../assets/images/dream.jpg'),
        isActive: false
      },
    ]
  }
];

export default function SleepScreen() {
  const { theme } = useTheme();
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Medium': Inter_500Medium,
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSounds, setActiveSounds] = useState(new Set<string>());
  const [sounds, setSounds] = useState<{ [key: string]: Audio.Sound }>({});
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<Sound | null>(null);
  const [activeTimer, setActiveTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const translateY = useRef(new Animated.Value(0)).current;
  const allSounds = useMemo(() => CATEGORIES.flatMap(category => category.sounds), []);

  // Timer options in seconds
  const timerOptions = useMemo(() => [
    { label: '5 dk', value: 5 * 60 },
    { label: '10 dk', value: 10 * 60 },
    { label: '15 dk', value: 15 * 60 },
  ], []);

  const formatTime = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const resetAllSounds = useCallback(async () => {
    if (currentSound) {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    }
    setActiveSound(null);
    setCurrentSound(null);
    setIsPlaying(false);
    setSelectedSound(null);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    setActiveTimer(null);
    setRemainingTime(null);
  }, [currentSound, timerInterval]);

  const startTimer = useCallback((seconds: number) => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    setActiveTimer(seconds);
    setRemainingTime(seconds);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          resetAllSounds();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimerInterval(interval);
  }, [timerInterval, resetAllSounds]);

  const cancelTimer = useCallback(() => {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setActiveTimer(null);
    setRemainingTime(null);
    setTimerInterval(null);
  }, [timerInterval]);

  const handleSoundChange = useCallback(async (newSound: Sound) => {
    try {
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: newSound.soundUrl });
      await soundObject.setIsLoopingAsync(true);
      await soundObject.playAsync();

      setCurrentSound(soundObject);
      setSelectedSound(newSound);
      setActiveSound(newSound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error changing sound:', error);
      Alert.alert('Hata', 'Ses dosyası yüklenirken bir hata oluştu.');
    }
  }, [currentSound]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      translateY.setValue(gesture.dy);
    },
    onPanResponderRelease: (_, gesture) => {
      const SWIPE_THRESHOLD = 100;
      const { height } = Dimensions.get('window');

      if (Math.abs(gesture.dy) > SWIPE_THRESHOLD && selectedSound) {
        const currentIndex = allSounds.findIndex(s => s.id === selectedSound.id);

        if (currentIndex !== -1) {
          let nextIndex;
          if (gesture.dy > 0) {
            nextIndex = (currentIndex - 1 + allSounds.length) % allSounds.length;
          } else {
            nextIndex = (currentIndex + 1) % allSounds.length;
          }

          const newSound = allSounds[nextIndex];

          Animated.timing(translateY, {
            toValue: gesture.dy > 0 ? height : -height,
            duration: 200,
            useNativeDriver: true,
          }).start(async () => {
            await handleSoundChange(newSound);
            translateY.setValue(gesture.dy > 0 ? -height : height);
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 40,
              friction: 7
            }).start();
          });
        }
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 40,
          friction: 7
        }).start();
      }
    }
  }), [translateY, selectedSound, allSounds, handleSoundChange]);

  useEffect(() => {
    return () => {
      Object.values(sounds).forEach(async (sound) => {
        await sound?.unloadAsync();
      });
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [sounds, timerInterval]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // AppState için ref
  const appState = useRef(AppState.currentState);

  // İçerik yenileme fonksiyonu
  const refreshContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(CONTENT_JSON_URL, {
        cache: 'no-store', // Cache'i devre dışı bırak
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) throw new Error('Content fetch failed');
      
      const data = await response.json();
      const processedCategories = data.categories.map(category => ({
        ...category,
        sounds: category.sounds.map(sound => ({
          ...sound,
          isActive: false
        }))
      }));
      
      setCategories(processedCategories);
    } catch (error) {
      console.error('Error loading content:', error);
      setError('İçerik yüklenirken bir hata oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sayfa fokuslandığında içeriği yenile
  useFocusEffect(
    useCallback(() => {
      refreshContent();
    }, [refreshContent])
  );

  // App state değiştiğinde içeriği yenile
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        refreshContent();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refreshContent]);

  // Component mount olduğunda içeriği yükle
  useEffect(() => {
    refreshContent();
  }, [refreshContent]);

  const handleSoundPress = useCallback(async (sound: Sound) => {
    try {
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: sound.soundUrl });
      await soundObject.setIsLoopingAsync(true);
      await soundObject.playAsync();

      setCurrentSound(soundObject);
      setSelectedSound(sound);
      setActiveSound(sound);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Hata', 'Ses dosyası yüklenirken bir hata oluştu.');
    }
  }, [currentSound]);

  const togglePlayback = useCallback(async () => {
    if (!currentSound) return;

    try {
      if (isPlaying) {
        await currentSound.pauseAsync();
      } else {
        await currentSound.playAsync();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  }, [currentSound, isPlaying]);

  if (!fontsLoaded) {
    return null;
  }

  // İkon mapping fonksiyonu güncellendi
  const getIconComponent = (iconName: string): IconComponentType => {
    return Icons[iconName as keyof typeof Icons] || Icons.Cloud;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <StatusBar 
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <View style={styles.container}>
        <ImageBackground
          source={activeSound?.background ? { uri: activeSound.background } : require('../../assets/images/night.jpg')}
          style={StyleSheet.absoluteFill}
          blurRadius={theme === 'light' ? 60 : 80}
        >
          <View style={[
            StyleSheet.absoluteFill, 
            { 
              backgroundColor: theme === 'light' 
                ? 'rgba(255, 255, 255, 0.3)' 
                : theme === 'amoled'
                  ? 'rgba(0, 0, 0, 0.8)'
                  : 'rgba(0, 0, 0, 0.7)'
            }
          ]} />
        </ImageBackground>

        <ScrollView style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>İçerik yükleniyor...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={refreshContent}>
                <Text style={styles.retryButtonText}>Tekrar Dene</Text>
              </TouchableOpacity>
            </View>
          ) : (
            categories.map((category, index) => (
              <View key={index} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soundsRow}>
                  {category.sounds.map((sound) => {
                    const IconComponent = getIconComponent(sound.icon);
                    return (
                      <TouchableOpacity
                        key={sound.id}
                        style={[
                          styles.soundCard,
                          activeSound?.id === sound.id && styles.activeSoundCard,
                          sound === category.sounds[category.sounds.length - 1] && styles.lastSoundCard
                        ]}
                        onPress={() => handleSoundPress(sound)}
                      >
                        <ImageBackground
                          source={{ uri: sound.background }}
                          style={styles.soundCardBackground}
                          imageStyle={styles.soundCardImage}
                        >
                          <LinearGradient
                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                            style={styles.soundCardOverlay}
                          >
                            {activeSound?.id === sound.id && (
                              <View style={styles.activeCardControls}>
                                <TouchableOpacity
                                  style={styles.cardControlButton}
                                  onPress={togglePlayback}
                                >
                                  {isPlaying ? (
                                    <Icons.Pause size={24} color="#fff" />
                                  ) : (
                                    <Icons.Play size={24} color="#fff" />
                                  )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.cardControlButton}
                                  onPress={() => {
                                    if (currentSound) {
                                      currentSound.stopAsync();
                                      currentSound.unloadAsync();
                                    }
                                    setActiveSound(null);
                                    setCurrentSound(null);
                                    setIsPlaying(false);
                                  }}
                                >
                                  <Icons.X size={24} color="#fff" />
                                </TouchableOpacity>
                              </View>
                            )}
                            <View style={styles.soundCardContent}>
                              <IconComponent />
                              <Text style={styles.soundCardTitle}>{sound.title}</Text>
                            </View>
                          </LinearGradient>
                        </ImageBackground>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            ))
          )}
        </ScrollView>

        {activeSound && (
          <>
            <View style={styles.floatingControls}>
              <ImageBackground
                source={typeof activeSound.background === 'string' ? { uri: activeSound.background } : activeSound.background}
                style={StyleSheet.absoluteFill}
                blurRadius={25}
              >
                <BlurView 
                  intensity={theme === 'light' ? 60 : 80} 
                  tint={theme === 'light' ? 'light' : 'dark'} 
                  style={StyleSheet.absoluteFill}
                >
                  <View style={[
                    StyleSheet.absoluteFill, 
                    { backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)' }
                  ]} />
                </BlurView>
              </ImageBackground>
              <View style={styles.controlsContent}>

                <TouchableOpacity
                  style={styles.playbarControl}
                  onPress={() => {
                    if (!remainingTime) {
                      startTimer(300); // Default to 5 minutes (300 seconds)
                    } else {
                      cancelTimer();
                    }
                  }}
                >
                  <Icons.Timer size={24} color="#fff" />
                  {remainingTime && (
                    <View style={styles.timerBadge}>
                      <Text style={styles.timerBadgeText}>{formatTime(remainingTime)}</Text>
                    </View>
                  )}
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.playbarControl}
                  onPress={togglePlayback}
                >
                  {isPlaying ? (
                    <Icons.Pause size={24} color="#fff" />
                  ) : (
                    <Icons.Play size={24} color="#fff" />
                  )}
                </TouchableOpacity>


                <TouchableOpacity
                  style={styles.playbarControl}
                  onPress={() => {
                    if (currentSound) {
                      currentSound.stopAsync();
                      currentSound.unloadAsync();
                    }
                    setActiveSound(null);
                    setCurrentSound(null);
                    setIsPlaying(false);
                    cancelTimer();
                  }}
                >
                  <Icons.X size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.floatingPlaybar}>
              <ImageBackground
                source={typeof activeSound.background === 'string' ? { uri: activeSound.background } : activeSound.background}
                style={StyleSheet.absoluteFill}
                blurRadius={25}
              >
                <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
                </BlurView>
              </ImageBackground>
              <TouchableOpacity
                style={styles.playbarContent}
                onPress={() => setSelectedSound(activeSound)}
              >
                <ImageBackground
                  source={typeof activeSound.background === 'string' ? { uri: activeSound.background } : activeSound.background}
                  style={styles.playbarImage}
                  imageStyle={{ borderRadius: 8 }}
                />
                <View style={styles.playbarInfo}>
                  <Text style={styles.playbarTitle}>{activeSound.title}</Text>
                  <Text style={styles.playbarDescription}>{activeSound.description}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </>
        )}

        <Modal
          visible={selectedSound !== null}
          animationType="slide"
          transparent={false}
          presentationStyle="fullScreen"
          onRequestClose={() => setSelectedSound(null)}
        >
          {selectedSound && (
            <View style={styles.modalContainer}>
              <ImageBackground
                source={typeof selectedSound.background === 'string' ? { uri: selectedSound.background } : selectedSound.background}
                style={StyleSheet.absoluteFill}
              >
                <BlurView intensity={theme === 'light' ? 40 : 20} tint={theme === 'light' ? 'light' : 'dark'} style={StyleSheet.absoluteFill} />
                <LinearGradient
                  colors={theme === 'light' 
                    ? ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.8)']
                    : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                  style={styles.modalOverlay}
                >
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedSound(null)}
                  >
                    <Icons.ArrowLeft size={24} color="#fff" />
                  </TouchableOpacity>

                  <View style={styles.modalInfo}>
                    <Text style={styles.modalTitle}>{selectedSound.title}</Text>
                    <Text style={styles.modalDescription}>{selectedSound.description}</Text>

                    <View style={styles.playbackControls}>
                      <TouchableOpacity
                        style={styles.playPauseButton}
                        onPress={togglePlayback}
                      >
                        {isPlaying ? (
                          <Icons.Pause size={32} color="#fff" />
                        ) : (
                          <Icons.Play size={32} color="#fff" />
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.timerSection}>
                      <Text style={styles.timerTitle}>
                        {remainingTime ? 'Kalan Süre' : 'Zamanlayıcı'}
                      </Text>

                      {!remainingTime ? (
                        <View style={styles.timerOptions}>
                          {timerOptions.map((option) => (
                            <TouchableOpacity
                              key={option.value}
                              style={[
                                styles.timerButton,
                                {
                                  backgroundColor: activeTimer === option.value ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                                  borderColor: activeTimer === option.value ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                                },
                              ]}
                              onPress={() => startTimer(option.value)}
                            >
                              <Text
                                style={[
                                  styles.timerButtonText,
                                  { color: activeTimer === option.value ? '#fff' : 'rgba(255, 255, 255, 0.7)' },
                                ]}
                              >
                                {option.label}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ) : (
                        <View style={styles.timerDisplay}>
                          <Text style={styles.timerCountdown}>
                            {formatTime(remainingTime)}
                          </Text>
                          <TouchableOpacity
                            style={styles.timerCancel}
                            onPress={cancelTimer}
                          >
                            <Text style={styles.timerCancelText}>İptal Et</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </ImageBackground>
            </View>
          )}
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  categorySection: {
    marginBottom: 30,
  },
  categoryHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
    marginTop: 40,
  },
  categorySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
  },
  soundsRow: {
    paddingLeft: 20,
  },
  soundCard: {
    width: width * 0.7,
    height: height * 0.25,
    marginRight: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  lastSoundCard: {
    marginRight: 40, // Ensure separation from the right edge
  },
  soundCardBackground: {
    width: '100%',
    height: '100%',
  },
  soundCardImage: {
    borderRadius: 20,
  },
  soundCardOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 15,
  },
  soundCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 0,
    marginLeft: -12,
  },
  soundCardTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'left',
    marginLeft: 4,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalOverlay: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  modalInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  modalDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
  },
  playbackControls: {
    alignItems: 'center',
    marginTop: 30,
  },
  playPauseButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginTop: 20,
  },
  activeSoundCard: {
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
  },
  activeCardControls: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    gap: 8,
  },
  cardControlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingControls: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: 170,
    height: 56,
    borderRadius: 50,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  controlsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: '100%',
  },
  floatingPlaybar: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 8,
  },
  playbarImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  playbarInfo: {
    flex: 1,
    marginLeft: 4,
  },
  playbarTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'left',
    marginLeft: 0,
  },
  playbarDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
    textAlign: 'left',
    marginLeft: 0,
  },
  playbarControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  timerSection: {
    alignItems: 'center',
    marginTop: 30,
  },
  timerTitle: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Inter-SemiBold',
  },
  timerOptions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  timerButton: {
    width: 80,
    height: 40,
    borderWidth: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  timerDisplay: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerCountdown: {
    color: '#fff',
    fontSize: 48,
    fontFamily: 'Inter-SemiBold',
  },
  timerCancel: {
    marginTop: 10,
    padding: 8,
    borderRadius: 16,
  },
  timerCancelText: {
    color: '#FF5252',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  timerBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF5252',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  timerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
});