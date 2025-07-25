// // server/server.js

// console.log("[Server] script starting...");

// const express = require("express");
// const app = express();
// const path = require("path");

// app.use(express.static(path.join(__dirname, "../public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../public/index.html"));
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`[Server] running at http://localhost:${PORT}`);
// });


// Modified this to run app and email reciept services on the same port

// setting up db for orders storage
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error("[MySQL] Connection failed:", err.message);
  } else {
    console.log("[MySQL] Connected to database.");
  }
});


console.log("[Server] starting...");
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const nodemailer = require("nodemailer");

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// POST /send-confirmation → Email confirmation
app.post("/send-confirmation", async (req, res) => {
  const { fullName, email, phone, street, city, zip, cart } = req.body;

  if (!email || !cart || cart.length === 0) {
    return res.status(400).json({ success: false, error: "Missing order or email." });
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2);
  const items = cart.map(item =>
    `${item.qty} x ${item.name} - R${item.price.toFixed(2)} = R${(item.qty * item.price).toFixed(2)}`
  ).join("\n");

  const message = `
Hi ${fullName},

Thanks for your order from Big Dawg Sneakers! Here's your order summary:

Name: ${fullName}
Phone: ${phone}
Delivery Address: ${street}, ${city}, ${zip}

Items:
${items}

Total: R${total}

We'll let you know once your order is on the way!

Cheers,
Big Dawg Sneakers Team
  `;
// Save to MySQL
  const insertQuery = `
    INSERT INTO orders (full_name, email, phone, street, city, zip, cart, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    fullName,
    email,
    phone,
    street,
    city,
    zip,
    JSON.stringify(cart), // store cart as JSON string
    total
  ];

  db.query(insertQuery, values, (err, result) => {
    if (err) {
      console.error("[MySQL] Failed to insert order:", err.message);
    } else {
      console.log(`[MySQL] Order saved with ID: ${result.insertId}`);
    }
  });

  // Configure your email service
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,      // Use environment variable
      pass: process.env.EMAIL_PASSWORD   // Use App Password from Gmail
    }
  });

  const mailOptions = {
    from: `"Big Dawg Sneakers" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Order Confirmation",
    text: message
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[Server] Email sent to ${email}`);
    res.json({ success: true });
  } catch (err) {
    console.error("[Server] Email send failed:", err.message);
    res.status(500).json({ success: false, error: "Email failed to send." });
  }
});

app.listen(PORT, () => {
  console.log(`[Server] running at http://localhost:${PORT}`);
});
