import {DriverBid} from "../driver/driverBidTypes";
import {Driver} from "../driver/driverTypes";

export interface RideState {
  email?: string;
  selectedRideType?: string;
  selectedBid?: DriverBid["bidId"];
  walletAddress?: Driver["walletAddress"];
  driver?: Driver;
  driverLocation?: {
    latitude: Driver["driverlocation"]["latitude"];
    longitude: Driver["driverlocation"]["longitude"];
  };
  fare?: {
    baseFare: number;
    finalFare?: Driver["bidAmount"];
    breakdown?: {
      baseCost: number;
      serviceFee: number;
      taxes: number;
    };
  };
  pickupLocation?: {
    latitude: string;
    longitude: string;
    address?: string;
  };
  dropOffLocation?: {
    latitude: string;
    longitude: string;
    address?: string;
  };
  payment?: {
    method: "metamask" | "credit" | "debit" | "cash";
    confirmed: boolean;
  };
  status?: "searching" | "driverFound" | "confirmed" | "started" | "completed";
}
