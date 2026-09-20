const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");
const path = require("path");

const app = express();
const PORT = 3000;

// --------------------
// Middleware
// --------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "campus-lost-found-secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use(express.static(path.join(__dirname, "public")));

// --------------------
// HOME PAGE
// --------------------

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// --------------------
// MySQL Connection
// --------------------

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "krishna",
    database: "campus_lost_found"
});

// Test database connection

db.getConnection((err, connection) => {
    if (err) {
        console.log("❌ MySQL connection failed");
        console.log(err.message);
        return;
    }

    console.log("✅ MySQL Connected");
    connection.release();

    createDemoUser();
});

// --------------------
// Create Demo User
// --------------------

async function createDemoUser() {
    try {
        const password = await bcrypt.hash("123456", 10);

        const sql = `
            INSERT IGNORE INTO users
            (name, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(
            sql,
            ["Ananya", "student@campus.com", password],
            (err) => {
                if (err) {
                    console.log("Demo user error:", err.message);
                } else {
                    console.log("✅ Demo user ready");
                    console.log("Email: student@campus.com");
                    console.log("Password: 123456");
                }
            }
        );
    } catch (error) {
        console.log(error);
    }
}

// --------------------
// Login
// --------------------

app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Please enter email and password."
        });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            return res.json({
                success: false,
                message: "Database error."
            });
        }

        if (results.length === 0) {
            return res.json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const user = results[0];

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.json({
                success: false,
                message: "Invalid email or password."
            });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };

        res.json({
            success: true,
            message: "Login successful."
        });
    });
});

// --------------------
// Check Login
// --------------------

app.get("/api/me", (req, res) => {

    if (!req.session.user) {
        return res.json({
            loggedIn: false
        });
    }

    res.json({
        loggedIn: true,
        user: req.session.user
    });
});

// --------------------
// Logout
// --------------------

app.get("/api/logout", (req, res) => {

    req.session.destroy(() => {

        res.json({
            success: true
        });

    });

});

// --------------------
// Authentication Middleware
// --------------------

function requireLogin(req, res, next) {

    if (!req.session.user) {
        return res.status(401).json({
            success: false,
            message: "Please login first."
        });
    }

    next();
}

// --------------------
// Add Lost / Found Item
// --------------------

app.post("/api/items", requireLogin, (req, res) => {

    const {
        type,
        item_name,
        category,
        description,
        location,
        item_date,
        contact
    } = req.body;

    if (
        !type ||
        !item_name ||
        !category ||
        !location ||
        !item_date ||
        !contact
    ) {
        return res.json({
            success: false,
            message: "Please fill all required fields."
        });
    }

    const sql = `
        INSERT INTO items
        (
            user_id,
            type,
            item_name,
            category,
            description,
            location,
            item_date,
            contact
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            req.session.user.id,
            type,
            item_name,
            category,
            description,
            location,
            item_date,
            contact
        ],
        (err) => {

            if (err) {
                console.log(err);

                return res.json({
                    success: false,
                    message: "Unable to save item."
                });
            }

            res.json({
                success: true,
                message: "Item reported successfully!"
            });
        }
    );
});

// --------------------
// Get Items
// --------------------

app.get("/api/items", requireLogin, (req, res) => {

    const sql = `
        SELECT
            items.*,
            users.name AS reporter_name
        FROM items
        JOIN users
        ON items.user_id = users.id
        ORDER BY items.created_at DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.json({
                success: false,
                message: "Unable to fetch items."
            });
        }

        res.json({
            success: true,
            items: results
        });
    });
});

// --------------------
// Mark Item Recovered
// --------------------

app.put(
    "/api/items/:id/recover",
    requireLogin,
    (req, res) => {

        const itemId = req.params.id;

        const sql = `
            UPDATE items
            SET status = 'Recovered'
            WHERE id = ?
        `;

        db.query(sql, [itemId], (err) => {

            if (err) {
                return res.json({
                    success: false,
                    message: "Unable to update item."
                });
            }

            res.json({
                success: true,
                message: "Item marked as recovered."
            });
        });
    }
);

// --------------------
// Start Server
// --------------------

app.listen(PORT, () => {

    console.log(`
    ==================================
       CAMPUS LOST & FOUND
    ==================================

       Server running at:
       http://localhost:${PORT}

    `);

});