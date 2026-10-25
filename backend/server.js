const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const userRoutes = require("./routes/userRoutes");
const managementRoutes = require("./routes/managementRoutes");

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// ==========================================
// API ROUTES
// ==========================================

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/tickets",
    ticketRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/management",
    managementRoutes
);


// ==========================================
// ROOT
// ==========================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "IT Help Desk API is running 🚀"
    });

});


// ==========================================
// DATABASE TEST
// ==========================================

app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const [rows] =
                await db.query(
                    "SELECT 1 AS result"
                );

            res.json({
                success: true,
                message:
                    "Database connected successfully!",
                data: rows
            });

        } catch (error) {

            console.error(
                "Database error:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Database connection failed"
            });

        }

    }
);


// ==========================================
// 404
// ==========================================

app.use(
    (req, res) => {

        res.status(404).json({
            success: false,
            message:
                "API endpoint not found"
        });

    }
);


// ==========================================
// ERROR HANDLER
// ==========================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Server error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Internal server error"
        });

    }
);


// ==========================================
// START SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {

        console.log(
            `🚀 Server running on http://localhost:${PORT}`
        );

    }
);