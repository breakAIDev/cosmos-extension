import { CLIENT_ID } from '../services/config/storage-keys';
import { makeAutoObservable } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ClientIdStore {
  clientId: string | undefined = undefined;

  constructor() {
    makeAutoObservable(this);
  }

  async initClientId() {
    const clientId = await AsyncStorage.getItem(CLIENT_ID);

    if (clientId) {
      this.setClientId(clientId);
      return;
    }

    const newClientId = uuidv4();
    this.setClientId(newClientId);
  }

  setClientId(clientId: string) {
    this.clientId = clientId;
    AsyncStorage.setItem(CLIENT_ID, clientId);
  }
}

export const clientIdStore = new ClientIdStore();
