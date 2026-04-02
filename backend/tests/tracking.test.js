process.env.NODE_ENV = "test";
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const Route = require("../models/Route");

let mongoServer;
let routeId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await mongoose.connection.dropDatabase();
  const route = await Route.create({
    name: "Track Route",
    type: "logistics",
    waypoints: [
      { lat: 19.076, lng: 72.8777, name: "Start" },
      { lat: 19.033, lng: 73.0297, name: "Mid" },
      { lat: 18.9894, lng: 73.1175, name: "End" }
    ],
    totalDistance: 20
  });
  routeId = route._id.toString();
});

test("POST /api/track stores and returns status", async () => {
  const payload = {
    deviceId: "device-001",
    routeId,
    lat: 19.07,
    lng: 72.88,
    speed: 35,
    timestamp: new Date().toISOString()
  };

  const res = await request(app).post("/api/track").send(payload);
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty("matchedSegment");
  expect(res.body).toHaveProperty("etaMinutes");
});
