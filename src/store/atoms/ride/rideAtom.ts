import {atom} from "recoil";
import {RideState} from "../../../types/ride/rideTypes";

export const rideAtom = atom<RideState>({
  key: "rideState",
  default: {},
});
