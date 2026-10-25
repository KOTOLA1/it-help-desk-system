const db = require("../config/db");

// =====================================================
// KNOWLEDGE BASE
// =====================================================

// GET ALL KNOWLEDGE BASE ARTICLES
const getKnowledgeBase = async (req, res) => {
    try {
        const [articles] = await db.query(`
            SELECT
                kb.id,
                kb.title,
                kb.content,
                kb.status,
                kb.created_at,
                kb.updated_at,

                c.id AS category_id,
                c.name AS category,

                u.id AS created_by_id,
                u.full_name AS created_by

            FROM knowledge_base kb

            LEFT JOIN categories c
                ON kb.category_id = c.id

            JOIN users u
                ON kb.created_by = u.id

            ORDER BY kb.created_at DESC
        `);

        res.json({
            success: true,
            count: articles.length,
            articles
        });

    } catch (error) {

        console.error(
            "Get knowledge base error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve knowledge base"
        });
    }
};


// CREATE KNOWLEDGE BASE ARTICLE
const createKnowledgeArticle = async (req, res) => {
    try {

        const {
            title,
            category_id,
            content,
            status
        } = req.body;

        if (
            !title ||
            !content
        ) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const articleStatus =
            ["draft", "published"].includes(status)
                ? status
                : "published";

        const [result] = await db.query(
            `
            INSERT INTO knowledge_base
            (
                title,
                category_id,
                content,
                created_by,
                status
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                title.trim(),
                category_id || null,
                content.trim(),
                req.user.id,
                articleStatus
            ]
        );

        res.status(201).json({
            success: true,
            message: "Knowledge base article created successfully",
            article_id: result.insertId
        });

    } catch (error) {

        console.error(
            "Create knowledge article error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create knowledge base article"
        });
    }
};


// DELETE KNOWLEDGE BASE ARTICLE
const deleteKnowledgeArticle = async (req, res) => {
    try {

        const { id } = req.params;

        const [articles] = await db.query(
            `
            SELECT id
            FROM knowledge_base
            WHERE id = ?
            `,
            [id]
        );

        if (articles.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Article not found"
            });

        }

        await db.query(
            `
            DELETE FROM knowledge_base
            WHERE id = ?
            `,
            [id]
        );

        res.json({
            success: true,
            message: "Knowledge base article deleted successfully"
        });

    } catch (error) {

        console.error(
            "Delete knowledge article error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to delete article"
        });
    }
};


// =====================================================
// ASSETS
// =====================================================

// GET ALL ASSETS
const getAssets = async (req, res) => {
    try {

        const [assets] = await db.query(`
            SELECT

                a.id,
                a.asset_tag,
                a.asset_type,
                a.brand,
                a.model,
                a.serial_number,
                a.status,
                a.created_at,

                u.id AS assigned_to_id,
                u.full_name AS assigned_to,

                d.id AS department_id,
                d.name AS department

            FROM assets a

            LEFT JOIN users u
                ON a.assigned_to = u.id

            LEFT JOIN departments d
                ON a.department_id = d.id

            ORDER BY a.created_at DESC
        `);

        res.json({
            success: true,
            count: assets.length,
            assets
        });

    } catch (error) {

        console.error(
            "Get assets error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to retrieve assets"
        });
    }
};


// CREATE ASSET
const createAsset = async (req, res) => {
    try {

        const {
            asset_tag,
            asset_type,
            brand,
            model,
            serial_number,
            department_id,
            status
        } = req.body;

        if (
            !asset_tag ||
            !asset_type
        ) {
            return res.status(400).json({
                success: false,
                message: "Asset tag and asset type are required"
            });
        }

        const [existing] = await db.query(
            `
            SELECT id
            FROM assets
            WHERE asset_tag = ?
            `,
            [asset_tag.trim()]
        );

        if (existing.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Asset tag already exists"
            });

        }

        const validStatuses = [
            "Available",
            "Assigned",
            "Maintenance",
            "Retired"
        ];

        const assetStatus =
            validStatuses.includes(status)
                ? status
                : "Available";

        const [result] = await db.query(
            `
            INSERT INTO assets
            (
                asset_tag,
                asset_type,
                brand,
                model,
                serial_number,
                department_id,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                asset_tag.trim(),
                asset_type.trim(),
                brand ? brand.trim() : null,
                model ? model.trim() : null,
                serial_number
                    ? serial_number.trim()
                    : null,
                department_id || null,
                assetStatus
            ]
        );

        res.status(201).json({
            success: true,
            message: "Asset created successfully",
            asset_id: result.insertId
        });

    } catch (error) {

        console.error(
            "Create asset error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to create asset"
        });
    }
};


// ASSIGN ASSET
const assignAsset = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            assigned_to
        } = req.body;

        if (!assigned_to) {

            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });

        }

        const [assets] = await db.query(
            `
            SELECT id
            FROM assets
            WHERE id = ?
            `,
            [id]
        );

        if (assets.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });

        }

        const [users] = await db.query(
            `
            SELECT id
            FROM users
            WHERE id = ?
            AND status = 'active'
            `,
            [assigned_to]
        );

        if (users.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Invalid or inactive user"
            });

        }

        await db.query(
            `
            UPDATE assets

            SET
                assigned_to = ?,
                status = 'Assigned'

            WHERE id = ?
            `,
            [
                assigned_to,
                id
            ]
        );

        res.json({
            success: true,
            message: "Asset assigned successfully"
        });

    } catch (error) {

        console.error(
            "Assign asset error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to assign asset"
        });
    }
};


// UPDATE ASSET STATUS
const updateAssetStatus = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            status
        } = req.body;

        const validStatuses = [
            "Available",
            "Assigned",
            "Maintenance",
            "Retired"
        ];

        if (!validStatuses.includes(status)) {

            return res.status(400).json({
                success: false,
                message: "Invalid asset status"
            });

        }

        const [assets] = await db.query(
            `
            SELECT id
            FROM assets
            WHERE id = ?
            `,
            [id]
        );

        if (assets.length === 0) {

            return res.status(404).json({
                success: false,
                message: "Asset not found"
            });

        }

        if (status === "Available") {

            await db.query(
                `
                UPDATE assets

                SET
                    status = ?,
                    assigned_to = NULL

                WHERE id = ?
                `,
                [
                    status,
                    id
                ]
            );

        } else {

            await db.query(
                `
                UPDATE assets

                SET status = ?

                WHERE id = ?
                `,
                [
                    status,
                    id
                ]
            );

        }

        res.json({
            success: true,
            message: "Asset status updated successfully"
        });

    } catch (error) {

        console.error(
            "Update asset status error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update asset status"
        });
    }
};


module.exports = {

    getKnowledgeBase,
    createKnowledgeArticle,
    deleteKnowledgeArticle,

    getAssets,
    createAsset,
    assignAsset,
    updateAssetStatus

};