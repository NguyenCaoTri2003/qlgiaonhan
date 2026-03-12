// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());
// const path = require("path");

// const { verifyToken } = require("./middleware/authMiddleware");

// app.use("/api/orders", verifyToken, require("./routes/order.routes"));
// app.use("/api/logs", verifyToken, require("./routes/logs.routes"));
// app.use("/api/notifications", verifyToken, require("./routes/notifications.routes"));
// app.use("/api/customers", verifyToken, require("./routes/customers.routes"));
// app.use("/api/auth", require("./routes/auth.routes"));
// app.use("/api/users", verifyToken, require("./routes/user.routes"));
// app.use("/api/departments", verifyToken, require("./routes/department.routes"));
// app.use("/api", require("./routes/sync.routes"));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// app.listen(process.env.PORT, () => {
//   console.log("Server running at http://localhost:" + process.env.PORT);
// });

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

const path = require("path");

const { verifyToken } = require("./middleware/authMiddleware");

app.use("/api/orders", verifyToken, require("./routes/order.routes"));
app.use("/api/logs", verifyToken, require("./routes/logs.routes"));
app.use(
  "/api/notifications",
  verifyToken,
  require("./routes/notifications.routes"),
);
app.use("/api/customers", verifyToken, require("./routes/customers.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/users", verifyToken, require("./routes/user.routes"));
app.use("/api/departments", verifyToken, require("./routes/department.routes"));
app.use("/api", require("./routes/sync.routes"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/device", require("./routes/device.routes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ userId, role }) => {
    socket.join("user_" + userId);
    socket.join("role_" + role);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


server.listen(process.env.PORT, () => {
  console.log("Server running at http://localhost:" + process.env.PORT);
});
