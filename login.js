const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    const message =
        document.getElementById("loginMessage");

    message.textContent = "Logging in...";

    try {

        const response = await fetch("/api/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            message.textContent =
                "Login successful!";

            window.location.href = "/report.html";

        } else {

            message.textContent =
                data.message;

        }

    } catch (error) {

        message.textContent =
            "Server connection failed.";

    }

});