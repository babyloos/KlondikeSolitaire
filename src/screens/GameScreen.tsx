import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore, tryAutoMove } from '../store/gameStore';
import { TableauColumn } from '../components/TableauColumn';
import { PlayingCard } from '../components/PlayingCard';
import { SUITS, SUIT_SYMBOL } from '../game/cards';
import { suitIdx } from '../game/logic';
import { BG, SURFACE, ACCENT, TEXT, TEXT_DIM, EMPTY_SLOT, CARD_SELECTED } from '../constants/theme';
import { t } from '../i18n';

type Props = { navigation: NativeStackNavigationProp<any> };

export function GameScreen({ navigation }: Props) {
  const { width: screenW } = useWindowDimensions();
  const {
    tableau, foundation, stock, waste, selected, moves, isWon,
    elapsedSec, start, tap, tapFoundation, tapStock, undo, tick,
  } = useGameStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (isWon && timerRef.current) clearInterval(timerRef.current);
  }, [isWon]);

  // Card dimensions: 7 columns + 6 gaps fit in screenW - 8 padding
  const gap = 3;
  const cardW = Math.floor((screenW - 8 - gap * 6) / 7);
  const cardH = Math.floor(cardW * 1.42);

  function handleRestart() {
    if (timerRef.current) clearInterval(timerRef.current);
    start();
    timerRef.current = setInterval(tick, 1000);
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const wasteTop = waste.length > 0 ? waste[waste.length - 1] : null;
  const wasteSelected = selected?.area === 'waste';

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.stat}>{t.moves}: {moves}</Text>
        <Text style={styles.stat}>{formatTime(elapsedSec)}</Text>
        <TouchableOpacity onPress={undo} style={styles.undoBtn}>
          <Text style={styles.undoText}>{t.undo}</Text>
        </TouchableOpacity>
      </View>

      {/* Stock / Waste / Foundation row */}
      <View style={[styles.topRow, { paddingHorizontal: 4, gap }]}>
        {/* Stock */}
        {stock.length > 0 ? (
          <PlayingCard
            card={{ id: 'stock', suit: 'S', rank: 1, faceUp: false }}
            width={cardW}
            height={cardH}
            onPress={tapStock}
          />
        ) : (
          <TouchableOpacity
            style={[styles.emptySlot, { width: cardW, height: cardH }]}
            onPress={tapStock}
          >
            <Text style={styles.emptySlotText}>↺</Text>
          </TouchableOpacity>
        )}

        {/* Waste */}
        {wasteTop ? (
          <PlayingCard
            card={wasteTop}
            width={cardW}
            height={cardH}
            selected={wasteSelected}
            onPress={() => tap('waste', 0)}
            onLongPress={() => tryAutoMove('waste', 0)}
          />
        ) : (
          <View style={[styles.emptySlot, { width: cardW, height: cardH }]} />
        )}

        {/* Spacer */}
        <View style={{ width: cardW }} />

        {/* 4 Foundation piles */}
        {SUITS.map((suit, si) => {
          const pile = foundation[si];
          const top = pile.length > 0 ? pile[pile.length - 1] : null;
          return top ? (
            <PlayingCard
              key={suit}
              card={top}
              width={cardW}
              height={cardH}
              onPress={() => tapFoundation(si)}
            />
          ) : (
            <TouchableOpacity
              key={suit}
              style={[styles.emptySlot, { width: cardW, height: cardH }]}
              onPress={() => tapFoundation(si)}
            >
              <Text style={styles.foundationSymbol}>{SUIT_SYMBOL[suit]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tableau */}
      <ScrollView
        style={styles.tableau}
        contentContainerStyle={[styles.tableauContent, { paddingHorizontal: 4, gap }]}
      >
        {tableau.map((col, ci) => (
          <TableauColumn
            key={ci}
            cards={col}
            colIdx={ci}
            cardW={cardW}
            cardH={cardH}
            selected={selected}
            onTap={(colIdx, cardIdx) => tap('tableau', colIdx, cardIdx)}
            onDoubleTap={(colIdx) => tryAutoMove('tableau', colIdx)}
          />
        ))}
      </ScrollView>

      {/* Win Modal */}
      <Modal visible={isWon} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.winTitle}>{t.youWin}</Text>
            <Text style={styles.winStat}>{formatTime(elapsedSec)}</Text>
            <Text style={styles.winStat}>{moves} {t.moves}</Text>
            <TouchableOpacity style={styles.playAgainBtn} onPress={handleRestart}>
              <Text style={styles.playAgainText}>{t.playAgain}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  backBtn: { padding: 4 },
  backText: { color: TEXT_DIM, fontSize: 20, fontWeight: 'bold' },
  stat: { color: TEXT, fontSize: 13, flex: 1, textAlign: 'center' },
  undoBtn: { backgroundColor: SURFACE, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  undoText: { color: TEXT, fontSize: 13 },
  topRow: {
    flexDirection: 'row',
    paddingBottom: 6,
  },
  emptySlot: {
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlotText: { color: 'rgba(255,255,255,0.5)', fontSize: 24 },
  foundationSymbol: { color: 'rgba(255,255,255,0.4)', fontSize: 22 },
  tableau: { flex: 1 },
  tableauContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: SURFACE,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: 280,
    gap: 12,
  },
  winTitle: { fontSize: 32, fontWeight: 'bold', color: ACCENT },
  winStat: { fontSize: 16, color: TEXT_DIM },
  playAgainBtn: {
    backgroundColor: ACCENT,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  playAgainText: { color: '#1a4a2e', fontSize: 16, fontWeight: 'bold' },
});
