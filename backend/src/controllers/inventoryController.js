const db = require("../config/db");

// Get all inventory items
exports.getAll = (req, res) => {
    db.query("SELECT * FROM inventory ORDER BY item_name ASC", (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error", error: err });

        // Map to frontend expected format if needed, but existing frontend expects:
        // id, item_name, item_type, stock_quantity, unit, low_stock_threshold
        const mapped = results.map(i => ({
            id: i.id,
            item_name: i.item_name,
            item_type: i.item_type,
            stock_quantity: i.stock_quantity,
            unit: i.unit,
            low_stock_threshold: i.low_stock_threshold,
            barcode: i.barcode,
            expiry_date: i.expiry_date
        }));
        res.json(mapped);
    });
};

// Add or Update Item (Manual or Scan)
// Add or Update Item
exports.add = (req, res) => {
    const { id, name, category, quantity, unit, threshold, barcode, expiry } = req.body;

    console.log("Saving Item:", req.body);

    // Helper to format date for MySQL DATE column
    let formattedExpiry = expiry;
    if (expiry && expiry.includes('/')) {
        const parts = expiry.split('/');
        if (parts.length === 2) {
            // YYYY/MM -> YYYY-MM-01
            formattedExpiry = `${parts[0]}-${parts[1].padStart(2, '0')}-01`;
        } else if (parts.length === 3) {
            // YYYY/MM/DD -> YYYY-MM-DD
            formattedExpiry = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        }
    }

    // If ID is provided, update
    if (id) {
        const sql = `UPDATE inventory SET item_name=?, item_type=?, stock_quantity=?, unit=?, low_stock_threshold=?, barcode=?, expiry_date=? WHERE id=?`;
        db.query(sql, [name, category, quantity, unit, threshold, barcode, formattedExpiry, id], (err) => {
            if (err) {
                console.error("Update SQL Error:", err);
                return res.status(500).json({ message: "Update Failed", error: err });
            }
            res.json({ message: "Item updated successfully" });
        });
    } else {
        // Create new
        const sql = `INSERT INTO inventory (item_name, item_type, stock_quantity, unit, low_stock_threshold, barcode, expiry_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [name, category, quantity, unit, threshold, barcode, formattedExpiry], (err) => {
            if (err) {
                console.error("Insert SQL Error:", err);
                return res.status(500).json({ message: "Insert Failed", error: err });
            }
            res.json({ message: "Item added successfully" });
        });
    }
};

// Scan Barcode
exports.scan = (req, res) => {
    const { barcode } = req.body;
    db.query("SELECT * FROM inventory WHERE barcode = ?", [barcode], (err, results) => {
        if (err) return res.status(500).json({ message: "DB Error" });

        if (results.length > 0) {
            const i = results[0];
            res.json({
                found: true,
                item: {
                    id: i.id,
                    item_name: i.item_name,
                    item_type: i.item_type,
                    stock_quantity: i.stock_quantity,
                    unit: i.unit,
                    low_stock_threshold: i.low_stock_threshold,
                    barcode: i.barcode,
                    expiry_date: i.expiry_date
                }
            });
        } else {
            res.json({ found: false });
        }
    });
};

// Deduct Stock (Prescription)
exports.deduct = (req, res) => {
    const { id, quantity } = req.body;

    // Check current stock first
    db.query("SELECT stock_quantity, item_name, low_stock_threshold FROM inventory WHERE id = ?", [id], (err, results) => {
        if (err || results.length === 0) return res.status(404).json({ message: "Item not found" });

        const item = results[0];
        if (item.stock_quantity < quantity) {
            return res.status(400).json({ message: `Insufficient stock! Only ${item.stock_quantity} remaining.` });
        }

        const newQty = item.stock_quantity - quantity;
        const isLow = newQty < item.low_stock_threshold;

        db.query("UPDATE inventory SET stock_quantity = ? WHERE id = ?", [newQty, id], (updErr) => {
            if (updErr) return res.status(500).json({ message: "Update failed" });

            res.json({
                message: "Stock updated",
                remaining: newQty,
                warning: isLow ? `⚠️ Low Stock Alert: ${item.item_name} is running low!` : null
            });
        });
    });
};
