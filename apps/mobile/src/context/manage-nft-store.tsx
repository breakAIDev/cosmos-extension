import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { FAVOURITE_NFTS, HIDDEN_NFTS } from '../services/config/storage-keys';

export class FavNftStore {
  favNfts: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setFavNfts(favNfts: string[]) {
    this.favNfts = favNfts;
  }

  async initFavNfts(walletId: string) {
    const storageRaw = await AsyncStorage.getItem(FAVOURITE_NFTS);
    if (storageRaw) {
      const favNftsObj = JSON.parse(storageRaw);
      this.favNfts = favNftsObj[walletId ?? ''] ?? [];
      return;
    }
    this.favNfts = [];
  }

  async addFavNFT(nft: string, walletId: string) {
    this.favNfts.push(nft);
    const storageRaw = await AsyncStorage.getItem(FAVOURITE_NFTS);
    const allFavNfts = storageRaw ? JSON.parse(storageRaw) : {};
    allFavNfts[walletId ?? ''] = this.favNfts;
    await AsyncStorage.setItem(FAVOURITE_NFTS, JSON.stringify(allFavNfts));
  }

  async removeFavNFT(nft: string, walletId: string) {
    this.favNfts = this.favNfts.filter((f) => f !== nft);
    const storageRaw = await AsyncStorage.getItem(FAVOURITE_NFTS);
    const allFavNfts = storageRaw ? JSON.parse(storageRaw) : {};
    allFavNfts[walletId ?? ''] = this.favNfts;
    await AsyncStorage.setItem(FAVOURITE_NFTS, JSON.stringify(allFavNfts));
  }
}

export const favNftStore = new FavNftStore();

export class HiddenNftStore {
  hiddenNfts: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  setHiddenNfts(hiddenNfts: string[]) {
    this.hiddenNfts = hiddenNfts;
  }

  async initHiddenNfts(walletId: string) {
    const storageRaw = await AsyncStorage.getItem(HIDDEN_NFTS);
    if (storageRaw) {
      const hiddenNftsObj = JSON.parse(storageRaw);
      this.hiddenNfts = hiddenNftsObj[walletId ?? ''] ?? [];
      return;
    }
    this.hiddenNfts = [];
  }

  async addHiddenNFT(nft: string, walletId: string) {
    this.hiddenNfts.push(nft);
    const storageRaw = await AsyncStorage.getItem(HIDDEN_NFTS);
    const allHiddenNfts = storageRaw ? JSON.parse(storageRaw) : {};
    allHiddenNfts[walletId ?? ''] = this.hiddenNfts;
    await AsyncStorage.setItem(HIDDEN_NFTS, JSON.stringify(allHiddenNfts));
  }

  async removeHiddenNFT(nft: string, walletId: string) {
    this.hiddenNfts = this.hiddenNfts.filter((f) => f !== nft);
    const storageRaw = await AsyncStorage.getItem(HIDDEN_NFTS);
    const allHiddenNfts = storageRaw ? JSON.parse(storageRaw) : {};
    allHiddenNfts[walletId ?? ''] = this.hiddenNfts;
    await AsyncStorage.setItem(HIDDEN_NFTS, JSON.stringify(allHiddenNfts));
  }
}

export const hiddenNftStore = new HiddenNftStore();
