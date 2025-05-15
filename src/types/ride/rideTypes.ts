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
  status?:
    | "idle"
    | "selecting_location"
    | "configuring_ride"
    | "creating_request"
    | "QUOTATION_REQUEST_INITIATED"
    | "PENDING_BIDS"
    | "BIDS_RECEIVED"
    | "searching"
    | "driverFound"
    | "confirmed"
    | "started"
    | "completed"
    | "cancelled"
    | "error";
  quotationRequestId?: string;
  errorMessage?: string;
}
