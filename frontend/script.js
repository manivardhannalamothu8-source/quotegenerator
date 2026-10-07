```javascript
// ==========================================
// QUOTE GENERATOR - FRONTEND JAVASCRIPT
// ==========================================

// Live Render Backend
const API_URL = "https://quotegenerator-ad7y.onrender.com/api";


// Current quote displayed on screen
let currentQuote = null;


// HTML elements
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteTopic = document.getElementById("quoteTopic");

const newQuoteBtn = document.getElementById("newQuoteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const copyBtn = document.getElementById("copyBtn");

const refreshBtn = document.getElementById("refreshBtn");
const favoritesList = document.getElementById("favoritesList");

const message = document.getElementById("message");


// ==========================================
// SHOW MESSAGE
// ==========================================

function showMessage(text) {

    message.textContent = text;

    setTimeout(() => {
        message.textContent = "";
    }, 2500);
}


// ==========================================
// GET RANDOM QUOTE
// ==========================================

async function getRandomQuote() {

    try {

        quoteText.textContent = "Loading quote...";
        quoteAuthor.textContent = "";
        quoteTopic.textContent = "";

        const response = await fetch(
            `${API_URL}/quotes/random`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }

        const quote = await response.json();

        currentQuote = quote;

        quoteText.textContent = `"${quote.text}"`;

        quoteAuthor.textContent =
            `— ${quote.author}`;

        quoteTopic.textContent =
            quote.topic || "General";

        favoriteBtn.disabled = false;

    } catch (error) {

        console.error(
            "Quote error:",
            error
        );

        quoteText.textContent =
            "Unable to load quote.";

        quoteAuthor.textContent =
            "Please try again.";

        quoteTopic.textContent = "";

        showMessage(
            "❌ Unable to load quote"
        );
    }
}


// ==========================================
// ADD QUOTE TO FAVORITES
// ==========================================

async function addFavorite() {

    if (!currentQuote) {

        showMessage(
            "Please load a quote first."
        );

        return;
    }


    try {

        favoriteBtn.disabled = true;

        const response = await fetch(
            `${API_URL}/favorites`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    text:
                        currentQuote.text,

                    author:
                        currentQuote.author,

                    topic:
                        currentQuote.topic ||
                        "General"

                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            showMessage(
                `⚠️ ${data.message}`
            );

            favoriteBtn.disabled = false;

            return;
        }


        showMessage(
            "❤️ Added to favorites!"
        );


        await loadFavorites();


    } catch (error) {

        console.error(
            "Favorite error:",
            error
        );

        showMessage(
            "❌ Failed to