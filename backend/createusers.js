const bcrypt = require("bcryptjs");
const db = require("./config/db");

const createUsers = async () => {
    try {
        // Get role IDs
        const [roles] = await db.query(
            "SELECT id, name FROM roles"
        );

        const roleMap = {};

        roles.forEach(role => {
            roleMap[role.name] = role.id;
        });

        // Get department IDs
        const [departments] = await db.query(
            "SELECT id, name FROM departments"
        );

        const departmentMap = {};

        departments.forEach(department => {
            departmentMap[department.name] = department.id;
        });

        // Passwords
        const adminPassword = await bcrypt.hash("Admin@123", 10);
        const helpdeskPassword = await bcrypt.hash("Helpdesk@123", 10);
        const employeePassword = await bcrypt.hash("Employee@123", 10);

        // Create Admin
        await db.query(
            `INSERT INTO users
            (role_id, department_id, full_name, username, email, phone, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                roleMap.admin,
                departmentMap["Information Technology"],
                "System Administrator",
                "admin",
                "admin@helpdesk.local",
                "0900000000",
                adminPassword
            ]
        );

        // Create Help Desk
        await db.query(
            `INSERT INTO users
            (role_id, department_id, full_name, username, email, phone, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                roleMap.helpdesk,
                departmentMap["Information Technology"],
                "Help Desk Agent",
                "helpdesk",
                "helpdesk@helpdesk.local",
                "0900000001",
                helpdeskPassword
            ]
        );

        // Create Employee
        await db.query(
            `INSERT INTO users
            (role_id, department_id, full_name, username, email, phone, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                roleMap.employee,
                departmentMap["Administration"],
                "Test Employee",
                "employee",
                "employee@helpdesk.local",
                "0900000002",
                employeePassword
            ]
        );

        console.log("✅ Users created successfully!");

        console.log("\nLogin credentials:");
        console.log("-----------------------------");
        console.log("Admin");
        console.log("Username: admin");
        console.log("Password: Admin@123");

        console.log("\nHelp Desk");
        console.log("Username: helpdesk");
        console.log("Password: Helpdesk@123");

        console.log("\nEmployee");
        console.log("Username: employee");
        console.log("Password: Employee@123");
        console.log("-----------------------------");

        process.exit(0);

    } catch (error) {
        console.error("❌ Error creating users:", error);
        process.exit(1);
    }
};

createUsers();