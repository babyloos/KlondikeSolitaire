import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Card } from '../game/cards';
import { PlayingCard } from './PlayingCard';
import { EMPTY_SLOT } from '../constants/theme';
import { Selection } from '../store/gameStore';

interface Props {
  cards: Card[];
  colIdx: number;
  cardW: number;
  cardH: number;
  selected: Selection | null;
  onTap: (colIdx: number, cardIdx: number) => void;
  onDoubleTap: (colIdx: number) => void;
}

const FACE_DOWN_OFFSET = 14;
const FACE_UP_OFFSET = 26;

export function TableauColumn({ cards, colIdx, cardW, cardH, selected, onTap, onDoubleTap }: Props) {
  // Calculate total column height
  let totalH = cardH;
  for (let i = 0; i < cards.length - 1; i++) {
    totalH += cards[i].faceUp ? FACE_UP_OFFSET : FACE_DOWN_OFFSET;
  }

  const isColSelected = selected?.area === 'tableau' && selected.colIdx === colIdx;

  if (cards.length === 0) {
    return (
      <TouchableOpacity
        style={[styles.emptySlot, { width: cardW, height: cardH }]}
        onPress={() => onTap(colIdx, 0)}
        activeOpacity={0.7}
      />
    );
  }

  return (
    <View style={{ width: cardW, height: totalH }}>
      {cards.map((card, idx) => {
        const isSelected = isColSelected && selected!.cardIdx <= idx;
        const offset = cards.slice(0, idx).reduce(
          (sum, c) => sum + (c.faceUp ? FACE_UP_OFFSET : FACE_DOWN_OFFSET),
          0
        );
        return (
          <PlayingCard
            key={card.id}
            card={card}
            width={cardW}
            height={cardH}
            selected={isSelected}
            onPress={() => onTap(colIdx, idx)}
            onLongPress={() => onDoubleTap(colIdx)}
            style={{ position: 'absolute', top: offset, left: 0, zIndex: idx }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  emptySlot: {
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
});
