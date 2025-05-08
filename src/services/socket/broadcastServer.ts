import {Server} from "socket.io";
import {RideRequestSchema} from "../../types/ride/schema/ride.request";

const io = new Server({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

const rooms = new Map<string, Set<string>>();
const clients = new Map<string, {id: string; rooms: Set<string>}>();

io.on("connection", socket => {
  console.log("Client connected:", socket.id);
  clients.set(socket.id, {
    id: socket.id,
    rooms: new Set(),
  });

  socket.on("join_room", (roomId: string) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId)?.add(socket.id);
    clients.get(socket.id)?.rooms.add(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });

  // add handler for getting room members
  socket.on("get_room_members", (roomId: string) => {
    const roomClients = rooms.get(roomId);
    if (roomClients) {
      const members = Array.from(roomClients).map(clientId => ({
        id: clientId,
        isCurrentUser: clientId === socket.id
      }));
      socket.emit("room_members", {
        roomId,
        members,
        totalMembers: members.length
      });
    } else {
      socket.emit("room_members", {
        roomId,
        members: [],
        totalMembers: 0
      });
    }
  });

  // handle ride requests
  socket.on("ride_request", data => {
    try {
      const validatedData = RideRequestSchema.parse(data);
      console.log("Received ride request:", validatedData);
      socket.broadcast.emit("new_ride_request", {
        status: "new",
        data: validatedData,
      });

      socket.emit("ride_request_received", {
        status: "received",
        data: validatedData,
      });
    } catch (error) {
      console.error("Invalid ride request:", error);
      socket.emit("error", {
        status: "error",
        message: "Invalid ride request data",
      });
    }
  });

  // keep only one client in a room and disconnect others
  socket.on("keep_one_client", (roomId: string, keepClientId: string) => {
    const roomClients = rooms.get(roomId);
    if (roomClients) {
      // check if the requesting user is the only one in the room
      if (roomClients.size === 1 && roomClients.has(keepClientId)) {
        console.log("Only you are present in the room:", {
          roomId,
          clientId: keepClientId
        });
        socket.emit("room_status", {
          status: "single_user",
          message: "You are the only one in the room"
        });
        return;
      }

      console.log("Keep one client request:", {
        roomId,
        keepClientId,
        requestFrom: socket.id,
      });

      const disconnectedClients: string[] = [];

      roomClients.forEach(clientId => {
        if (clientId !== keepClientId) {
          // disconnect other clients
          io.sockets.sockets.get(clientId)?.disconnect(true);
          clients.delete(clientId);
          disconnectedClients.push(clientId);
          console.log(`Disconnected client ${clientId} from room ${roomId}`);
        }
      });

      // update room to only contain the kept client
      rooms.set(roomId, new Set([keepClientId]));

      // notify the kept client
      socket.emit("room_status", {
        status: "success",
        message: "Other clients have been disconnected",
        keptClient: keepClientId,
        disconnectedClients
      });

      console.log("Room cleanup complete:", {
        roomId,
        keptClient: keepClientId,
        disconnectedClients,
        remainingClients: Array.from(rooms.get(roomId) || []),
      });
    } else {
      console.log(`Room ${roomId} not found or already empty`);
      socket.emit("room_status", {
        status: "error",
        message: `Room ${roomId} not found or already empty`
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // clean up rooms
    rooms.forEach((clients, roomId) => {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        if (clients.size === 0) {
          rooms.delete(roomId);
        }
      }
    });
    // remove client from tracking
    clients.delete(socket.id);
  });
});

io.listen(4000);

console.log("Socket.IO server running on port 4000");
