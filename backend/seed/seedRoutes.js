const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Route = require("../models/Route");
const haversine = require("../utils/haversine");

dotenv.config();

const routeData = [
  {
    name: "Delhi Metro North Line",
    type: "train",
    waypoints: [
      { lat: 28.7041, lng: 77.1025, name: "Rohini Depot" },
      { lat: 28.6692, lng: 77.1135, name: "Kashmere Gate" },
      { lat: 28.628, lng: 77.2188, name: "Rajiv Chowk" },
      { lat: 28.5896, lng: 77.2182, name: "Central Secretariat" },
      { lat: 28.5562, lng: 77.1, name: "Dwarka Sector 21" }
    ]
  },
  {
    name: "Mumbai Logistics Coastal Corridor",
    type: "logistics",
    waypoints: [
      { lat: 19.076, lng: 72.8777, name: "Mumbai Hub" },
      { lat: 19.033, lng: 73.0297, name: "Navi Mumbai Warehouse" },
      { lat: 18.9894, lng: 73.1175, name: "Panvel Junction" },
      { lat: 18.95, lng: 72.8347, name: "Port Delivery Node" }
    ]
  },
  {
    name: "Himalayan Trek Ridge Trail",
    type: "trekking",
    waypoints: [
      { lat: 30.3165, lng: 78.0322, name: "Trail Base Camp" },
      { lat: 30.337, lng: 78.0785, name: "Forest Viewpoint" },
      { lat: 30.365, lng: 78.111, name: "Ridge Camp" },
      { lat: 30.3922, lng: 78.1358, name: "Summit Point" }
    ]
  }
];

const computeDistance = (waypoints) => {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i += 1) {
    total += haversine(waypoints[i].lat, waypoints[i].lng, waypoints[i + 1].lat, waypoints[i + 1].lng);
  }
  return Number(total.toFixed(2));
};

const seed = async () => {
  await connectDB(process.env.MONGODB_URI);
  await Route.deleteMany({});

  const docs = routeData.map((route) => ({
    ...route,
    totalDistance: computeDistance(route.waypoints)
  }));

  await Route.insertMany(docs);
  console.log("Seeded routes successfully");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
