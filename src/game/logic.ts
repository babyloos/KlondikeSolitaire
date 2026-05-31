import { Card, Suit, SUITS, isRed, createDeck, shuffle } from './cards';

export interface BoardState {
  tableau: Card[][];   // 7 columns, index 0=bottom, last=top
  foundation: Card[][]; // 4 piles indexed by SUITS.indexOf(suit)
  stock: Card[];       // face-down, last = next to draw
  waste: Card[];       // face-up, last = top
  moves: number;
}

export function suitIdx(suit: Suit): number {
  return SUITS.indexOf(suit);
}

export function foundationTop(foundation: Card[][], suit: Suit): Card | null {
  const pile = foundation[suitIdx(suit)];
  return pile.length > 0 ? pile[pile.length - 1] : null;
}

export function canMoveToFoundation(card: Card, foundation: Card[][]): boolean {
  const top = foundationTop(foundation, card.suit);
  if (top === null) return card.rank === 1;
  return card.rank === top.rank + 1;
}

export function canMoveToTableau(card: Card, targetCol: Card[]): boolean {
  if (targetCol.length === 0) return card.rank === 13; // King to empty
  const top = targetCol[targetCol.length - 1];
  if (!top.faceUp) return false;
  return card.rank === top.rank - 1 && isRed(card.suit) !== isRed(top.suit);
}

export function dealGame(): BoardState {
  const deck = shuffle(createDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);

  let idx = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[idx++], faceUp: row === col };
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(idx).map(c => ({ ...c, faceUp: false }));
  return {
    tableau,
    foundation: [[], [], [], []],
    stock,
    waste: [],
    moves: 0,
  };
}

export function drawStock(state: BoardState): BoardState {
  if (state.stock.length === 0) {
    if (state.waste.length === 0) return state;
    // Flip waste back to stock
    return {
      ...state,
      stock: [...state.waste].reverse().map(c => ({ ...c, faceUp: false })),
      waste: [],
      moves: state.moves + 1,
    };
  }
  const card = { ...state.stock[state.stock.length - 1], faceUp: true };
  return {
    ...state,
    stock: state.stock.slice(0, -1),
    waste: [...state.waste, card],
    moves: state.moves + 1,
  };
}

export function moveWasteToFoundation(state: BoardState): BoardState | null {
  if (state.waste.length === 0) return null;
  const card = state.waste[state.waste.length - 1];
  if (!canMoveToFoundation(card, state.foundation)) return null;
  const si = suitIdx(card.suit);
  const newFoundation = state.foundation.map((pile, i) =>
    i === si ? [...pile, card] : pile
  );
  return {
    ...state,
    waste: state.waste.slice(0, -1),
    foundation: newFoundation,
    moves: state.moves + 1,
  };
}

export function moveWasteToTableau(state: BoardState, colIdx: number): BoardState | null {
  if (state.waste.length === 0) return null;
  const card = state.waste[state.waste.length - 1];
  if (!canMoveToTableau(card, state.tableau[colIdx])) return null;
  const newTableau = state.tableau.map((col, i) =>
    i === colIdx ? [...col, card] : col
  );
  return {
    ...state,
    waste: state.waste.slice(0, -1),
    tableau: newTableau,
    moves: state.moves + 1,
  };
}

export function moveTableauToFoundation(state: BoardState, colIdx: number): BoardState | null {
  const col = state.tableau[colIdx];
  if (col.length === 0) return null;
  const card = col[col.length - 1];
  if (!card.faceUp) return null;
  if (!canMoveToFoundation(card, state.foundation)) return null;
  const si = suitIdx(card.suit);
  const newTableau = state.tableau.map((c, i) => {
    if (i !== colIdx) return c;
    const next = c.slice(0, -1);
    if (next.length > 0 && !next[next.length - 1].faceUp) {
      next[next.length - 1] = { ...next[next.length - 1], faceUp: true };
    }
    return next;
  });
  const newFoundation = state.foundation.map((pile, i) =>
    i === si ? [...pile, card] : pile
  );
  return {
    ...state,
    tableau: newTableau,
    foundation: newFoundation,
    moves: state.moves + 1,
  };
}

export function moveTableauToTableau(
  state: BoardState,
  fromCol: number,
  cardIdx: number,  // index of first card to move
  toCol: number
): BoardState | null {
  const srcCol = state.tableau[fromCol];
  const cards = srcCol.slice(cardIdx);
  if (cards.length === 0 || !cards[0].faceUp) return null;
  if (!canMoveToTableau(cards[0], state.tableau[toCol])) return null;

  const newTableau = state.tableau.map((col, i) => {
    if (i === fromCol) {
      const next = col.slice(0, cardIdx);
      if (next.length > 0 && !next[next.length - 1].faceUp) {
        next[next.length - 1] = { ...next[next.length - 1], faceUp: true };
      }
      return next;
    }
    if (i === toCol) return [...col, ...cards];
    return col;
  });
  return { ...state, tableau: newTableau, moves: state.moves + 1 };
}

export function isGameWon(state: BoardState): boolean {
  return state.foundation.every(pile => pile.length === 13);
}

export function autoMoveToFoundation(state: BoardState): BoardState {
  // Try to auto-move any tableau top card or waste top to foundation
  let s = state;
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < 7; i++) {
      const next = moveTableauToFoundation(s, i);
      if (next) { s = next; changed = true; break; }
    }
    if (!changed) {
      const next = moveWasteToFoundation(s);
      if (next) { s = next; changed = true; }
    }
  }
  return s;
}
