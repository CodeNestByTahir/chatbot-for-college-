function openMenu() {
    document.getElementById("mobileMenu").classList.add("active");
}

function closeMenu() {
    document.getElementById("mobileMenu").classList.remove("active");
}

function openPage(id) {
    closeMenu();
    document.getElementById(id).classList.add("active");
}

function closePage() {
    document.querySelectorAll(".box").forEach(p => {
        p.classList.remove("active");
    });
}

document.getElementById("user-input").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});


// SUGGESTED QUESTIONS
document.querySelectorAll(".suggestions button").forEach(btn => {
    btn.addEventListener("click", function () {

        let text = this.innerText;

        document.getElementById("user-input").value = text;   // CHANGED
        sendMessage();                                        // CHANGED

    });
});


// SEND MESSAGE TO BACKEND
async function sendMessage() {

    let input = document.getElementById("user-input");
    let message = input.value;

    if (message.trim() === "") return;

    addMessage(message, "user-msg");

    input.value = "";

    try {

        const response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        addMessage(data.reply, "bot-reply");

    } catch (error) {
        addMessage("Server error. Please try again.", "bot-reply");
        console.error(error);
    }
}


// ADD MESSAGE TO CHAT
function addMessage(text, className) {

    let chatBody = document.getElementById("chat-body");

    let messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.innerText = text;

    chatBody.appendChild(messageDiv);

    chatBody.scrollTop = chatBody.scrollHeight;
}

const BACKEND = "http://127.0.0.1:5000"
const ANNOUNCEMENT = "/chat/announcement"
async function loadAnnouncement() {
    const list = document.getElementById('announcement-list');

    try {
        const response = await fetch(BACKEND + ANNOUNCEMENT, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data = await response.json()
        if (data.status === "success" && response.ok && data.announcemnet_data.length > 0) {
            list.innerHTML = "";
            data.announcemnet_data.forEach(ann => {
                const card = document.createElement('div');
                card.className = "announcement-card-simple";

                card.innerHTML = `<p class="simple-desc">${ann.a_description}</p>`;

                list.appendChild(card);
            });
        } else {
            list.innerHTML = "<li>No new announcements at this time.</li>";
        }

    } catch (error) {
        console.error("Error fetching announcements:", error);
        list.innerHTML = "<li>Failed to load announcements.</li>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadAnnouncement();

    document.getElementById("user-input").focus()
});
