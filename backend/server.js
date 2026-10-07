const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();

// Render provides PORT automatically.
// Locally it will use port 5000.
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// File paths
const favoritesFile = path.join(
    __dirname,
    "data",
    "favorites.json"
);

const quotesFile = path.join(
    __dirname,
    "data",
    "quotes.json"
);


// ===============================
// Read JSON File
// ===============================

function readJSON(file) {
    try {
        const data = fs.readFileSync(file, "utf8");

        return JSON.parse(data);

    } catch (error) {

        console.log("Error reading file:", error.message);

        return [];
    }
}


// ===============================
// Write JSON File
// ===============================

function writeJSON(file, data) {

    fs.writeFileSync(
        file,
        JSON.stringify(data, null, 2)
    );
}


// ===============================
// HOME / TEST ROUTE
// ===============================

app.get("/", (req, res) => {

    res.json({
        message: "Quote Generator API is running!",
        status: "success"
    });

});


// ===============================
// GET RANDOM QUOTE
// ===============================

app.get("/api/quotes/random", async (req, res) => {

    try {

        // Try public API first
        const response = await axios.get(
            "https://dummyjson.com/quotes/random"
        );

        res.json({

            id: response.data.id,

            text: response.data.quote,

            author: response.data.author

        });

    } catch (error) {

        console.log(
            "Public API failed. Using local quotes."
        );

        // Use local JSON as fallback
        const quotes = readJSON(quotesFile);

        if (quotes.length === 0) {

            return res.status(500).json({

                message: "No quotes available"

            });

        }

        const randomQuote =
            quotes[
                Math.floor(
                    Math.random() * quotes.length
                )
            ];

        res.json({

            id: randomQuote.id,

            text: randomQuote.text,

            author: randomQuote.author,

            topic: randomQuote.topic

        });

    }

});


// ===============================
// GET ALL FAVORITES
// ===============================

app.get("/api/favorites", (req, res) => {

    const favorites = readJSON(favoritesFile);

    res.json(favorites);

});


// ===============================
// ADD FAVORITE
// ===============================

app.post("/api/favorites", (req, res) => {

    const {
        text,
        author,
        topic
    } = req.body;


    // Validation
    if (!text || !author) {

        return res.status(400).json({

            message:
                "Quote text and author are required"

        });

    }


    const favorites =
        readJSON(favoritesFile);


    // Check duplicate
    const alreadyExists =
        favorites.some(

            quote =>
                quote.text === text &&
                quote.author === author

        );


    if (alreadyExists) {

        return res.status(409).json({

            message:
                "Quote already exists in favorites"

        });

    }


    // Create new favorite
    const newFavorite = {

        id: Date.now(),

        text: text,

        author: author,

        topic: topic || "General",

        savedAt:
            new Date().toISOString()

    };


    favorites.push(newFavorite);


    writeJSON(
        favoritesFile,
        favorites
    );


    res.status(201).json(newFavorite);

});


// ===============================
// DELETE FAVORITE
// ===============================

app.delete("/api/favorites/:id", (req, res) => {

    const id =
        Number(req.params.id);


    const favorites =
        readJSON(favoritesFile);


    const updatedFavorites =
        favorites.filter(

            quote =>
                quote.id !== id

        );


    if (
        favorites.length ===
        updatedFavorites.length
    ) {

        return res.status(404).json({

            message:
                "Favorite quote not found"

        });

    }


    writeJSON(
        favoritesFile,
        updatedFavorites
    );


    res.json({

        message:
            "Favorite deleted successfully"

    });

});


// ===============================
// START SERVER
// ===============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Quote Generator API running on port ${PORT}`
        );

    }
);