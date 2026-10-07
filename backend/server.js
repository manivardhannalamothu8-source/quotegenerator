const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const favoritesFile = path.join(__dirname, "data", "favorites.json");
const quotesFile = path.join(__dirname, "data", "quotes.json");

// Read JSON file
function readJSON(file) {
    try {
        const data = fs.readFileSync(file, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Write JSON file
function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Get random quote from public API
app.get("/api/quotes/random", async (req, res) => {
    try {
        const response = await axios.get(
            "https://dummyjson.com/quotes/random"
        );

        res.json({
            id: response.data.id,
            text: response.data.quote,
            author: response.data.author
        });

    } catch (error) {
        console.log("Public API failed. Using local quotes.");

        const quotes = readJSON(quotesFile);

        if (quotes.length === 0) {
            return res.status(500).json({
                message: "No quotes available"
            });
        }

        const randomQuote =
            quotes[Math.floor(Math.random() * quotes.length)];

        res.json({
            id: randomQuote.id,
            text: randomQuote.text,
            author: randomQuote.author,
            topic: randomQuote.topic
        });
    }
});

// Get all favorite quotes
app.get("/api/favorites", (req, res) => {
    const favorites = readJSON(favoritesFile);
    res.json(favorites);
});

// Add favorite quote
app.post("/api/favorites", (req, res) => {
    const { text, author, topic } = req.body;

    if (!text || !author) {
        return res.status(400).json({
            message: "Quote text and author are required"
        });
    }

    const favorites = readJSON(favoritesFile);

    // Prevent duplicate favorites
    const alreadyExists = favorites.some(
        quote => quote.text === text && quote.author === author
    );

    if (alreadyExists) {
        return res.status(409).json({
            message: "Quote already exists in favorites"
        });
    }

    const newFavorite = {
        id: Date.now(),
        text,
        author,
        topic: topic || "General",
        savedAt: new Date().toISOString()
    };

    favorites.push(newFavorite);
    writeJSON(favoritesFile, favorites);

    res.status(201).json(newFavorite);
});

// Delete favorite quote
app.delete("/api/favorites/:id", (req, res) => {
    const id = Number(req.params.id);

    const favorites = readJSON(favoritesFile);

    const updatedFavorites = favorites.filter(
        quote => quote.id !== id
    );

    if (favorites.length === updatedFavorites.length) {
        return res.status(404).json({
            message: "Favorite quote not found"
        });
    }

    writeJSON(favoritesFile, updatedFavorites);

    res.json({
        message: "Favorite deleted successfully"
    });
});

// Test route
app.get("/", (req, res) => {
    res.send("Quote Generator API is running!");
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});