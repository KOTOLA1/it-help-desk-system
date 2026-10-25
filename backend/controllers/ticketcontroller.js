const db = require("../config/db");

// ==========================================
// GENERATE TICKET NUMBER
// ==========================================

const generateTicketNumber = () => {
    const timestamp = Date.now().toString().slice(-8);
    return `TKT-${timestamp}`;
};


// ==========================================
// CREATE TICKET
// ==========================================

const createTicket = async (req, res) => {
    try {
        const {
            category_id,
            priority_id,
            subject,
            description
        } = req.body;

        if (!category_id || !subject || !description) {
            return res.status(400).json({
                success: false,
                message: "Category, subject and description are required"
            });
        }

        const ticketNumber = generateTicketNumber();

        const [result] = await db.query(
            `INSERT INTO tickets
            (
                ticket_number,
                user_id,
                category_id,
                priority_id,
                status_id,
                subject,
                description
            )
            VALUES (?, ?, ?, ?, 1, ?, ?)`,
            [
                ticketNumber,
                req.user.id,
                category_id,
                priority_id || 2,
                subject,
                description
            ]
        );

        await db.query(
            `INSERT INTO ticket_history
            (
                ticket_id,
                user_id,
                action,
                new_value
            )
            VALUES (?, ?, ?, ?)`,
            [
                result.insertId,
                req.user.id,
                "Ticket Created",
                ticketNumber
            ]
        );

        res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            ticket: {
                id: result.insertId,
                ticket_number: ticketNumber
            }
        });

    } catch (error) {
        console.error("Create ticket error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create ticket"
        });
    }
};


// ==========================================
// GET ALL TICKETS
// ==========================================

const getTickets = async (req, res) => {
    try {

        let query = `
            SELECT
                t.id,
                t.ticket_number,
                t.subject,
                t.description,
                t.created_at,
                t.updated_at,

                u.full_name AS requester,

                c.name AS category,

                p.name AS priority,

                s.name AS status,

                a.full_name AS assigned_to

            FROM tickets t

            JOIN users u
                ON t.user_id = u.id

            JOIN categories c
                ON t.category_id = c.id

            JOIN priorities p
                ON t.priority_id = p.id

            JOIN statuses s
                ON t.status_id = s.id

            LEFT JOIN users a
                ON t.assigned_to = a.id
        `;

        const params = [];

        if (req.user.role === "employee") {
            query += ` WHERE t.user_id = ?`;
            params.push(req.user.id);
        }

        query += ` ORDER BY t.created_at DESC`;

        const [tickets] = await db.query(
            query,
            params
        );

        res.json({
            success: true,
            count: tickets.length,
            tickets
        });

    } catch (error) {
        console.error("Get tickets error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve tickets"
        });
    }
};


// ==========================================
// GET SINGLE TICKET
// ==========================================

const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        const [tickets] = await db.query(
            `SELECT
                t.*,

                u.full_name AS requester,
                u.email AS requester_email,

                c.name AS category,

                p.name AS priority,

                s.name AS status,

                a.full_name AS assigned_to

             FROM tickets t

             JOIN users u
                ON t.user_id = u.id

             JOIN categories c
                ON t.category_id = c.id

             JOIN priorities p
                ON t.priority_id = p.id

             JOIN statuses s
                ON t.status_id = s.id

             LEFT JOIN users a
                ON t.assigned_to = a.id

             WHERE t.id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const ticket = tickets[0];

        if (
            req.user.role === "employee" &&
            ticket.user_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const [comments] = await db.query(
            `SELECT
                tc.id,
                tc.comment,
                tc.created_at,

                u.full_name,

                r.name AS role

             FROM ticket_comments tc

             JOIN users u
                ON tc.user_id = u.id

             JOIN roles r
                ON u.role_id = r.id

             WHERE tc.ticket_id = ?

             ORDER BY tc.created_at ASC`,
            [id]
        );

        const [history] = await db.query(
            `SELECT
                th.action,
                th.old_value,
                th.new_value,
                th.created_at,

                u.full_name

             FROM ticket_history th

             JOIN users u
                ON th.user_id = u.id

             WHERE th.ticket_id = ?

             ORDER BY th.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            ticket,
            comments,
            history
        });

    } catch (error) {
        console.error("Get ticket error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve ticket"
        });
    }
};


// ==========================================
// GET TECHNICIANS
// ==========================================

const getTechnicians = async (req, res) => {
    try {

        const [technicians] = await db.query(
            `SELECT
                u.id,
                u.full_name,
                u.username,
                u.email,
                r.name AS role
             FROM users u
             JOIN roles r
                ON u.role_id = r.id
             WHERE r.name IN ('admin', 'helpdesk')
             AND u.status = 'active'
             ORDER BY u.full_name ASC`
        );

        res.json({
            success: true,
            technicians
        });

    } catch (error) {
        console.error("Get technicians error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to retrieve technicians"
        });
    }
};


// ==========================================
// ADD COMMENT
// ==========================================

