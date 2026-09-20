let allItems = [];


// Check login

async function checkLogin() {

    const response =
        await fetch("/api/me");

    const data =
        await response.json();

    if (!data.loggedIn) {

        window.location.href =
            "/login.html";

    }

}

checkLogin();


// Load items

async function loadItems() {

    try {

        const response =
            await fetch("/api/items");

        const data =
            await response.json();

        if (data.success) {

            allItems = data.items;

            displayItems(allItems);

        }

    } catch (error) {

        console.log(error);

    }

}


// Display items

function displayItems(items) {

    const container =
        document.getElementById(
            "itemsContainer"
        );

    container.innerHTML = "";


    if (items.length === 0) {

        container.innerHTML = `

            <div class="no-items">

                <div class="empty-icon">
                    🔍
                </div>

                <h2>No items found</h2>

                <p>
                    Try changing your search
                    or filter.
                </p>

            </div>

        `;

        return;

    }


    items.forEach(item => {

        const card =
            document.createElement("div");

        card.className = "item-card";


        const typeClass =
            item.type === "Lost"
                ? "lost"
                : "found";


        const statusClass =
            item.status === "Recovered"
                ? "recovered"
                : "active";


        card.innerHTML = `

            <div class="card-top">

                <span class="type-badge ${typeClass}">
                    ${item.type}
                </span>

                <span class="status-badge ${statusClass}">
                    ${item.status}
                </span>

            </div>


            <h2>
                ${escapeHTML(item.item_name)}
            </h2>


            <div class="item-category">

                📁 ${escapeHTML(item.category)}

            </div>


            <p class="description">

                ${escapeHTML(
                    item.description ||
                    "No description provided."
                )}

            </p>


            <div class="details">

                <div>
                    📍
                    <strong>Location:</strong>
                    ${escapeHTML(item.location)}
                </div>

                <div>
                    📅
                    <strong>Date:</strong>
                    ${formatDate(item.item_date)}
                </div>

                <div>
                    📞
                    <strong>Contact:</strong>
                    ${escapeHTML(item.contact)}
                </div>

                <div>
                    👤
                    <strong>Reported by:</strong>
                    ${escapeHTML(item.reporter_name)}
                </div>

            </div>


            ${
                item.status === "Active"
                    ? `
                    <button
                        class="recover-button"
                        onclick="markRecovered(${item.id})"
                    >
                        ✅ Mark as Recovered
                    </button>
                    `
                    : `
                    <div class="recovered-message">
                        ✓ This item has been recovered
                    </div>
                    `
            }

        `;


        container.appendChild(card);

    });

}


// Search and filter

function filterItems() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();


    const type =
        document
            .getElementById("filterType")
            .value;


    const status =
        document
            .getElementById("filterStatus")
            .value;


    const filtered =
        allItems.filter(item => {

            const matchesSearch =

                item.item_name
                    .toLowerCase()
                    .includes(search)

                ||

                item.category
                    .toLowerCase()
                    .includes(search)

                ||

                item.location
                    .toLowerCase()
                    .includes(search);


            const matchesType =
                type === "All" ||
                item.type === type;


            const matchesStatus =
                status === "All" ||
                item.status === status;


            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );

        });


    displayItems(filtered);

}


document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        filterItems
    );


document
    .getElementById("filterType")
    .addEventListener(
        "change",
        filterItems
    );


document
    .getElementById("filterStatus")
    .addEventListener(
        "change",
        filterItems
    );


// Mark recovered

async function markRecovered(id) {

    const confirmUpdate =
        confirm(
            "Are you sure this item has been recovered?"
        );


    if (!confirmUpdate) {
        return;
    }


    const response =
        await fetch(
            `/api/items/${id}/recover`,
            {
                method: "PUT"
            }
        );


    const data =
        await response.json();


    if (data.success) {

        alert(
            "✅ Item marked as recovered!"
        );

        loadItems();

    } else {

        alert(data.message);

    }

}


// HTML safety

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


// Date formatting

function formatDate(date) {

    const d =
        new Date(date);

    return d.toLocaleDateString(
        "en-IN"
    );

}


// Logout

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        async function () {

            await fetch("/api/logout");

            window.location.href =
                "/login.html";

        }
    );


loadItems();