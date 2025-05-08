import {io, Socket} from "socket.io-client";
import {RideRequestSchema} from "../../../types/ride/schema/ride.request";
import {validate} from "../../../utils/zod/validate";

class SocketClient {
  private socket: Socket | null = null;
  private isConnected: boolean = false;
  private socketId: string | null = null;
  private clientList: any[] = [];
  private eventListeners: Map<string, Function[]> = new Map();
  private connectionAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    const SOCKET_SERVER_URL =
      process.env.SOCKET_SERVER_URL || "http://192.168.29.42:4000";

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(SOCKET_SERVER_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      this.connectionAttempts = 0;
      if (this.socket?.id) {
        this.socketId = this.socket.id;
      }
      this.triggerEvent("connect");
    });

    this.socket.on("connect_error", error => {
      this.connectionAttempts++;
      if (this.connectionAttempts >= this.maxReconnectAttempts) {
        this.isConnected = false;
        this.triggerEvent("connect_error", error);
      }
    });

    this.socket.on("disconnect", reason => {
      this.isConnected = false;
      this.socketId = null;
      this.clientList = [];
      this.triggerEvent("disconnect", reason);
    });

    this.socket.on("ride_request_received", data => {
      this.triggerEvent("ride_request_received", data);
    });

    this.socket.on("new_ride_request", data => {
      this.triggerEvent("new_ride_request", data);
    });

    this.socket.on("ride_accepted", data => {
      this.triggerEvent("ride_accepted", data);
    });

    this.socket.on("client_list", data => {
      this.clientList = data;
      this.triggerEvent("client_list", data);
    });

    this.socket.on("error", error => {
      this.triggerEvent("error", error);
    });

    this.socket.on("room_status", data => {
      this.triggerEvent("room_status", data);
    });

    this.socket.on("room_members", data => {
      this.triggerEvent("room_members", data);
    });
  }

  private triggerEvent(eventName: string, data?: any) {
    const listeners = this.eventListeners.get(eventName) || [];
    listeners.forEach(listener => listener(data));
  }

  public on(eventName: string, callback: Function) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)?.push(callback);
  }

  public off(eventName: string, callback: Function) {
    const listeners = this.eventListeners.get(eventName) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  public connect() {
    if (!this.socket) {
      this.initializeSocket();
    }

    if (this.socket && !this.isConnected) {
      this.connectionAttempts = 0;
      this.socket.connect();
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      this.socketId = null;
      this.clientList = [];
      this.triggerEvent("disconnect", "manual_disconnect");
    }
  }

  public joinRoom(roomId: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit("join_room", roomId);
  }

  public leaveRoom(roomId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("leave_room", roomId);
  }

  public sendRideRequest(rideRequestData: any) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    try {
      const validatedData = validate(RideRequestSchema, rideRequestData);
      this.socket.emit("ride_request", validatedData);
    } catch (error) {
      this.triggerEvent("error", error);
    }
  }

  public acceptRide(rideId: string, driverId: string) {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("accept_ride", {rideId, driverId});
  }

  public listClients() {
    if (!this.socket || !this.isConnected) return;
    this.socket.emit("list_clients");
  }

  public keepOneClient(roomId: string, keepClientId: string) {
    if (!this.socket || !this.isConnected) {
      return;
    }
    this.socket.emit("keep_one_client", roomId, keepClientId);
  }

  public joinRoomAndSendRequest(roomId: string, rideRequestData: any) {
    if (!this.socket || !this.isConnected) return;
    this.joinRoom(roomId);
    this.sendRideRequest(rideRequestData);
  }

  public getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      socketId: this.socketId,
    };
  }

  public getClientList() {
    return this.clientList;
  }

  public getRoomMembers(roomId: string) {
    if (!this.socket || !this.isConnected) {
      this.triggerEvent("room_members", {
        roomId,
        members: [],
        totalMembers: 0,
      });
      return;
    }
    this.socket.emit("get_room_members", roomId);
  }
}

export const socketClient = new SocketClient();
