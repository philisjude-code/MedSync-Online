const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
    const message = req.body.message || "";

    let reply = "I couldn't understand. Please tell me more symptoms.";

    if (message.toLowerCase().includes("fever")) {
        reply = "It seems like you have a fever. Take rest and stay hydrated.";
    } else if (message.toLowerCase().includes("cold")) {
        reply = "You may be experiencing a cold. Drink warm fluids.";
    } else if (message.trim().length > 0) {
        reply = `You said: "${message}". Tell me more symptoms.`;
    }

    return res.json({ reply });
});

module.exports = router;
