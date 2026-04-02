const MovementLog = require("../models/MovementLog");
const Device = require("../models/Device");
const Route = require("../models/Route");
const mapMatch = require("../utils/mapMatch");
const haversine = require("../utils/haversine");
const { calculateETA, detectStatus } = require("../utils/etaCalc");

const postTrack = async (req, res, next) => {
  try {
    const { deviceId, lat, lng, speed = 0, timestamp, routeId } = req.body;
    if (!deviceId || lat === undefined || lng === undefined || !timestamp) {
      res.status(400);
      throw new Error("deviceId, lat, lng, timestamp are required");
    }

    let activeRoute = null;
    if (routeId) {
      if (!routeId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400);
        throw new Error("Invalid routeId format");
      }
      activeRoute = await Route.findById(routeId);
    }
    if (!activeRoute) {
      activeRoute = await Route.findOne({});
    }

    const match = mapMatch(lat, lng, activeRoute ? activeRoute.waypoints : []);
    const nextPoint =
      activeRoute && activeRoute.waypoints[match.nearestIndex + 1]
        ? activeRoute.waypoints[match.nearestIndex + 1]
        : null;
    const distanceToNext = nextPoint ? haversine(lat, lng, nextPoint.lat, nextPoint.lng) : 0;
    const eta = Number.isFinite(calculateETA(distanceToNext, speed))
      ? calculateETA(distanceToNext, speed)
      : 0;

    const log = await MovementLog.create({
      deviceId,
      routeId: activeRoute ? activeRoute._id : null,
      timestamp: new Date(timestamp),
      lat,
      lng,
      speed,
      matchedSegment: match.segment,
      eta
    });

    const recent = await MovementLog.find({ deviceId }).sort({ timestamp: -1 }).limit(5);
    const speedHistory = recent.map((item) => item.speed).reverse();
    const status = detectStatus(speedHistory);

    await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        lastSeen: new Date(timestamp),
        currentRouteId: activeRoute ? activeRoute._id : null,
        status
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      id: log._id,
      matchedSegment: match.segment,
      nearestWaypointIndex: match.nearestIndex,
      mapMatchDistanceKm: Number(match.distanceKm.toFixed(4)),
      etaMinutes: eta,
      status
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const logs = await MovementLog.find({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 })
      .limit(200);
    res.json(logs);
  } catch (error) {
    next(error);
  }
};

const getStatus = async (req, res, next) => {
  try {
    const device = await Device.findOne({ deviceId: req.params.deviceId }).populate("currentRouteId");
    if (!device) {
      res.status(404);
      throw new Error("Device not found");
    }

    const latest = await MovementLog.findOne({ deviceId: req.params.deviceId }).sort({ timestamp: -1 });

    res.json({
      deviceId: device.deviceId,
      status: device.status,
      lastSeen: device.lastSeen,
      currentRoute: device.currentRouteId,
      latestLog: latest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { postTrack, getHistory, getStatus };
