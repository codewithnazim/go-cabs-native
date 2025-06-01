import {AtomEffect} from "recoil";
import {storage} from "../../mmkv/storage";
import {RideState} from "../../../types/ride/rideTypes";
import {STORAGE_KEYS} from "../../constants/storageKeys";

const RIDE_SELECTION_KEY = STORAGE_KEYS.RIDE;

export const persistSelectedRideAtom: AtomEffect<RideState> = ({
  onSet,
  setSelf,
  trigger,
}) => {
  // Load stored data on initialization
  if (trigger === "get") {
    try {
      const storedValue = storage.getString(RIDE_SELECTION_KEY);
      console.log("Loaded stored string for key", RIDE_SELECTION_KEY, ":", storedValue);
      
      if (storedValue != null && storedValue !== "") {
        const parsedData = JSON.parse(storedValue);
        console.log("Parsed data for setSelf:", parsedData);
        
        // Validate the parsed data structure
        if (parsedData && typeof parsedData === 'object') {
          setSelf(parsedData);
        } else {
          console.warn("Invalid stored data structure, using default");
        }
      } else {
        console.log("No stored value found for key:", RIDE_SELECTION_KEY, "- atom will use default.");
      }
    } catch (e) {
      console.error("Error loading stored ride selection data:", e);
      // Clear corrupted data
      storage.delete(RIDE_SELECTION_KEY);
    }
  }

  // Save data when atom changes
  onSet((newValue, oldValue, isReset) => {
    try {
      if (isReset || newValue == null) {
        console.log("Clearing stored ride data");
        storage.delete(RIDE_SELECTION_KEY);
        return;
      }

      const dataToPersist = {
        pickupLocation: newValue.pickupLocation,
        dropOffLocation: newValue.dropOffLocation,
        selectedRideType: newValue.selectedRideType,
        fare: newValue.fare,
        payment: newValue.payment,
        status: newValue.status,
        quotationRequestId: newValue.quotationRequestId,
        selectedBid: newValue.selectedBid,
        walletAddress: newValue.walletAddress,
        driver: newValue.driver,
        driverLocation: newValue.driverLocation,
        email: newValue.email,
        errorMessage: newValue.errorMessage,
      };

      console.log("Persisting data:", JSON.stringify(dataToPersist, null, 2));
      console.log("Is newValue.fare defined?", newValue.fare);
      console.log("Is newValue.status defined?", newValue.status);
      
      storage.set(RIDE_SELECTION_KEY, JSON.stringify(dataToPersist));
      console.log("Data successfully persisted for key:", RIDE_SELECTION_KEY);
      
      // Verify storage immediately
      const verification = storage.getString(RIDE_SELECTION_KEY);
      console.log("Verification - data actually stored:", verification ? "YES" : "NO");
      
    } catch (e) {
      console.error("Error storing ride selection data:", e);
    }
  });
};

// test fn
// export const testStorage = () => {
//   try {
//     const testKey = "test-storage";
//     const testData = { test: "data", timestamp: Date.now() };
    
//     storage.set(testKey, JSON.stringify(testData));
//     const retrieved = storage.getString(testKey);
    
//     console.log("Storage test - stored:", testData);
//     console.log("Storage test - retrieved:", retrieved);
    
//     storage.delete(testKey);
//     return retrieved ? JSON.parse(retrieved) : null;
//   } catch (e) {
//     console.error("Storage test failed:", e);
//     return null;
//   }
// };

// example
// import { testStorage } from "../../store/persist/ride/persistSelectedRideAtom";
// import { storage } from "../../store/mmkv/storage";
// import { STORAGE_KEYS } from "../../store/constants/storageKeys";

// console.log('Storage test result:', testStorage());

// useEffect(() => {
//   console.log('App started, checking stored ride data...');
//   const stored = storage.getString(STORAGE_KEYS.RIDE);
//   console.log('Stored ride data on app start:', stored);
// }, []);