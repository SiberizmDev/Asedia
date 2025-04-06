import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Modal, Dimensions, PanResponder, Animated, Platform, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { Cloud, Moon, Wind, Star, Music2, BedDouble, Clock, ArrowLeft, Leaf, Tent, Play, Pause, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { BlurView } from 'expo-blur';

const SOUND_URLS = {
  rain: require('../../assets/sounds/rain.mp3'),
  night: require('../../assets/sounds/night-ambiance.mp3'),
  wind: require('../../assets/sounds/wind.mp3'),
  stars: require('../../assets/sounds/stars.mp3'),
  lullaby: require('../../assets/sounds/lullaby.mp3'),
  dream: require('../../assets/sounds/dream.mp3'),
  timer: require('../../assets/sounds/timer.mp3'),
  space: require('../../assets/sounds/space.mp3'),
  calm: require('../../assets/sounds/bamboo.mp3'),
  grove: require('../../assets/sounds/wind.mp3'),
  campfire: require('../../assets/sounds/campfire.mp3')
} as const;

type SoundId = keyof typeof SOUND_URLS;

interface Sound {
  id: SoundId;
  title: string;
  description: string;
  icon: any;
  color: string;
  background: any;
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
        title: 'Yaz sahili',
        description: 'Dalgaların huzur veren sesi',
        icon: Cloud,
        color: '#4CAF50',
        background: require('../../assets/images/forest.jpg'),
        isActive: false
      },
      {
        id: 'grove',
        title: 'Sabah güneşi',
        description: 'Ormanın dinlendirici sesleri',
        icon: Leaf,
        color: '#4CAF50',
        background: require('../../assets/images/night.jpg'),
        isActive: false
      },
      {
        id: 'campfire',
        title: 'Gece kampı',
        description: 'Kamp ateşinin çıtırtısı',
        icon: Tent,
        color: '#FF5722',
        background: require('../../assets/images/campfire.jpg'),
        isActive: false
      },
    ]
  },
  {
    title: "Müzik",
    subtitle: "Ruha dokunan melodiler",
    sounds: [
      {
        id: 'space',
        title: 'Uzay yolculuğu',
        description: 'Uzayın derinliklerinden',
        icon: Star,
        color: '#9C27B0',
        background: require('../../assets/images/space.jpg'),
        isActive: false
      },
      {
        id: 'stars',
        title: 'Umut',
        description: 'Huzur veren melodiler',
        icon: Music2,
        color: '#2196F3',
        background: require('../../assets/images/stars.jpg'),
        isActive: false
      },
      {
        id: 'night',
        title: 'Ay ışığı',
        description: 'Sakin gece melodileri',
        icon: Moon,
        color: '#607D8B',
        background: require('../../assets/images/night.jpg'),
        isActive: false
      },
    ]
  },
  {
    title: "Renkli gürültü",
    subtitle: "Seslerin dijital dünyasına dalın",
    sounds: [
      {
        id: 'wind',
        title: 'Beyaz gürültü',
        description: 'Sabit frekanslı ses',
        icon: Wind,
        color: '#9E9E9E',
        background: require('../../assets/images/forest.jpg'),
        isActive: false
      },
      {
        id: 'lullaby',
        title: 'Pembe gürültü',
        description: 'Yumuşak frekans sesi',
        icon: Wind,
        color: '#E91E63',
        background: require('../../assets/images/forest.jpg'),
        isActive: false
      },
      {
        id: 'dream',
        title: 'Gri gürültü',
        description: 'Derin frekans sesi',
        icon: Wind,
        color: '#795548',
        background: require('../../assets/images/forest.jpg'),
        isActive: false
      },
    ]
  }
];

