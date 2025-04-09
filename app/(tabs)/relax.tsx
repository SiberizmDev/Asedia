import React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, ImageBackground, SafeAreaView, StatusBar } from 'react-native';
import { Audio } from 'expo-av';
import { Cloud, Moon, Wind, Star, Music2, BedDouble, Clock, Flame, Play, Pause, X, ChevronDown, Volume2, Book, ChevronUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_500Medium } from '@expo-google-fonts/inter';
import Slider from '@react-native-community/slider';
import { useTheme } from '../context/ThemeContext';

type MainSound = {
  id: string;
  title: string;
  icon: any;
  color: string;
  file: any;
  background: any;
};

type SubSound = {
  id: string;
  title: string;
  icon: any;
  color: string;
  file: any;
  minInterval: number;
  maxInterval: number;
};

interface SoundVolume {
  [key: string]: number;
}

const MAIN_SOUNDS: MainSound[] = [
  {
    id: 'rain',
    title: 'Yağmur',
    icon: Cloud,
    color: '#4CAF50',
    file: require('../../assets/sounds/rain.mp3'),
    background: require('../../assets/images/rained_grove.jpeg'),
  },
  {
    id: 'forest',
    title: 'Orman',
    icon: Moon,
    color: '#4CAF50',
    file: require('../../assets/sounds/grove.mp3'),
    background: require('../../assets/images/grove.jpg'),
  },
  {
    id: 'ocean',
    title: 'Okyanus',
    icon: Wind,
    color: '#2196F3',
    file: require('../../assets/sounds/ocean.mp3'),
    background: require('../../assets/images/ocean.jpg'),
  },
  {
    id: 'wind',
    title: 'Rüzgar',
    icon: Wind,
    color: '#607D8B',
    file: require('../../assets/sounds/wind.mp3'),
    background: require('../../assets/images/forest.jpg'),
  },
  {
    id: 'campfire',
    title: 'Kamp Ateşi',
    icon: Flame,
    color: '#FF5722',
    file: require('../../assets/sounds/campfire.mp3'),
    background: require('../../assets/images/campfire.jpg'),
  }
];

const SUB_SOUNDS: SubSound[] = [
  {
    id: 'thunder_1',
    title: 'Gök Gürültüsü 1',
    icon: Cloud,
    color: '#4CAF50',
    file: require('../../assets/sounds/alt_sounds/thunder/thunder-1.mp3'),
    minInterval: 1000,
    maxInterval: 2000,
  },
  {
    id: 'thunder_2',
    title: 'Gök Gürültüsü 2',
    icon: Cloud,
    color: '#4CAF50',
    file: require('../../assets/sounds/rain.mp3'),
    minInterval: 15000,
    maxInterval: 45000,
  },
  {
    id: 'birds',
    title: 'Kuşlar',
    icon: Moon,
    color: '#4CAF50',
    file: require('../../assets/sounds/birds.mp3'),
    minInterval: 5000,
    maxInterval: 15000,
  },
  {
    id: 'wind_2',
    title: 'Rüzgar 2',
    icon: Wind,
    color: '#607D8B',
    file: require('../../assets/sounds/wind-2.mp3'),
    minInterval: 10000,
    maxInterval: 30000,
  },
  {
    id: 'wind_3',
    title: 'Rüzgar 3',
    icon: Wind,
    color: '#607D8B',
    file: require('../../assets/sounds/wind-3.mp3'),
    minInterval: 15000,
    maxInterval: 45000,
  },
  {
    id: 'book_1',
    title: 'Kitap',
    icon: Book,
    color: '#607D8B',
    file: require('../../assets/sounds/alt_sounds/book/book-1.mp3'),
    minInterval: 5000,
    maxInterval: 10000,
  }
];

