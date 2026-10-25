const bcrypt = require("bcryptjs");
const db = require("../config/db");

// ==========================================
// GET ALL USERS
// ==========================================

const getUsers = async (req, res) => {
    try {
        const [users] = await db.query(`
            SELECT
                u.id,
                u.full_name,
                u.username,
                u.email,
                u.phone,
                u.status,
                u.created_at,
                u.updated_at,
                r.id AS role_id,
                r.name AS role,
                d.id AS department_id,
                d.name AS department
            FROM users u
            JOIN roles r
                ON u.role_id = r.id
            LEFT JOIN departments d
                ON u.department_id = d.id
            ORDER BY u.created_at DESC
        `);

        res.json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve users"
        });
    }
};


// ==========================================
// GET ROLES AND DEPARTMENTS
// ==========================================

const getUserMeta = async (req, res) => {
    try {
        const [roles] = await db.query(`
            SELECT id, name
            FROM roles
            ORDER BY id ASC
        `);

        const [departments] = await db.query(`
            SELECT id, name
            FROM departments
            ORDER BY name ASC
        `);

        res.json({
            success: true,
            roles,
            departments
        });

    } catch (error) {
        console.error("Get user metadata error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve roles and departments"
        });
    }
};


// ==========================================
// CREATE USER
// ==========================================

const createUser = async (req, res) => {
    try {
        const {
            full_name,
            username,
            email,
            phone,
            password,
            role_id,
            department_id
        } = req.body;

        if (
            !full_name ||
            !username ||
            !email ||
            !password ||
            !role_id ||
            !department_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name, username, email, password, role and department are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // Check username
        const [existingUsername] = await db.query(
            `SELECT id
             FROM users
             WHERE username = ?`,
            [username.trim()]
        );

        if (existingUsername.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Check email
        const [existingEmail] = await db.query(
            `SELECT id
             FROM users
             WHERE email = ?`,
            [email.trim()]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Validate role
        const [roles] = await db.query(
            `SELECT id
             FROM roles
             WHERE id = ?`,
            [role_id]
        );

        if (roles.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // Validate department
        const [departments] = await db.query(
            `SELECT id
             FROM departments
             WHERE id = ?`,
            [department_id]
        );

        if (departments.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid department"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        const [result] = await db.query(
            `INSERT INTO users
            (
                role_id,
                department_id,
                full_name,
                username,
                email,
                phone,
                password,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
            [
                role_id,
                department_id,
                full_name.trim(),
                username.trim(),
                email.trim(),
                phone ? phone.trim() : null,
                hashedPassword
            ]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: result.insertId,
                full_name: full_name.trim(),
                username: username.trim(),
                email: email.trim()
            }
        });

    } catch (error) {
        console.error("Create user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};


// ==========================================
// UPDATE USER STATUS
// ==========================================

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be active or inactive"
            });
        }

        // Prevent admin from deactivating themselves
        if (
            Number(id) === Number(req.user.id) &&
            status === "inactive"
        ) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account"
            });
        }

        const [users] = await db.query(
            `SELECT id
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await db.query(
            `UPDATE users
             SET status = ?
             WHERE id = ?`,
            [
                status,
                id
            ]
        );

        res.json({
            success: true,
            message: `User ${status === "active" ? "activated" : "deactivated"} successfully`
        });

    } catch (error) {
        console.error("Update user status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user status"
        });
    }
};


// ==========================================
// UPDATE USER
// ==========================================

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            full_name,
            email,
            phone,
            role_id,
            department_id
        } = req.body;

        if (
            !full_name ||
            !email ||
            !role_id ||
            !department_id
        ) {
            return res.status(400).json({
                success: false,
                message: "Full name, email, role and department are required"
            });
        }

        const [users] = await db.query(
            `SELECT id, username
             FROM users
             WHERE id = ?`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check whether email belongs to another user
        const [existingEmail] = await db.query(
            `SELECT id
             FROM users
             WHERE email = ?
             AND id != ?`,
            [
                email.trim(),
                id
            ]
        );

        if (existingEmail.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already belongs to another user"
            });
        }

        await db.query(
            `UPDATE users
             SET
                full_name = ?,
                email = ?,
                phone = ?,
                role_id = ?,
                department_id = ?
             WHERE id = ?`,
            [
                full_name.trim(),
                email.trim(),
                phone ? phone.trim() : null,
                role_id,
                department_id,
                id
            ]
        );

        res.json({
            success: true,
            message: "User updated successfully"
        });

    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    getUsers,
    getUserMeta,
    createUser,
    updateUserStatus,
    updateUser
};