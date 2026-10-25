const express = require("express");

const {
    getUsers,
    getUserMeta,
    createUser,
    updateUserStatus,
    updateUser
} = require("../controllers/userController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// ALL USER MANAGEMENT ROUTES ARE ADMIN ONLY
// ==========================================

// Get users
router.get(
    "/",
    authenticate,
    authorize("admin"),
    getUsers
);


// Get roles and departments
// IMPORTANT: This must come before /:id
router.get(
    "/meta",
    authenticate,
    authorize("admin"),
    getUserMeta
);


// Create user
router.post(
    "/",
    authenticate,
    authorize("admin"),
    createUser
);


// Update user
router.put(
    "/:id",
    authenticate,
    authorize("admin"),
    updateUser
);


// Activate / deactivate user
router.put(
    "/:id/status",
    authenticate,
    authorize("admin"),
    updateUserStatus
);


module.exports = router;