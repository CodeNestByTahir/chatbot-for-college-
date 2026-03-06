function openMenu() {
    // Target the actual mobile menu div
    document.getElementById("mobileMenu").classList.add("active");
}

function closeMenu() {
    document.getElementById("mobileMenu").classList.remove("active");
}

function openPage(id) {
    closeMenu(); // Close the menu first
    document.getElementById(id).classList.add("active");
}

function closePage() {
    // Remove active class from all boxes to hide them
    document.querySelectorAll(".box").forEach(p => {
        p.classList.remove("active");
    });
}
//document.getElementById("send-btn").addEventListener("click",sendMessage);
document.getElementById("user-input").addEventListener("keypress",function(e){
    if(e.key === "Enter"){
    sendMessage();
    }
});
function sendMessage(){
    
    let input = document.getElementById("user-input");
    let message = input.value;

    if(message.trim() === "") return;

    addMessage(message,"user-msg");

    input.value = "";

    botReply(message);
    // Bot reply simulation
    // setTimeout(()=>{
    //     let botReply = "This is bot reply";
    //     //addMessage(botReply,"bot");
    // },1000);

}
//add msg to chatbody
function addMessage(text, className) {
    let chatBody = document.getElementById("chat-body");
    let messageDiv = document.createElement("div");
    messageDiv.className = className;
    messageDiv.innerText = text;
    chatBody.appendChild(messageDiv);
    // AUTO SCROLL
    chatBody.scrollTop = chatBody.scrollHeight;
}

document.querySelectorAll(".suggestions button").forEach(btn=>{
    btn.addEventListener("click",function(){
        let text = this.innerText;
        addMessage(text,"user-msg");
        botReply(text);
    });
});

//add botreply
function botReply(userText) {
    //animation typing
    // let typing = document.createElement("div");
    // typing.className = "bot-reply";
    // typing.innerText = "Typing...";
    
    // let chat = document.getElementById("chat-body");
    // chat.appendChild(typing);

    setTimeout(function () {
        let reply = "Sorry, I am still learning. Please contact college office.";
        addMessage(reply, "bot-reply");
    }, 1000);

}