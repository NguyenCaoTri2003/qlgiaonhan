require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const { verifyToken } = require("./middleware/authMiddleware");

app.use("/api/orders", verifyToken, require("./routes/order.routes"));
app.use("/api/logs", verifyToken, require("./routes/logs.routes"));
app.use("/api/notifications", verifyToken, require("./routes/notifications.routes"));
app.use("/api/customers", verifyToken, require("./routes/customers.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", verifyToken, require("./routes/user.routes"));
app.use("/api/departments", verifyToken, require("./routes/department.routes"));
app.use("/api", require("./routes/sync.routes"));

app.listen(process.env.PORT, () => {
  console.log("Server running at http://localhost:" + process.env.PORT);
});