export default function RelaxScreen() {
  const { colors, theme } = useTheme();
  const [activeMainSound, setActiveMainSound] = useState<string | null>(null);
  const [activeSubSounds, setActiveSubSounds] = useState(new Set<string>());
  const [mainSound, setMainSound] = useState<Audio.Sound | null>(null);
  const [subSoundTimers, setSubSoundTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [isMainSoundPlaying, setIsMainSoundPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [volumes, setVolumes] = useState<SoundVolume>({});
  const [subSounds, setSubSounds] = useState<{ [key: string]: Audio.Sound }>({});

  const { width } = Dimensions.get('window');
  const buttonSize = (width - 40 - 20) / 3;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
      padding: 20,
      paddingBottom: 80,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      marginBottom: 15,
      marginTop: 20,
    },
    mainSounds: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 20,
    },
    subSounds: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    soundButton: {
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    soundText: {
      marginTop: 8,
      fontSize: 12,
      fontFamily: 'Inter-Regular',
    },
    floatingPlaybar: {
      position: 'absolute',
      bottom: 20,
      left: 20,
      right: 20,
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    playbarContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    playbarLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    coverImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    playbarInfo: {
      flex: 1,
    },
    playbarTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    playbarSubtitle: {
      fontSize: 13,
      marginTop: 4,
    },
    playbarRight: {
      flexDirection: 'row',
      gap: 8,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    modalContent: {
      flex: 1,
      padding: 20,
    },
    modalPlaybackInfo: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingBottom: 100,
    },
    modalTitle: {
      fontSize: 32,
      fontFamily: 'Inter-SemiBold',
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      marginTop: 8,
      textAlign: 'center',
    },
    volumeControls: {
      width: '100%',
      marginTop: 40,
      marginBottom: 40,
    },
    volumeSection: {
      marginBottom: 20,
    },
    volumeSlider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    modalControls: {
      flexDirection: 'row',
      gap: 20,
      marginTop: 40,
    },
    modalPlaybackButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalStopButton: {
      opacity: 0.8,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    volumeTitle: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      marginBottom: 8,
      color: colors.text,
    },
  });

  const loadMainSound = useCallback(async (sound: MainSound) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync(sound.file);
      await soundObject.setIsLoopingAsync(true);
      await soundObject.setVolumeAsync(0.5);
      return soundObject;
    } catch (error) {
      console.error('Error loading main sound:', error);
      return null;
    }
  }, []);

  const playMainSound = useCallback(async (sound: MainSound) => {
    try {
      // Stop and unload previous sound
      if (mainSound) {
        await mainSound.stopAsync();
        await mainSound.unloadAsync();
      }

      // Load and play new sound
      const soundObject = await loadMainSound(sound);
      if (soundObject) {
        await soundObject.playAsync();
        setMainSound(soundObject);
        setActiveMainSound(sound.id);
        setIsMainSoundPlaying(true);
      }
    } catch (error) {
      console.error('Error playing main sound:', error);
    }
  }, [loadMainSound, mainSound]);

  const playSubSound = useCallback(async (sound: SubSound) => {
    if (!isMainSoundPlaying) return;

    try {
      // Check if sound is already playing
      if (subSounds[sound.id]) {
        return;
      }

      console.log(`Playing ${sound.id}`);
      const subSound = new Audio.Sound();
      await subSound.loadAsync(sound.file);
      await subSound.setVolumeAsync(volumes[sound.id] || 0.3);
      await subSound.playAsync();

      // Store the sound object in state
      setSubSounds(prev => ({ ...prev, [sound.id]: subSound }));

      // Set up playback status update handler
      subSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          // Unload the current sound instance
          await subSound.unloadAsync();
          
          // Remove from active sounds
          setSubSounds(prev => {
            const newSubSounds = { ...prev };
            delete newSubSounds[sound.id];
            return newSubSounds;
          });
        }
      });

    } catch (error) {
      console.error('Error playing sub sound:', error);
    }
  }, [isMainSoundPlaying, volumes, subSounds]);

  // Effect to handle repeating sounds
  useEffect(() => {
    // Clean up previous intervals
    Object.values(subSoundTimers).forEach(timer => clearTimeout(timer));
    setSubSoundTimers({});

    // Set up new intervals for active sounds
    if (isMainSoundPlaying) {
      activeSubSounds.forEach(soundId => {
        const sound = SUB_SOUNDS.find(s => s.id === soundId);
        if (sound) {
          const timer = setInterval(() => {
            playSubSound(sound);
          }, 15000);
          
          setSubSoundTimers(prev => ({ ...prev, [soundId]: timer }));
        }
      });
    }

    // Cleanup function
    return () => {
      Object.values(subSoundTimers).forEach(timer => clearInterval(timer));
    };
  }, [isMainSoundPlaying, activeSubSounds]);

  const toggleSubSound = useCallback((sound: SubSound) => {
    setActiveSubSounds(prev => {
      const newSet = new Set(prev);
      
      if (newSet.has(sound.id)) {
        // Stop and cleanup the sound
        if (subSoundTimers[sound.id]) {
          clearInterval(subSoundTimers[sound.id]);
          setSubSoundTimers(prev => {
            const newTimers = { ...prev };
            delete newTimers[sound.id];
            return newTimers;
          });
        }
        if (subSounds[sound.id]) {
          subSounds[sound.id].unloadAsync();
          setSubSounds(prev => {
            const newSounds = { ...prev };
            delete newSounds[sound.id];
            return newSounds;
          });
        }
        newSet.delete(sound.id);
      } else {
        // Add and start playing if main sound is active
        newSet.add(sound.id);
        if (isMainSoundPlaying) {
          playSubSound(sound);
        }
      }
      
      return newSet;
    });
  }, [isMainSoundPlaying, subSounds, subSoundTimers, playSubSound]);

  // Configure audio session once when component mounts
  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error('Error setting up audio mode:', error);
      }
    };
    setupAudio();

    // Cleanup
    return () => {
      if (mainSound) {
        mainSound.unloadAsync();
      }
      Object.values(subSoundTimers).forEach(timer => clearTimeout(timer));
    };
  }, []);

  const resetAllSounds = useCallback(async () => {
    try {
      // Stop main sound
      if (mainSound) {
        await mainSound.stopAsync();
        await mainSound.unloadAsync();
        setMainSound(null);
      }

      // Stop and unload all sub sounds
      Object.values(subSounds).forEach(async (sound) => {
        await sound.stopAsync();
        await sound.unloadAsync();
      });
      setSubSounds({});

      // Clear all sub sound timers
      Object.values(subSoundTimers).forEach(timer => clearTimeout(timer));
      setSubSoundTimers({});

      // Reset all states
      setActiveMainSound(null);
      setIsMainSoundPlaying(false);
      setActiveSubSounds(new Set());
    } catch (error) {
      console.error('Error resetting sounds:', error);
    }
  }, [mainSound, subSounds, subSoundTimers]);

  const toggleMainSound = useCallback(async () => {
    if (!mainSound) return;

    try {
      const status = await mainSound.getStatusAsync();

      if (status.isLoaded) {
        if (status.isPlaying) {
          await mainSound.pauseAsync();
          setIsMainSoundPlaying(false);

          // Pause all sub sounds
          Object.values(subSoundTimers).forEach(timer => clearTimeout(timer));
          setSubSoundTimers({});

          // Stop all active sub sounds
          Object.values(subSounds).forEach(async (sound) => {
            await sound.stopAsync();
            await sound.unloadAsync();
          });
          setSubSounds({});
        } else {
          await mainSound.playAsync();
          setIsMainSoundPlaying(true);

          // Resume all active sub sounds
          activeSubSounds.forEach(subSoundId => {
            const subSound = SUB_SOUNDS.find(s => s.id === subSoundId);
            if (subSound) {
              playSubSound(subSound);
            }
          });
        }
      } else {
        // If sound is not loaded, reload it
        const currentSound = MAIN_SOUNDS.find(s => s.id === activeMainSound);
        if (currentSound) {
          await playMainSound(currentSound);
        }
      }
    } catch (error) {
      console.error('Error toggling main sound:', error);
      // Try to recover by reloading the sound
      const currentSound = MAIN_SOUNDS.find(s => s.id === activeMainSound);
      if (currentSound) {
        await playMainSound(currentSound);
      }
    }
  }, [activeMainSound, activeSubSounds, playMainSound, mainSound, subSoundTimers, subSounds, playSubSound]);

  // Update volume for active sub sounds
  useEffect(() => {
    const updateSubSoundVolumes = async () => {
      for (const [soundId, sound] of Object.entries(subSounds)) {
        try {
          await sound.setVolumeAsync(volumes[soundId] || 0.3);
        } catch (error) {
          console.error('Error updating sub sound volume:', error);
        }
      }
    };

    updateSubSoundVolumes();
  }, [volumes, subSounds]);

  // Cleanup sub sounds when component unmounts
  useEffect(() => {
    return () => {
      Object.values(subSounds).forEach(sound => {
        sound.unloadAsync();
      });
    };
  }, [subSounds]);

  const updateVolume = useCallback((soundId: string, value: number) => {
    setVolumes(prev => ({ ...prev, [soundId]: value }));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#FFFFFF' : colors.background[0] }]}>
      <StatusBar 
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'} 
        backgroundColor={theme === 'light' ? '#FFFFFF' : theme === 'amoled' ? '#000000' : '#121212'} 
        translucent 
      />
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ana Sesler</Text>
        <Text style={[styles.description, { color: colors.text }]}>Ortam seslerini oynatın</Text>
        <View style={styles.mainSounds}>
          {MAIN_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundButton,
                {
                  backgroundColor: activeMainSound === sound.id
                    ? `${sound.color}40`
                    : colors.cardBackground,
                  borderWidth: 1,
                  borderColor: activeMainSound === sound.id
                    ? sound.color
                    : 'transparent',
                },
              ]}
              onPress={() => {
                if (activeMainSound === sound.id) {
                  toggleMainSound();
                } else {
                  playMainSound(sound);
                }
              }}
            >
              {React.createElement(sound.icon, {
                size: 24,
                color: activeMainSound === sound.id ? sound.color : colors.text,
              })}
              <Text
                style={[
                  styles.soundText,
                  {
                    color: activeMainSound === sound.id ? sound.color : colors.text,
                  },
                ]}
              >
                {sound.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Alt Sesler</Text>
        <Text style={[styles.description, { color: colors.text }]}>Oynatmak için ana ses seçmelisiniz</Text>
        <View style={styles.subSounds}>
          {SUB_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundButton,
                {
                  backgroundColor: activeSubSounds.has(sound.id)
                    ? `${sound.color}40`
                    : colors.cardBackground,
                  borderWidth: 1,
                  borderColor: activeSubSounds.has(sound.id)
                    ? sound.color
                    : 'transparent',
                },
              ]}
              onPress={() => toggleSubSound(sound)}
            >
              {React.createElement(sound.icon, {
                size: 24,
                color: activeSubSounds.has(sound.id) ? sound.color : colors.text,
              })}
              <Text
                style={[
                  styles.soundText,
                  {
                    color: activeSubSounds.has(sound.id) ? sound.color : colors.text,
                  },
                ]}
              >
                {sound.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {activeMainSound && (
        <>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={[styles.floatingPlaybar, { backgroundColor: colors.cardBackground }]}
          >
            <View style={styles.playbarContent}>
              <View style={styles.playbarLeft}>
                <View style={[styles.coverImage, { backgroundColor: colors.primary }]}>
                  {isMainSoundPlaying ? (
                    <Pause size={24} color={colors.text} />
                  ) : (
                    <Play size={24} color={colors.text} />
                  )}
                </View>
                <View style={styles.playbarInfo}>
                  <Text style={[styles.playbarTitle, { color: colors.text }]}>
                    {MAIN_SOUNDS.find(s => s.id === activeMainSound)?.title}
                  </Text>
                  <Text style={[styles.playbarSubtitle, { color: colors.subText }]}>
                    {activeSubSounds.size} alt ses aktif
                  </Text>
                </View>
              </View>
              <View style={styles.playbarRight}>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(true)}
                  style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
                >
                  <ChevronUp size={24} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => resetAllSounds()}
                  style={[styles.iconButton, { backgroundColor: colors.cardBackground }]}
                >
                  <X size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>

          <Modal
            visible={isModalVisible}
            transparent={true}
            animationType="slide"
            presentationStyle="fullScreen"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <ImageBackground
              source={activeMainSound ? MAIN_SOUNDS.find(s => s.id === activeMainSound)?.background : require('../../assets/images/default.jpg')}
              style={styles.modalBackground}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.modalContent}
              >
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  style={[styles.closeButton, { backgroundColor: colors.cardBackground }]}
                >
                  <ChevronDown size={24} color={colors.text} />
                </TouchableOpacity>

                <View style={styles.modalPlaybackInfo}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {MAIN_SOUNDS.find(s => s.id === activeMainSound)?.title}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.subText }]}>
                    {activeSubSounds.size} alt ses aktif
                  </Text>

                  <View style={styles.volumeControls}>
                    <View style={styles.volumeSection}>
                      <Text style={[styles.volumeTitle, { color: colors.text }]}>Ana Ses</Text>
                      <View style={styles.volumeSlider}>
                        <Volume2 size={20} color={colors.text} />
                        <Slider
                          style={{ flex: 1, marginLeft: 10 }}
                          minimumValue={0}
                          maximumValue={1}
                          value={volumes[activeMainSound || ''] || 0.5}
                          onValueChange={async (value) => {
                            if (mainSound) {
                              await mainSound.setVolumeAsync(value);
                              setVolumes(prev => ({ ...prev, [activeMainSound || '']: value }));
                            }
                          }}
                          minimumTrackTintColor={colors.primary}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor={colors.primary}
                        />
                      </View>
                    </View>

                    {activeSubSounds.size > 0 && (
                      <View style={styles.volumeSection}>
                        <Text style={[styles.volumeTitle, { color: colors.text }]}>Alt Sesler</Text>
                        {Array.from(activeSubSounds).map(soundId => {
                          const sound = SUB_SOUNDS.find(s => s.id === soundId);
                          if (!sound) return null;

                          return (
                            <View key={sound.id} style={styles.volumeSlider}>
                              <sound.icon size={20} color={colors.text} />
                              <Slider
                                style={{ flex: 1, marginLeft: 10 }}
                                minimumValue={0}
                                maximumValue={1}
                                value={volumes[sound.id] || 0.3}
                                onValueChange={async (value) => {
                                  if (subSounds[sound.id]) {
                                    await subSounds[sound.id].setVolumeAsync(value);
                                    setVolumes(prev => ({ ...prev, [sound.id]: value }));
                                  }
                                }}
                                minimumTrackTintColor={colors.primary}
                                maximumTrackTintColor={colors.border}
                                thumbTintColor={colors.primary}
                              />
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalControls}>
                    <TouchableOpacity
                      style={[styles.modalPlaybackButton, { backgroundColor: colors.primary }]}
                      onPress={toggleMainSound}
                    >
                      {isMainSoundPlaying ? (
                        <Pause size={32} color={colors.text} />
                      ) : (
                        <Play size={32} color={colors.text} />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalPlaybackButton, styles.modalStopButton, { backgroundColor: colors.secondary }]}
                      onPress={resetAllSounds}
                    >
                      <X size={32} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}