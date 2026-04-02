const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const routeRoutes = require("./routes/routeRoutes");
const trackRoutes = require("./routes/trackRoutes");
const syncRoutes = require("./routes/syncRoutes");
const predictRoutes = require("./routes/predictRoutes");
const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
app.use(helmet());
const parseOrigins = (value) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const corsOriginEnv = (process.env.CORS_ORIGIN || "").trim();
const allowReflectiveOrigin = !corsOriginEnv || corsOriginEnv === "*";

app.use(
  cors({
    origin: allowReflectiveOrigin ? true : parseOrigins(corsOriginEnv),
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "ogtps-backend", timestamp: new Date().toISOString() });
});

app.use("/api/routes", routeRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/sync", syncRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/auth", authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});
app.use(errorHandler);

const startServer = async () => {
  const port = Number(process.env.PORT) || 5000;
  const host = process.env.HOST || "0.0.0.0";
  if (process.env.NODE_ENV !== "test") {
    await connectDB(process.env.MONGODB_URI);
    app.listen(port, host, () => {
      console.log(`Backend listening on http://${host}:${port} (LAN devices: use your Mac's Wi‑Fi IP, same port)`);
    });
  }
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});

module.exports = app;
