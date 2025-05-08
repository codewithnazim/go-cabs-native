import { z } from "zod";
import { RideRequestSchema } from "../schema/ride.request";
import { RideSchema } from "../schema/ride";

export type RideRequest = z.infer<typeof RideRequestSchema>;
export type Ride = z.infer<typeof RideSchema>;