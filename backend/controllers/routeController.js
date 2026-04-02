const Route = require("../models/Route");

const getRoutes = async (req, res, next) => {
  try {
    const routes = await Route.find({}).sort({ createdAt: -1 });
    res.json(routes);
  } catch (error) {
    next(error);
  }
};

const getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) {
      res.status(404);
      throw new Error("Route not found");
    }
    res.json(route);
  } catch (error) {
    next(error);
  }
};

const createRoute = async (req, res, next) => {
  try {
    const { name, type, waypoints = [], totalDistance = 0 } = req.body;
    const route = await Route.create({ name, type, waypoints, totalDistance });
    res.status(201).json(route);
  } catch (error) {
    next(error);
  }
};

const getWaypointsByRouteId = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id).select("waypoints");
    if (!route) {
      res.status(404);
      throw new Error("Route not found");
    }
    res.json(route.waypoints);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRoutes, getRouteById, createRoute, getWaypointsByRouteId };
