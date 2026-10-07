const API_URL = "http://localhost:5000/api";

let currentQuote = null;

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteTopic = document.getElementById("quoteTopic");

const newQuoteBtn = document.getElementById("newQuoteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const copyBtn = document.getElementById("copyBtn");
const refreshBtn = document.getElementById("refreshBtn");

const favoritesList = document.getElementById("favoritesList");
const message = document.getElementById("message");


// ===============================
// Get Random Quote
// ===============================

async function getRandomQuote() {

    try {

        message.textContent = "Loading...";

        const response = await fetch(`${API_URL}/quotes/random`);

        if (!response.ok) {
            throw new Error("Failed to fetch quote");
        }

        const quote = await response.json();

        currentQuote = quote;

        quoteText.textContent = `"${quote.text}"`;
        quoteAuthor.textContent = `— ${quote.author}`;

        if (quote.topic) {
            quoteTopic.textContent = quote.topic;
        } else {
            quoteTopic.textContent = "General";
        }

        message.textContent = "";

    } catch (error) {

        console.error(error);

        message.textContent = "Unable to load quote.";

    }
}


// ===============================
// Add Favorite
// ===============================

async function addFavorite() {

    if (!currentQuote) {
        message.textContent = "Please load a quote first.";
        return;
    }

    try {

        const response = await fetch(`${API_URL}/favorites`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                text: currentQuote.text,
                author: currentQuote.author,
                topic: currentQuote.topic || "General"
            })

        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        message.textContent = "❤️ Quote added to favorites!";

        loadFavorites();

    } catch (error) {

        console.error(error);

        message.textContent = "Failed to save favorite.";

    }
}


// ===============================
// Load Favorites
// ===============================

async function loadFavorites() {

    try {

        const response = await fetch(`${API_URL}/favorites`);

        const favorites = await response.json();

        favoritesList.innerHTML = "";

        if (favorites.length === 0) {

            favoritesList.innerHTML =
                `<p class="empty">No favorite quotes yet.</p>`;

            return;
        }

        favorites.reverse().forEach(quote => {

            const item = document.createElement("div");

            item.className = "favorite-item";

            item.innerHTML = `

                <p>"${quote.text}"</p>

                <strong>— ${quote.author}</strong>

                <div class="favorite-topic">
                    ${quote.topic || "General"}
                </div>

                <div class="favorite-actions">

                    <button
                        class="copy-favorite"
                        onclick="copyFavorite('${escapeText(quote.text)}', '${escapeText(quote.author)}')">
                        📋 Copy
                    </button>

                    <button
                        class="delete-favorite"
                        onclick="deleteFavorite(${quote.id})">
                        🗑 Delete
                    </button>

                </div>
            `;

            favoritesList.appendChild(item);

        });

    } catch (error) {

        console.error(error);

        favoritesList.innerHTML =
            `<p class="empty">Unable to load favorites.</p>`;

    }
}


// ===============================
// Delete Favorite
// ===============================

async function deleteFavorite(id) {

    try {

        const response = await fetch(
            `${API_URL}/favorites/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        message.textContent = data.message;

        loadFavorites();

    } catch (error) {

        console.error(error);

        message.textContent = "Failed to delete favorite.";

    }
}


// ===============================
// Copy Current Quote
// ===============================

async function copyCurrentQuote() {

    if (!currentQuote) {
        return;
    }

    const text =
        `"${currentQuote.text}" — ${currentQuote.author}`;

    await navigator.clipboard.writeText(text);

    message.textContent = "📋 Quote copied!";
}


// ===============================
// Copy Favorite
// ===============================

async function copyFavorite(text, author) {

    const quote =
        `"${text}" — ${author}`;

    await navigator.clipboard.writeText(quote);

    message.textContent = "📋 Quote copied!";
}


// ===============================
// Escape text
// ===============================

function escapeText(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

}


// ===============================
// Button Events
// ===============================

newQuoteBtn.addEventListener(
    "click",
    getRandomQuote
);

favoriteBtn.addEventListener(
    "click",
    addFavorite
);

copyBtn.addEventListener(
    "click",
    copyCurrentQuote
);

refreshBtn.addEventListener(
    "click",
    loadFavorites
);


// ===============================
// Initial Load
// ===============================

getRandomQuote();
loadFavorites();