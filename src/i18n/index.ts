import { getLocales } from 'expo-localization';

const locale = getLocales()[0]?.languageCode ?? 'en';
const lang = locale === 'ja' ? 'ja' : locale === 'zh' ? 'zh' : 'en';

const strings = {
  en: {
    appName: 'Klondike Solitaire',
    newGame: 'New Game',
    undo: 'Undo',
    hint: 'Hint',
    moves: 'Moves',
    time: 'Time',
    best: 'Best',
    youWin: 'You Win!',
    playAgain: 'Play Again',
    stockEmpty: 'No more cards',
  },
  ja: {
    appName: 'クロンダイク ソリティア',
    newGame: '新規ゲーム',
    undo: '元に戻す',
    hint: 'ヒント',
    moves: '手数',
    time: '時間',
    best: 'ベスト',
    youWin: 'クリア！',
    playAgain: 'もう一度',
    stockEmpty: 'カードなし',
  },
  zh: {
    appName: '纸牌接龙',
    newGame: '新游戏',
    undo: '撤销',
    hint: '提示',
    moves: '步数',
    time: '时间',
    best: '最佳',
    youWin: '胜利！',
    playAgain: '再玩一次',
    stockEmpty: '无更多牌',
  },
};

export const t = strings[lang];
