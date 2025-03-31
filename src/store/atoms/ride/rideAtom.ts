import { atom } from 'recoil';
import { Driver } from '../../../types/driver/driverTypes';

export interface RideState {
  selectedRideType?: string;
  pickupLocation?: {
    latitude: string;
    longitude: string;
    address?: string;
  };
  dropLocation?: {
    latitude: string;
    longitude: string;
    address?: string;
  };
  selectedDriver?: Driver;
  availableDrivers?: Driver[];
  rideTimings?: {
    startTime?: Date;
    endTime?: Date;
    duration?: number; // in minutes
  };
  fare?: {
    baseFare: number;
    driverBid?: number;
    finalFare?: number;
  };
  payment?: {
    method: 'metamask' | 'credit' | 'debit' | 'cash';
    confirmed: boolean;
  };
  status?: 'searching' | 'driverFound' | 'confirmed' | 'started' | 'completed';
}

export const rideAtom = atom<RideState>({
  key: 'rideState',
  default: {},
});
