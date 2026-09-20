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


// Submit report

const reportForm =
    document.getElementById("reportForm");

reportForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const reportMessage =
            document.getElementById(
                "reportMessage"
            );

        const itemData = {

            type:
                document.getElementById("type").value,

            item_name:
                document.getElementById("item_name").value,

            category:
                document.getElementById("category").value,

            description:
                document.getElementById("description").value,

            location:
                document.getElementById("location").value,

            item_date:
                document.getElementById("item_date").value,

            contact:
                document.getElementById("contact").value

        };


        try {

            const response = await fetch(
                "/api/items",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(itemData)
                }
            );


            const data =
                await response.json();


            if (data.success) {

                reportMessage.textContent =
                    "✅ " + data.message;

                reportForm.reset();

            } else {

                reportMessage.textContent =
                    "❌ " + data.message;

            }

        } catch (error) {

            reportMessage.textContent =
                "❌ Server error.";

        }

    }
);


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