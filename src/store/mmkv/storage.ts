import { MMKV } from "react-native-mmkv";
import { User } from '../../types/user/userTypes'

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
  setPhoneNumber: (phoneNumber: string | null) => {
    if (phoneNumber) {
      // const isValidPhone = /^\d{10}$/.test(phoneNumber);
      var userD = storage.getString("userAtom")
      // if (isValidPhone && userD) {
      var userData = JSON.parse(userD);
      userData.phoneNumber = phoneNumber;
      storage.set("userAtom", JSON.stringify(userData));
      return true;
      // }
    }
    return false;
  },
  deletePhone: () => {
    var userD = storage.getString("userAtom")
    if (userD) {
      var userData = JSON.parse(userD);
      userData.phoneNumber = "";
      storage.set("userAtom", JSON.stringify(userData));
      return true;
    }
  },
  setConfirmation: (confirm: any) => {
    if (confirm) {
      const userD = storage.getString("userAtom");
      if (userD) {
        var userData = JSON.parse(userD);
        userData.confirm = confirm;
        storage.set("userAtom", JSON.stringify(userData));
        return true;
      }
    }
    return false;
  },


  // clears all storage
  clearStorage: () => {
    storage.clearAll();
  },
};
