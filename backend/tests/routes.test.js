process.env.NODE_ENV = "test";
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const Route = require("../models/Route");

let mongoServer;

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
  await Route.deleteMany({});
});

test("GET /api/routes returns routes", async () => {
  await Route.create({
    name: "Test Route",
    type: "train",
    waypoints: [{ lat: 1, lng: 1, name: "A" }],
    totalDistance: 0
  });

  const res = await request(app).get("/api/routes");
  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBe(1);
});
