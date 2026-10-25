const express = require("express");

const {
    createTicket,
    getTickets,
    getTicketById,
    getTechnicians,
    addComment,
    assignTicket,
    updateTicketStatus,
    updateTicketPriority
} = require("../controllers/ticketController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// ==========================================
// CREATE TICKET
// ==========================================

router.post(
    "/",
    authenticate,
    createTicket
);


// ==========================================
// GET ALL TICKETS
// ==========================================

router.get(
    "/",
    authenticate,
    getTickets
);


// ==========================================
// GET TECHNICIANS
// IMPORTANT: This must come BEFORE /:id
// ==========================================

router.get(
    "/technicians",
    authenticate,
    authorize("admin", "helpdesk"),
    getTechnicians
);


// ==========================================
// GET SINGLE TICKET
// ==========================================

router.get(
    "/:id",
    authenticate,
    getTicketById
);


// ==========================================
// ADD COMMENT
// ==========================================

router.post(
    "/:id/comments",
    authenticate,
    addComment
);


// ==========================================
// ASSIGN TICKET
// ==========================================

router.put(
    "/:id/assign",
    authenticate,
    authorize("admin", "helpdesk"),
    assignTicket
);


// ==========================================
// UPDATE STATUS
// ==========================================

router.put(
    "/:id/status",
    authenticate,
    authorize("admin", "helpdesk"),
    updateTicketStatus
);


// ==========================================
// UPDATE PRIORITY
// ==========================================

router.put(
    "/:id/priority",
    authenticate,
    authorize("admin", "helpdesk"),
    updateTicketPriority
);


module.exports = router;