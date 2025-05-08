import {useEffect, useState} from "react";
import {socketClient} from "../services/socket/broadcast/broadcastSocket";
import {RideRequest} from "../types/ride/types/ride.types";

interface RoomStatus {
  status: string;
  message: string;
}

interface RoomMember {
  id: string;
  isCurrentUser: boolean;
}

interface RoomMembers {
  roomId: string;
  members: RoomMember[];
  totalMembers: number;
}

export const useSocket = (roomId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [roomStatus, setRoomStatus] = useState<RoomStatus | null>(null);
  const [roomMembers, setRoomMembers] = useState<RoomMembers | null>(null);

  const initializeSocket = () => {
    socketClient.connect();
    setIsConnected(socketClient.getConnectionStatus().isConnected);
  };

  useEffect(() => {
    initializeSocket();

    const handleConnect = () => {
      setIsConnected(true);
      setRoomStatus(null);
      setRoomMembers(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setRoomStatus(null);
      setRoomMembers(null);
    };

    const handleRoomStatus = (data: RoomStatus) => {
      setRoomStatus(data);
    };

    const handleRoomMembers = (data: RoomMembers) => {
      setRoomMembers(data);
    };

    socketClient.on("connect", handleConnect);
    socketClient.on("disconnect", handleDisconnect);
    socketClient.on("room_status", handleRoomStatus);
    socketClient.on("room_members", handleRoomMembers);

    return () => {
      socketClient.off("connect", handleConnect);
      socketClient.off("disconnect", handleDisconnect);
      socketClient.off("room_status", handleRoomStatus);
      socketClient.off("room_members", handleRoomMembers);
    };
  }, []);

  const joinRoom = () => {
    if (!isConnected) {
      initializeSocket();
      setTimeout(() => {
        if (socketClient.getConnectionStatus().isConnected) {
          socketClient.joinRoom(roomId);
        }
      }, 1000);
    } else {
      socketClient.joinRoom(roomId);
    }
  };

  const sendRideRequest = (rideRequestData: RideRequest) => {
    if (!isConnected) return;
    socketClient.sendRideRequest(rideRequestData);
  };

  const keepOneClient = () => {
    const keepClientId = socketClient.getConnectionStatus().socketId;
    if (keepClientId) {
      socketClient.keepOneClient(roomId, keepClientId);
    }
  };

  const disconnect = () => {
    socketClient.disconnect();
  };

  const getRoomMembers = () => {
    socketClient.getRoomMembers(roomId);
  };

  return {
    isConnected,
    roomStatus,
    roomMembers,
    joinRoom,
    sendRideRequest,
    keepOneClient,
    disconnect,
    getRoomMembers,
  };
};
