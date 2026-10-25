const express = require("express");

const {
    getKnowledgeBase,
    createKnowledgeArticle,
    deleteKnowledgeArticle,

    getAssets,
    createAsset,
    assignAsset,
    updateAssetStatus

} = require("../controllers/managementController");

const {
    authenticate,
    authorize
} = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// KNOWLEDGE BASE
// =====================================================

// Everyone logged in can view articles
router.get(
    "/knowledge-base",
    authenticate,
    getKnowledgeBase
);


// Admin and Help Desk can create
router.post(
    "/knowledge-base",
    authenticate,
    authorize("admin", "helpdesk"),
    createKnowledgeArticle
);


// Admin and Help Desk can delete
router.delete(
    "/knowledge-base/:id",
    authenticate,
    authorize("admin", "helpdesk"),
    deleteKnowledgeArticle
);


// =====================================================
// ASSETS
// =====================================================

// Admin and Help Desk can view assets
router.get(
    "/assets",
    authenticate,
    authorize("admin", "helpdesk"),
    getAssets
);


// Admin only can create assets
router.post(
    "/assets",
    authenticate,
    authorize("admin"),
    createAsset
);


// Admin and Help Desk can assign assets
router.put(
    "/assets/:id/assign",
    authenticate,
    authorize("admin", "helpdesk"),
    assignAsset
);


// Admin and Help Desk can update status
router.put(
    "/assets/:id/status",
    authenticate,
    authorize("admin", "helpdesk"),
    updateAssetStatus
);


module.exports = router;