const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        if (!comment || !comment.trim()) {
            return res.status(400).json({
                success: false,
                message: "Comment is required"
            });
        }

        const [tickets] = await db.query(
            `SELECT user_id
             FROM tickets
             WHERE id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        if (
            req.user.role === "employee" &&
            tickets[0].user_id !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        await db.query(
            `INSERT INTO ticket_comments
            (
                ticket_id,
                user_id,
                comment
            )
            VALUES (?, ?, ?)`,
            [
                id,
                req.user.id,
                comment.trim()
            ]
        );

        res.status(201).json({
            success: true,
            message: "Comment added successfully"
        });

    } catch (error) {
        console.error("Add comment error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to add comment"
        });
    }
};


// ==========================================
// ASSIGN TICKET
// ==========================================

const assignTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { assigned_to } = req.body;

        if (!assigned_to) {
            return res.status(400).json({
                success: false,
                message: "Technician ID is required"
            });
        }

        const [tickets] = await db.query(
            `SELECT
                id,
                assigned_to
             FROM tickets
             WHERE id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const [technicians] = await db.query(
            `SELECT
                u.id
             FROM users u
             JOIN roles r
                ON u.role_id = r.id
             WHERE u.id = ?
             AND r.name IN ('admin', 'helpdesk')
             AND u.status = 'active'`,
            [assigned_to]
        );

        if (technicians.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid technician"
            });
        }

        const [technician] = await db.query(
            `SELECT full_name
             FROM users
             WHERE id = ?`,
            [assigned_to]
        );

        const [statuses] = await db.query(
            `SELECT id
             FROM statuses
             WHERE name = 'Assigned'`
        );

        const assignedStatusId = statuses[0].id;

        await db.query(
            `UPDATE tickets
             SET
                assigned_to = ?,
                status_id = ?
             WHERE id = ?`,
            [
                assigned_to,
                assignedStatusId,
                id
            ]
        );

        await db.query(
            `INSERT INTO ticket_history
            (
                ticket_id,
                user_id,
                action,
                old_value,
                new_value
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                id,
                req.user.id,
                "Ticket Assigned",
                tickets[0].assigned_to
                    ? String(tickets[0].assigned_to)
                    : "Unassigned",
                technician[0].full_name
            ]
        );

        res.json({
            success: true,
            message: "Ticket assigned successfully"
        });

    } catch (error) {
        console.error("Assign ticket error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to assign ticket"
        });
    }
};


// ==========================================
// UPDATE TICKET STATUS
// ==========================================

const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_id } = req.body;

        if (!status_id) {
            return res.status(400).json({
                success: false,
                message: "Status ID is required"
            });
        }

        const [tickets] = await db.query(
            `SELECT
                t.status_id,
                s.name AS old_status
             FROM tickets t
             JOIN statuses s
                ON t.status_id = s.id
             WHERE t.id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const [statuses] = await db.query(
            `SELECT
                id,
                name
             FROM statuses
             WHERE id = ?`,
            [status_id]
        );

        if (statuses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        const newStatus = statuses[0].name;

        await db.query(
            `UPDATE tickets
             SET
                status_id = ?,
                resolved_at =
                    CASE
                        WHEN ? = 'Resolved'
                        THEN CURRENT_TIMESTAMP
                        ELSE resolved_at
                    END,
                closed_at =
                    CASE
                        WHEN ? = 'Closed'
                        THEN CURRENT_TIMESTAMP
                        ELSE closed_at
                    END
             WHERE id = ?`,
            [
                status_id,
                newStatus,
                newStatus,
                id
            ]
        );

        await db.query(
            `INSERT INTO ticket_history
            (
                ticket_id,
                user_id,
                action,
                old_value,
                new_value
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                id,
                req.user.id,
                "Status Changed",
                tickets[0].old_status,
                newStatus
            ]
        );

        res.json({
            success: true,
            message: "Ticket status updated successfully"
        });

    } catch (error) {
        console.error("Update status error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update ticket status"
        });
    }
};


// ==========================================
// UPDATE TICKET PRIORITY
// ==========================================

const updateTicketPriority = async (req, res) => {
    try {
        const { id } = req.params;
        const { priority_id } = req.body;

        if (!priority_id) {
            return res.status(400).json({
                success: false,
                message: "Priority ID is required"
            });
        }

        const [tickets] = await db.query(
            `SELECT
                t.priority_id,
                p.name AS old_priority
             FROM tickets t
             JOIN priorities p
                ON t.priority_id = p.id
             WHERE t.id = ?`,
            [id]
        );

        if (tickets.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Ticket not found"
            });
        }

        const [priorities] = await db.query(
            `SELECT
                id,
                name
             FROM priorities
             WHERE id = ?`,
            [priority_id]
        );

        if (priorities.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority"
            });
        }

        const newPriority = priorities[0].name;

        await db.query(
            `UPDATE tickets
             SET priority_id = ?
             WHERE id = ?`,
            [
                priority_id,
                id
            ]
        );

        await db.query(
            `INSERT INTO ticket_history
            (
                ticket_id,
                user_id,
                action,
                old_value,
                new_value
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                id,
                req.user.id,
                "Priority Changed",
                tickets[0].old_priority,
                newPriority
            ]
        );

        res.json({
            success: true,
            message: "Ticket priority updated successfully"
        });

    } catch (error) {
        console.error("Update priority error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update ticket priority"
        });
    }
};


// ==========================================
// EXPORT FUNCTIONS
// ==========================================

module.exports = {
    createTicket,
    getTickets,
    getTicketById,
    getTechnicians,
    addComment,
    assignTicket,
    updateTicketStatus,
    updateTicketPriority
};