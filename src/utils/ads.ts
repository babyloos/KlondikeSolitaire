import { InterstitialAd, AdEventType, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
export const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
export const INTERSTITIAL_AD_UNIT_ID = __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
export { BannerAdSize };
let interstitial: InterstitialAd | null = null;
let interstitialLoaded = false;
export function loadInterstitial() {
  try {
    interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID);
    interstitial.addAdEventListener(AdEventType.LOADED, () => { interstitialLoaded = true; });
    interstitial.addAdEventListener(AdEventType.CLOSED, () => { interstitialLoaded = false; loadInterstitial(); });
    interstitial.load();
  } catch (e) {}
}
export function showInterstitialIfReady() {
  try { if (interstitial && interstitialLoaded) interstitial.show(); } catch (e) {}
}