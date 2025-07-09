let input = document.getElementById("input")
let submit_button = document.getElementById("submit")
let chat = document.querySelector("chat");

function send_message() {
    if (input.value === '') {
        return
    }
    fetch("/", {
        method: "POST",
        body: input.value,
        headers: {
            "Content-Type": "text/plain; charset=UTF-8"
        }
    });

    input.value = ''
}

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        send_message()
    }
})

submit_button.addEventListener("click", send_message)

let message_number = 0;
const interval = 100
let current_interval = 0;

(async () => {
    while (true) {
        await fetch(`/message/${message_number}`)
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                }
                else if (response.status === 204) {
                    current_interval = interval
                    return null
                }
                throw new Error(`Unexpected status code: ${response.status}`);
            })
            .then(data => {
                if (data) {
                    console.log(data);
                    let message_box = document.createElement("message");
                    let user = document.createElement("pre")
                    let message = document.createElement("pre")
                    user.innerText = data['user']
                    message.innerHTML = data['message']
                    message_box.appendChild(user)
                    message_box.appendChild(message)
                    chat.prepend(message_box)
                    ++message_number;
                }
            })
            .catch(error => {
                console.error("Fetch error:", error);
            });
        await new Promise(resolve => setTimeout(resolve, current_interval));
    }
})();