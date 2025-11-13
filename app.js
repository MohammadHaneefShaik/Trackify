require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY";
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const cookieParser = require("cookie-parser");
const path = require("path");
const jwt = require("jsonwebtoken");
const { connectDb } = require("./connection");

// Routers
const staticRouter = require("./routes/staticRouter");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const driverRoutes = require("./routes/driverRoutes");

// Middleware
const { handleLogout } = require("./controllers/authControllers");
const { protect } = require("./middlewares/auth");

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: true, credentials: true } });

// ===== Express Config =====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
const compression = require("compression");
app.use(compression());

app.use(express.static(path.join(__dirname, "public")));

// ===== User Auth Middleware for Views =====
app.use((req, res, next) => {
  const token = req.cookies?.token;
  if (!token || token === "loggedout") {
    res.locals.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    res.locals.user = decoded;
  } catch {
    res.locals.user = null;
  }

  next();
});

// ===== Routes =====
app.use("/", staticRouter);
app.use("/auth", authRoutes);
app.use("/user", protect, userRoutes);
app.use("/driver", protect, driverRoutes);
app.use("/admin", protect, adminRoutes);
app.get("/logout", handleLogout);

// ===== SOCKET AUTH =====
io.use((socket, next) => {
  try {
    let token;
    if (socket.handshake.headers.cookie) {
      const cookie = require("cookie").parse(socket.handshake.headers.cookie);
      token = cookie.token;
    }
    if (!token && socket.handshake.auth?.token) token = socket.handshake.auth.token;

    console.log("🔑 Token found:", token ? "Yes" : "No");

    if (!token) return next(new Error("No token"));

    socket.user = jwt.verify(token, JWT_SECRET);
    console.log("✅ Socket user:", socket.user.email);
    next();
  } catch (err) {
    console.log("❌ Socket auth error:", err.message);
    next(new Error("Unauthorized"));
  }
});

// ===== SOCKET EVENTS =====
const Bus = require("./models/Bus");
const Stop = require("./models/Stop");

// 🗺️ In-memory temporary storage for live bus locations
const liveBusLocations = {};

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.user?.email || "Unknown");

  // 🚍 Receive location from driver
  socket.on("send-location", async ({ busId, latitude, longitude }) => {
    if (socket.user.role !== "DRIVER") return;

    if (!busId || busId.trim() === "") {
      console.log("⚠️ Missing or invalid busId from driver");
      return;
    }

    // Store location temporarily in memory
    liveBusLocations[busId] = { latitude, longitude, lastUpdated: new Date() };

    try {
      // Only query if busId is valid
      const bus = await Bus.findById(busId).populate("stops");
      if (bus && bus.stops?.length) {
        const threshold = 0.0008;
        const reachedStop = bus.stops.find(
          (stop) =>
            Math.abs(stop.latitude - latitude) < threshold &&
            Math.abs(stop.longitude - longitude) < threshold
        );

        if (reachedStop) {
          console.log(`📍 Bus "${bus.busNumber}" reached stop: ${reachedStop.stopName}`);
        }
      }
    } catch (err) {
      console.error("❌ Error processing location update:", err.message);
    }

    io.emit("receive-location", { busId, latitude, longitude });
  });


  // 👀 Allow users to request all live bus locations
  socket.on("get-live-locations", () => {
    socket.emit("bus-locations", liveBusLocations);
  });

  // ❌ Handle disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", socket.user?.email || "Unknown");
  });
});
const PORT = process.env.PORT || 3000;

// Start server only after DB connection
connectDb().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});