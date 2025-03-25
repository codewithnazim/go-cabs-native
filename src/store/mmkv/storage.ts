import {MMKV} from "react-native-mmkv";
import {User} from '../../types/user/userTypes'

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

  // clears all storage
  clearStorage: () => {
    storage.clearAll();
  },
};
