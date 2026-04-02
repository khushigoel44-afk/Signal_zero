const axios = require("axios");

const predictEta = async (req, res, next) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL || "http://localhost:8000";
    const response = await axios.post(`${mlUrl}/predict`, req.body, {
      timeout: 8000
    });
    res.json(response.data);
  } catch (error) {
    const detail =
      error.response?.data?.detail ||
      error.message ||
      "Unable to fetch prediction from ML service";
    res.status(502).json({ message: detail });
  }
};

module.exports = { predictEta };
