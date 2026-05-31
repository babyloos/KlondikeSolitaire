import { create } from 'zustand';
import {
  BoardState, dealGame, drawStock,
  moveWasteToFoundation, moveWasteToTableau,
  moveTableauToFoundation, moveTableauToTableau,
  isGameWon, autoMoveToFoundation, canMoveToFoundation, canMoveToTableau,
} from '../game/logic';
import { SUITS } from '../game/cards';

export type SelectionArea = 'waste' | 'tableau';

export interface Selection {
  area: SelectionArea;
  colIdx: number;
  cardIdx: number; // for tableau: index of first selected card in column
}

interface Store extends BoardState {
  selected: Selection | null;
  isWon: boolean;
  elapsedSec: number;
  bestSec: number;
  history: BoardState[];

  start: () => void;
  tap: (area: SelectionArea, colIdx: number, cardIdx?: number) => void;
  tapFoundation: (suitIdx: number) => void;
  tapStock: () => void;
  undo: () => void;
  tick: () => void;
}

function pushHistory(history: BoardState[], state: BoardState): BoardState[] {
  return [...history.slice(-20), state]; // keep last 20 states
}

export const useGameStore = create<Store>((set, get) => ({
  ...dealGame(),
  selected: null,
  isWon: false,
  elapsedSec: 0,
  bestSec: 0,
  history: [],

  start: () => {
    set({ ...dealGame(), selected: null, isWon: false, elapsedSec: 0, history: [] });
  },

  tapStock: () => {
    const s = get();
    const prev = boardSnapshot(s);
    const next = drawStock(s);
    set({ ...next, history: pushHistory(s.history, prev), selected: null });
  },

  tap: (area, colIdx, cardIdx = 0) => {
    const s = get();
    const { selected, tableau, waste, foundation } = s;

    // Tap waste top card
    if (area === 'waste') {
      if (waste.length === 0) return;
      if (selected?.area === 'waste') {
        set({ selected: null });
        return;
      }
      set({ selected: { area: 'waste', colIdx: 0, cardIdx: 0 } });
      return;
    }

    // Tap a tableau cell
    const col = tableau[colIdx];

    // If nothing selected — select this card
    if (!selected) {
      if (col.length === 0 || !col[cardIdx]?.faceUp) return;
      set({ selected: { area: 'tableau', colIdx, cardIdx } });
      return;
    }

    // Tap same card → deselect
    if (selected.area === 'tableau' && selected.colIdx === colIdx && selected.cardIdx === cardIdx) {
      set({ selected: null });
      return;
    }

    // Try to move selected card(s) to this column
    const prev = boardSnapshot(s);
    let next: BoardState | null = null;

    if (selected.area === 'waste') {
      next = moveWasteToTableau(s, colIdx);
    } else {
      next = moveTableauToTableau(s, selected.colIdx, selected.cardIdx, colIdx);
    }

    if (next) {
      const won = isGameWon(next);
      set({ ...next, selected: null, isWon: won, history: pushHistory(s.history, prev) });
    } else {
      // Switch selection to newly tapped card
      if (col.length > 0 && col[cardIdx]?.faceUp) {
        set({ selected: { area: 'tableau', colIdx, cardIdx } });
      } else {
        set({ selected: null });
      }
    }
  },

  tapFoundation: (si) => {
    const s = get();
    const { selected, foundation } = s;
    if (!selected) return;

    const prev = boardSnapshot(s);
    let next: BoardState | null = null;

    if (selected.area === 'waste') {
      next = moveWasteToFoundation(s);
    } else {
      next = moveTableauToFoundation(s, selected.colIdx);
    }

    if (next) {
      const won = isGameWon(next);
      set({ ...next, selected: null, isWon: won, history: pushHistory(s.history, prev) });
    }
  },

  undo: () => {
    const { history } = get();
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    set({ ...prev, selected: null, history: history.slice(0, -1) });
  },

  tick: () => {
    const { isWon } = get();
    if (!isWon) set(s => ({ elapsedSec: s.elapsedSec + 1 }));
  },
}));

function boardSnapshot(s: Store): BoardState {
  return {
    tableau: s.tableau.map(col => col.map(c => ({ ...c }))),
    foundation: s.foundation.map(pile => pile.map(c => ({ ...c }))),
    stock: s.stock.map(c => ({ ...c })),
    waste: s.waste.map(c => ({ ...c })),
    moves: s.moves,
  };
}

// Called from GameScreen to double-tap auto-move to foundation
export function tryAutoMove(area: SelectionArea, colIdx: number) {
  const s = useGameStore.getState();
  const prev = boardSnapshot(s);
  let next: BoardState | null = null;

  if (area === 'waste') {
    next = moveWasteToFoundation(s);
  } else {
    next = moveTableauToFoundation(s, colIdx);
  }

  if (next) {
    const won = isGameWon(next);
    useGameStore.setState({
      ...next,
      selected: null,
      isWon: won,
      history: pushHistory(s.history, prev),
    });
  }
}
