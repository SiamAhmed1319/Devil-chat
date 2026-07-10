const socket = typeof io !== 'undefined' ? io() : null;
let currentRoom = "";

// চ্যাট রুমে জয়েন করার লজিক
function startChat() {
    const roomInput = document.getElementById('room-input').value.trim();
    if (!roomInput) return alert("Please enter a valid Room ID!");

    currentRoom = roomInput;

    if (socket) {
        socket.emit('join-room', currentRoom);
    } else {
        console.log("Server not running yet, opening chat in offline mode.");
    }

    // আইপি নম্বর ইন্টারফেসে সেট করা
    document.getElementById('room-display').innerText = currentRoom;
    
    // স্ক্রিন পরিবর্তন
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('chat-container').classList.remove('hidden');
    
    // ইনপুট বক্স সচল করা (যদি আগে ডিজেবল হয়ে থাকে)
    document.getElementById('message-input').disabled = false;
    document.getElementById('message-input').placeholder = "Message...";
}

// মেসেজ পাঠানোর লজিক
function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message || input.disabled) return; // খালি বা ব্লকড মেসেজ লক করা হলো

    // নিজের স্ক্রিনে মেসেজ দেখানো
    appendMessage(message, 'sent');

    if (socket) {
        socket.emit('send-message', { room: currentRoom, message: message });
    }
    
    input.value = "";
    input.focus(); // মেসেজ পাঠানোর পর ইনপুট বক্সে ফোকাস ধরে রাখা
}

// মেসেজ এবং কানেকশন স্ট্যাটাস রিসিভ করা
if (socket) {
    socket.on('receive-message', (message) => {
        appendMessage(message, 'received');
    });

    // রুমে কেউ কানেক্ট হলে বা অলরেডি কানেক্টেড থাকলে স্ট্যাটাস পরিবর্তন
    socket.on('user-connected', () => {
        const statusDiv = document.getElementById('connection-status');
        if (statusDiv) {
            statusDiv.innerText = "Connected";
            statusDiv.className = "status connected"; // সবুজ স্টাইল
        }
        // ইনপুট বক্স সচল করা
        document.getElementById('message-input').disabled = false;
        document.getElementById('message-input').placeholder = "Message...";
    });

    // কেউ ডিসকানেক্ট হয়ে গেলে স্ট্যাটাস লাল করা এবং চ্যাট লক করা
    socket.on('user-disconnected', () => {
        const statusDiv = document.getElementById('connection-status');
        if (statusDiv) {
            statusDiv.innerText = "Disconnected";
            statusDiv.className = "status disconnected"; // লাল স্টাইল
        }
        // ইনপুট বক্স ব্লক করে দেওয়া
        const input = document.getElementById('message-input');
        input.disabled = true;
        input.placeholder = "User left the chat. Please leave.";
    });
}

// স্ক্রিনে মেসেজ বাবল যোগ করা
function appendMessage(text, type) {
    const chatBox = document.getElementById('chat-box');
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('msg', type);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    
    // অটো স্ক্রোল ডাউন
    chatBox.scrollTop = chatBox.scrollHeight;
}

// এন্টার চাপলে মেসেজ পাঠানো
function handleKeyPress(event) {
    if (event.key === 'Enter') sendMessage();
}

// চ্যাট থেকে বের হয়ে যাওয়া (Destroy All)
function leaveChat() {
    currentRoom = "";
    
    // চ্যাট বক্সের মেসেজগুলো শুধু রিমুভ করা, কিন্তু স্ট্যাটাস ডিভ অক্ষত রাখা
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '<div id="connection-status" class="status">Waiting for other party to join...</div>';
    
    // ইনপুট ক্লিয়ার করা
    document.getElementById('room-input').value = "";
    document.getElementById('message-input').value = "";
    document.getElementById('message-input').disabled = false;
    
    // স্ক্রিন রিসেট
    document.getElementById('chat-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    
    // মেমোরি থেকে সম্পূর্ণ ডেটা ধ্বংস করতে পেজ হার্ড রিফ্রেশ
    window.location.reload();
}

// ট্যাব ক্লোজ বা ব্যাক বাটনে চ্যাট ধ্বংস
window.onbeforeunload = function() {
    leaveChat();
};