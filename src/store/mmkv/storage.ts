import {MMKV} from "react-native-mmkv";
import {User} from '../../types/user/userTypes'
import { NavigationState } from '@react-navigation/native';

export const storage = new MMKV({
  id: "app-storage",
  encryptionKey: "optional-encryption-key",
});

export const mmkvUtils = {
// gets user data
  getUser: (): User | null => {
    const userData = storage.getString("userAtom");
    return userData ? JSON.parse(userData) : null;
  },
// sets user data
  setUser: (user: User | null) => {
    if (user) {
      storage.set("userAtom", JSON.stringify(user));
    } else {
      storage.delete("userAtom");
    }
  },

  // Navigation state utilities
  getNavigationState: (): NavigationState | null => {
    try {
      const navigationData = storage.getString("navigationState");
      return navigationData ? JSON.parse(navigationData) : null;
    } catch (error) {
      console.error("Error parsing navigation state:", error);
      storage.delete("navigationState");
      return null;
    }
  },

  setNavigationState: (state: NavigationState | null) => {
    try {
      if (state) {
        storage.set("navigationState", JSON.stringify(state));
      } else {
        storage.delete("navigationState");
      }
    } catch (error) {
      console.error("Error storing navigation state:", error);
    }
  },

  // clears all storage
  clearStorage: () => {
    storage.clearAll();
  },
};
