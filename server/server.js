const adminRoutes = require("./routes/adminRoutes");
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Ã°Å¸Å¡â‚¬ Server running on http://localhost:${PORT}`);
});
