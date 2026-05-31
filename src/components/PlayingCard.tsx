import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, SUIT_SYMBOL, RANK_LABEL, isRed } from '../game/cards';
import { CARD_BG, CARD_BACK, CARD_BORDER, CARD_SELECTED, RED, BLACK } from '../constants/theme';

interface Props {
  card: Card;
  width: number;
  height: number;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: object;
}

export const PlayingCard = React.memo(function PlayingCard({
  card, width, height, selected, onPress, onLongPress, style,
}: Props) {
  const fontSize = Math.max(10, Math.floor(width * 0.28));
  const suitSize = Math.max(8, Math.floor(width * 0.22));

  if (!card.faceUp) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.9}
        style={[styles.card, { width, height, backgroundColor: CARD_BACK }, style]}
      >
        <View style={styles.backPattern} />
      </TouchableOpacity>
    );
  }

  const color = isRed(card.suit) ? RED : BLACK;
  const symbol = SUIT_SYMBOL[card.suit];
  const label = RANK_LABEL[card.rank];
  const borderColor = selected ? CARD_SELECTED : CARD_BORDER;
  const borderWidth = selected ? 2.5 : 1;

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        { width, height, backgroundColor: CARD_BG, borderColor, borderWidth },
        style,
      ]}
    >
      <View style={styles.topLeft}>
        <Text style={[styles.rankText, { fontSize, color }]}>{label}</Text>
        <Text style={[styles.suitText, { fontSize: suitSize, color }]}>{symbol}</Text>
      </View>
      <Text style={[styles.centerSuit, { fontSize: Math.floor(width * 0.4), color }]}>
        {symbol}
      </Text>
      <View style={styles.bottomRight}>
        <Text style={[styles.suitText, { fontSize: suitSize, color }]}>{symbol}</Text>
        <Text style={[styles.rankText, { fontSize, color }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    justifyContent: 'space-between',
    padding: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  backPattern: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#2a50a0',
    margin: 2,
    borderWidth: 1,
    borderColor: '#1a3080',
  },
  topLeft: {
    alignItems: 'flex-start',
  },
  bottomRight: {
    alignItems: 'flex-end',
    transform: [{ rotate: '180deg' }],
  },
  rankText: {
    fontWeight: 'bold',
    lineHeight: undefined,
  },
  suitText: {
    lineHeight: undefined,
  },
  centerSuit: {
    textAlign: 'center',
    opacity: 0.15,
    fontWeight: 'bold',
  },
});
