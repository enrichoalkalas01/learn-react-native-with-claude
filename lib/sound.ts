import { Audio } from 'expo-av';

// Helper sederhana untuk play sound built-in.
// Pakai URL data audio agar tidak perlu file asset terpisah untuk demo.
//
// Catatan: untuk production, pakai file asset di app dan require(...).
// Versi minimal: pakai sound dari URL atau dari konstanta yang user define.

let playing: Audio.Sound | null = null;

async function playUri(uri: string) {
  try {
    if (playing) {
      await playing.unloadAsync();
      playing = null;
    }
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
    playing = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (playing === sound) playing = null;
      }
    });
  } catch {
    // Diam — sound is best-effort
  }
}

// Public sound URLs (CC0 / public domain). Aman untuk learning project.
const SOUND_URLS = {
  click: 'https://www.soundjay.com/buttons/sounds/button-3.mp3',
  success: 'https://www.soundjay.com/buttons/sounds/button-09a.mp3',
};

export const sound = {
  click: () => playUri(SOUND_URLS.click),
  success: () => playUri(SOUND_URLS.success),
};
