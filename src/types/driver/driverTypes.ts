export interface Driver {
  id?: string;
  name: string;
  email: string;
  phone: string;
  rating: string;
  regnumber: string;
  vehiclemodel: string;
  vehicletype: string;
  driverlocation: {
    latitude: string;
    longitude: string;
  };
  bidAmount?: number;
}

export interface DriverBid {
  driverId: string;
  amount: number;
  timeStamp: Date;
}
