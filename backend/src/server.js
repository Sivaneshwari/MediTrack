const cors = require("cors");
const express = require("express");

const adminRoutes = require("./routes/admin.routes");
const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staff.routes");
const studentRoutes = require("./routes/student.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', req.body);
    next();
});

const adminDashboardRoutes = require("./routes/adminDashboard.routes");
const forgotRoutes = require("./routes/forgot.routes");
const inventoryRoutes = require("./routes/inventory.routes");

app.use("/", authRoutes);
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/dashboard", adminDashboardRoutes);
app.use("/admin/dashboard/inventory", inventoryRoutes);
app.use("/forgot-password", forgotRoutes);
app.listen(3000, "0.0.0.0", () => {
    console.log("Server running on 0.0.0.0:3000");
});


/*const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});*/

