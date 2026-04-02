const MovementLog = require("../models/MovementLog");
const Device = require("../models/Device");

const postSync = async (req, res, next) => {
  try {
    const { deviceId, logs = [] } = req.body;
    if (!deviceId || !Array.isArray(logs)) {
      res.status(400);
      throw new Error("deviceId and logs array are required");
    }

    if (!logs.length) {
      return res.json({ synced: 0, message: "No logs to sync" });
    }

    const docs = logs.map((item) => ({
      deviceId,
      routeId: item.routeId || null,
      timestamp: new Date(item.timestamp),
      lat: item.lat,
      lng: item.lng,
      speed: item.speed || 0,
      matchedSegment: item.matchedSegment || 0,
      eta: item.eta || 0
    }));

    const inserted = await MovementLog.insertMany(docs, { ordered: false });
    await Device.findOneAndUpdate(
      { deviceId },
      { deviceId, lastSeen: new Date(), status: "MOVING" },
      { upsert: true, new: true }
    );

    res.json({
      synced: inserted.length,
      lastSync: new Date().toISOString(),
      message: "Sync completed"
    });
  } catch (error) {
    next(error);
  }
};

const getSyncStatus = async (req, res, next) => {
  try {
    const deviceId = req.params.deviceId;
    const totalLogs = await MovementLog.countDocuments({ deviceId });
    const lastLog = await MovementLog.findOne({ deviceId }).sort({ timestamp: -1 });

    res.json({
      deviceId,
      totalLogs,
      lastSyncedAt: lastLog ? lastLog.timestamp : null
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { postSync, getSyncStatus };