export default function SleepScreen() {
  const [activeSounds, setActiveSounds] = useState(new Set<SoundId>());
  const [sounds, setSounds] = useState<{ [key in SoundId]?: Audio.Sound }>({});
  const [currentMix, setCurrentMix] = useState('');
  const [currentBackground, setCurrentBackground] = useState<any>(null);
  const [selectedSound, setSelectedSound] = useState<Sound | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nextSound, setNextSound] = useState<Sound | null>(null);
  const [activeSound, setActiveSound] = useState<Sound | null>(null);
  
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Create a flat array of all sounds
  const allSounds = useRef(CATEGORIES.flatMap(category => category.sounds)).current;

  const handleSoundChange = async (newSound: Sound) => {
    try {
      // Stop and unload current sound
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      // Create and load new sound
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(SOUND_URLS[newSound.id]);
      await soundObject.setIsLoopingAsync(true);
      await soundObject.playAsync();
      
      // Update states
      setCurrentSound(soundObject);
      setSelectedSound(newSound);
      setActiveSound(newSound);
      setIsPlaying(true);

    } catch (error) {
      console.error('Error changing sound:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        translateY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        const SWIPE_THRESHOLD = 100;
        
        if (Math.abs(gesture.dy) > SWIPE_THRESHOLD && selectedSound) {
          const currentIndex = allSounds.findIndex(s => s.id === selectedSound.id);
          
          if (currentIndex !== -1) {
            let nextIndex;
            if (gesture.dy > 0) { // Swipe down - previous
              nextIndex = (currentIndex - 1 + allSounds.length) % allSounds.length;
            } else { // Swipe up - next
              nextIndex = (currentIndex + 1) % allSounds.length;
            }

            const newSound = allSounds[nextIndex];
            
            // Animate out current content
            Animated.timing(translateY, {
              toValue: gesture.dy > 0 ? height : -height,
              duration: 200,
              useNativeDriver: true,
            }).start(async () => {
              // Change sound immediately
              await handleSoundChange(newSound);
              
              // Reset position and animate in new content
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
          // If not swiped far enough, spring back to center
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7
          }).start();
        }
      }
    })
  ).current;

  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-SemiBold': Inter_600SemiBold,
  });

  useEffect(() => {
    return () => {
      Object.values(sounds).forEach(async (sound) => {
        await sound?.unloadAsync();
      });
    };
  }, []);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const handleSoundPress = async (sound: Sound) => {
    try {
      // Stop current sound if playing
      if (currentSound) {
        await currentSound.stopAsync();
        await currentSound.unloadAsync();
      }

      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(SOUND_URLS[sound.id]);
      await soundObject.setIsLoopingAsync(true);
      await soundObject.playAsync();
      
      setCurrentSound(soundObject);
      setSelectedSound(sound);
      setActiveSound(sound);
      setIsPlaying(true);

      // Update categories to set isActive
      const updatedCategories = CATEGORIES.map(category => ({
        ...category,
        sounds: category.sounds.map(s => ({
          ...s,
          isActive: s.id === sound.id
        }))
      }));
      
      // You might want to update your state with updatedCategories here
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const togglePlayback = async () => {
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
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={activeSound?.background || require('../../assets/images/forest.jpg')}
        style={StyleSheet.absoluteFill}
        blurRadius={80}
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.7)' }]} />
      </ImageBackground>
      
      <ScrollView style={styles.content}>
        {CATEGORIES.map((category, index) => (
          <View key={index} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.title}</Text>
              <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.soundsRow}>
              {category.sounds.map((sound) => (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundCard,
                    activeSound?.id === sound.id && styles.activeSoundCard
                  ]}
                  onPress={() => handleSoundPress(sound)}
                >
                  <ImageBackground
                    source={sound.background}
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
                              <Pause size={24} color="#fff" />
                            ) : (
                              <Play size={24} color="#fff" />
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
                            <X size={24} color="#fff" />
                          </TouchableOpacity>
                        </View>
                      )}
                      <Text style={styles.soundCardTitle}>{sound.title}</Text>
                    </LinearGradient>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {activeSound && (
        <>
          <View style={styles.floatingControls}>
            <ImageBackground
              source={activeSound.background}
              style={StyleSheet.absoluteFill}
              blurRadius={25}
            >
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
              </BlurView>
            </ImageBackground>
            <View style={styles.controlsContent}>
              <TouchableOpacity
                style={styles.playbarControl}
                onPress={togglePlayback}
              >
                {isPlaying ? (
                  <Pause size={24} color="#fff" />
                ) : (
                  <Play size={24} color="#fff" />
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
                }}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.floatingPlaybar}>
            <ImageBackground
              source={activeSound.background}
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
                source={activeSound.background}
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
        onRequestClose={() => {
          setSelectedSound(null);
        }}
      >
        {selectedSound && (
          <View style={styles.modalContainer}>
            <ImageBackground
              source={selectedSound.background}
              style={StyleSheet.absoluteFill}
            >
              <BlurView intensity={20} style={StyleSheet.absoluteFill} />
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.modalOverlay}
              >
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedSound(null)}
                >
                  <ArrowLeft size={24} color="#fff" />
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
                        <Pause size={32} color="#fff" />
                      ) : (
                        <Play size={32} color="#fff" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}
      </Modal>
    </View>
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
  },
  categorySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
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
  soundCardTitle: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
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
    width: 112,
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
    gap: 8,
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
  },
  playbarImage: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  playbarInfo: {
    flex: 1,
  },
  playbarTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  playbarDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginTop: 2,
  },
  playbarControl: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});