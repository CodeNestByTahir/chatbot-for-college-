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