import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/gameStore';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { BANNER_AD_UNIT_ID } from '../utils/ads';
import { initSounds } from '../utils/sounds';
import { BG, ACCENT, TEXT, TEXT_DIM } from '../constants/theme';
import { t } from '../i18n';
import { SUIT_SYMBOL } from '../game/cards';

type Props = { navigation: NativeStackNavigationProp<any> };

export function HomeScreen({ navigation }: Props) {
  const { start, bestSec } = useGameStore();

  function handlePlay() {
    start();
    navigation.navigate('Game');
  }

  function formatTime(sec: number): string {
    if (sec === 0) return '--:--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleArea}>
        <View style={styles.suitRow}>
          {(['S', 'H', 'D', 'C'] as const).map((s, i) => (
            <Text key={i} style={[styles.suitIcon, { color: s === 'H' || s === 'D' ? '#e02020' : '#ffffff' }]}>
              {SUIT_SYMBOL[s]}
            </Text>
          ))}
        </View>
        <Text style={styles.title}>{t.appName}</Text>
        <Text style={styles.subtitle}>Classic Card Game</Text>
      </View>

      <TouchableOpacity style={styles.playBtn} onPress={handlePlay} activeOpacity={0.8}>
        <Text style={styles.playBtnText}>{t.newGame}</Text>
      </TouchableOpacity>

      {bestSec > 0 && (
        <View style={styles.bestRow}>
          <Text style={styles.bestLabel}>{t.best}</Text>
          <Text style={styles.bestValue}>{formatTime(bestSec)}</Text>
        </View>
      )}
      <BannerAd unitId={BANNER_AD_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titleArea: {
    alignItems: 'center',
    marginBottom: 48,
  },
  suitRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  suitIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_DIM,
    marginTop: 6,
    letterSpacing: 2,
  },
  playBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 4,
  },
  playBtnText: {
    color: '#1a4a2e',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 32,
  },
  bestLabel: { color: TEXT_DIM, fontSize: 14 },
  bestValue: { color: TEXT, fontSize: 18, fontWeight: 'bold' },
});
