import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
const soundFiles = {
  select: require('../../assets/sounds/select.wav'),
  pour:   require('../../assets/sounds/pour.wav'),
  error:  require('../../assets/sounds/error.wav'),
  win:    require('../../assets/sounds/win.wav'),
  undo:   require('../../assets/sounds/undo.wav'),
};
type SoundKey = keyof typeof soundFiles;
const players: Partial<Record<SoundKey, AudioPlayer>> = {};
let enabled = true;
export async function initSounds() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    for (const key of Object.keys(soundFiles) as SoundKey[]) players[key] = createAudioPlayer(soundFiles[key]);
  } catch (e) {}
}
export async function playSound(key: SoundKey) {
  if (!enabled) return;
  try { const p = players[key]; if (!p) return; await p.seekTo(0); p.play(); } catch (e) {}
}
export function setSoundEnabled(val: boolean) { enabled = val; }
export function isSoundEnabled() { return enabled; }