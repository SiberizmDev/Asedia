import React from 'react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Modal, ImageBackground } from 'react-native';
import { Audio } from 'expo-av';
import { Cloud, Moon, Wind, Star, Music2, BedDouble, Clock, Flame, Play, Pause, X, ChevronDown, Volume2, Book } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import Slider from '@react-native-community/slider';

type MainSound = {
  id: string;
  title: string;
  icon: any;
  color: string;
  file: any;
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
  },
  {
    id: 'forest',
    title: 'Orman',
    icon: Moon,
    color: '#4CAF50',
    file: require('../../assets/sounds/nature.mp3'),
  },
  {
    id: 'ocean',
    title: 'Okyanus',
    icon: Wind,
    color: '#2196F3',
    file: require('../../assets/sounds/ocean.mp3'),
  },
  {
    id: 'wind',
    title: 'Rüzgar',
    icon: Wind,
    color: '#607D8B',
    file: require('../../assets/sounds/wind.mp3'),
  },
  {
    id: 'campfire',
    title: 'Kamp Ateşi',
    icon: Flame,
    color: '#FF5722',
    file: require('../../assets/sounds/campfire.mp3'),
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
    minInterval: 15000,
    maxInterval: 45000,
  }
];

export default function RelaxScreen() {
  const [activeMainSound, setActiveMainSound] = useState<string | null>(null);
  const [activeSubSounds, setActiveSubSounds] = useState(new Set<string>());
  const [mainSound, setMainSound] = useState<Audio.Sound | null>(null);
  const [subSoundTimers, setSubSoundTimers] = useState<{ [key: string]: NodeJS.Timeout }>({});
  const [isMainSoundPlaying, setIsMainSoundPlaying] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [volumes, setVolumes] = useState<SoundVolume>({});
  const [subSounds, setSubSounds] = useState<{ [key: string]: Audio.Sound }>({});

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

      const subSound = new Audio.Sound();
      await subSound.loadAsync(sound.file);
      await subSound.setVolumeAsync(volumes[sound.id] || 0.3);
      await subSound.playAsync();

      // Store the sound object in state
      setSubSounds(prev => ({ ...prev, [sound.id]: subSound }));

      subSound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await subSound.unloadAsync();
          setSubSounds(prev => {
            const newSubSounds = { ...prev };
            delete newSubSounds[sound.id];
            return newSubSounds;
          });

          // Schedule next play after the current sound finishes
          if (activeSubSounds.has(sound.id) && isMainSoundPlaying) {
            scheduleNextPlay(sound);
          }
        }
      });
    } catch (error) {
      console.error('Error playing sub sound:', error);
    }
  }, [isMainSoundPlaying, volumes, subSounds, activeSubSounds, scheduleNextPlay]);

  const scheduleNextPlay = useCallback((sound: SubSound) => {
    if (!isMainSoundPlaying) return;

    const interval = Math.random() * (sound.maxInterval - sound.minInterval) + sound.minInterval;
    console.log(`Scheduling next play for ${sound.id} in ${interval}ms`);

    const timer = setTimeout(() => {
      if (activeSubSounds.has(sound.id) && isMainSoundPlaying) {
        console.log(`Playing ${sound.id} after interval`);
        playSubSound(sound);
      }
    }, interval);

    setSubSoundTimers(prev => ({ ...prev, [sound.id]: timer }));
  }, [activeSubSounds, isMainSoundPlaying, playSubSound]);

  const toggleSubSound = useCallback((sound: SubSound) => {
    const newActiveSubSounds = new Set(activeSubSounds);

    if (activeSubSounds.has(sound.id)) {
      // Stop sub sound
      if (subSoundTimers[sound.id]) {
        clearTimeout(subSoundTimers[sound.id]);
        const newTimers = { ...subSoundTimers };
        delete newTimers[sound.id];
        setSubSoundTimers(newTimers);
      }
      // Unload the sound
      if (subSounds[sound.id]) {
        subSounds[sound.id].unloadAsync();
        setSubSounds(prev => {
          const newSubSounds = { ...prev };
          delete newSubSounds[sound.id];
          return newSubSounds;
        });
      }
      newActiveSubSounds.delete(sound.id);
    } else {
      newActiveSubSounds.add(sound.id);
      if (isMainSoundPlaying) {
        playSubSound(sound);
      }
    }

    setActiveSubSounds(newActiveSubSounds);
  }, [activeSubSounds, subSoundTimers, playSubSound, isMainSoundPlaying, subSounds]);

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
              scheduleNextPlay(subSound);
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
  }, [activeMainSound, activeSubSounds, playMainSound, mainSound, subSoundTimers, subSounds, playSubSound, scheduleNextPlay]);

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

  return (
    <LinearGradient
      colors={['#121212', '#121212']}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Ana Sesler</Text>
        <View style={styles.mainSounds}>
          {MAIN_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundButton,
                activeMainSound === sound.id && { backgroundColor: sound.color }
              ]}
              onPress={() => {
                if (activeMainSound === sound.id) {
                  toggleMainSound();
                } else {
                  playMainSound(sound);
                }
              }}
            >
              <sound.icon
                size={24}
                color={activeMainSound === sound.id ? '#fff' : '#fff'}
              />
              <Text style={styles.soundText}>{sound.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Alt Sesler</Text>
        <View style={styles.subSounds}>
          {SUB_SOUNDS.map((sound) => (
            <TouchableOpacity
              key={sound.id}
              style={[
                styles.soundButton,
                activeSubSounds.has(sound.id) && { backgroundColor: sound.color }
              ]}
              onPress={() => toggleSubSound(sound)}
            >
              <sound.icon
                size={24}
                color={activeSubSounds.has(sound.id) ? '#fff' : '#fff'}
              />
              <Text style={styles.soundText}>{sound.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {activeMainSound && (
        <>
          <TouchableOpacity
            onPress={() => setIsModalVisible(true)}
            style={styles.playbackBar}
          >
            <View style={styles.playbackInfo}>
              <Text style={styles.playbackTitle}>
                {MAIN_SOUNDS.find(s => s.id === activeMainSound)?.title}
              </Text>
              <Text style={styles.playbackSubtitle}>
                {activeSubSounds.size} alt ses aktif
              </Text>
            </View>
            <View style={styles.playbackControls}>
              <TouchableOpacity
                style={styles.playbackButton}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleMainSound();
                }}
              >
                {isMainSoundPlaying ? (
                  <Pause size={24} color="#fff" />
                ) : (
                  <Play size={24} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.playbackButton, styles.stopButton]}
                onPress={(e) => {
                  e.stopPropagation();
                  resetAllSounds();
                }}
              >
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <Modal
            visible={isModalVisible}
            animationType="slide"
            presentationStyle="fullScreen"
          >
            <ImageBackground
              source={require('../../assets/images/forest.jpg')}
              style={styles.modalBackground}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
                style={styles.modalContent}
              >
                <TouchableOpacity
                  style={styles.closeModalButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <ChevronDown size={24} color="#fff" />
                </TouchableOpacity>

                <View style={styles.modalPlaybackInfo}>
                  <Text style={styles.modalTitle}>
                    {MAIN_SOUNDS.find(s => s.id === activeMainSound)?.title}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {activeSubSounds.size} alt ses aktif
                  </Text>

                  <View style={styles.volumeControls}>
                    <View style={styles.volumeSection}>
                      <Text style={styles.volumeTitle}>Ana Ses</Text>
                      <View style={styles.volumeSlider}>
                        <Volume2 size={20} color="#fff" />
                        <Slider
                          style={{ flex: 1, marginLeft: 10 }}
                          minimumValue={0}
                          maximumValue={1}
                          value={volumes[activeMainSound || ''] || 0.5}
                          onValueChange={async (value: number) => {
                            if (mainSound) {
                              await mainSound.setVolumeAsync(value);
                              setVolumes(prev => ({ ...prev, [activeMainSound || '']: value }));
                            }
                          }}
                          minimumTrackTintColor="#fff"
                          maximumTrackTintColor="rgba(255,255,255,0.3)"
                          thumbTintColor="#fff"
                        />
                      </View>
                    </View>

                    {activeSubSounds.size > 0 && (
                      <View style={styles.volumeSection}>
                        <Text style={styles.volumeTitle}>Alt Sesler</Text>
                        {Array.from(activeSubSounds).map(soundId => {
                          const sound = SUB_SOUNDS.find(s => s.id === soundId);
                          if (!sound) return null;

                          return (
                            <View key={sound.id} style={styles.volumeSlider}>
                              <sound.icon size={20} color="#fff" />
                              <Slider
                                style={{ flex: 1, marginLeft: 10 }}
                                minimumValue={0}
                                maximumValue={1}
                                value={volumes[sound.id] || 0.3}
                                onValueChange={(value: number) => {
                                  setVolumes(prev => ({ ...prev, [sound.id]: value }));
                                }}
                                minimumTrackTintColor="#fff"
                                maximumTrackTintColor="rgba(255,255,255,0.3)"
                                thumbTintColor="#fff"
                              />
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  <View style={styles.modalControls}>
                    <TouchableOpacity
                      style={styles.modalPlaybackButton}
                      onPress={toggleMainSound}
                    >
                      {isMainSoundPlaying ? (
                        <Pause size={32} color="#fff" />
                      ) : (
                        <Play size={32} color="#fff" />
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalPlaybackButton, styles.modalStopButton]}
                      onPress={resetAllSounds}
                    >
                      <X size={32} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </Modal>
        </>
      )}
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');
const buttonSize = (width - 40 - 20) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80, // Add padding for playback bar
  },
  sectionTitle: {
    color: '#fff',
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
    backgroundColor: 'rgba(42, 42, 42, 0.8)',
    borderRadius: buttonSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  playbackBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  playbackInfo: {
    flex: 1,
  },
  playbackControls: {
    flexDirection: 'row',
    gap: 10,
  },
  playbackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  playbackTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  playbackSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginTop: 4,
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
  closeModalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  modalPlaybackInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 100,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 32,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginTop: 8,
    textAlign: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStopButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  volumeControls: {
    width: '100%',
    marginTop: 40,
    marginBottom: 40,
  },
  volumeSection: {
    marginBottom: 20,
  },
  volumeTitle: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginBottom: 15,
  },
  volumeSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});