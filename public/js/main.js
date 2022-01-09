const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
/// Get username and room from URL
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})

const socket = io();

// get room y users
socket.on('roomUsers',({ room, users})=>{
    ouputRoomName(room);
    outputUsers(users);
})
//join chatroom
socket.emit('joinRoom',{username,room})
socket.on('message',msg=>{
    console.log(msg);
    outputMessage(msg);
})

//Message submit
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.elements.msg.value;

    // Emit message to server
    socket.emit('chatMessage',msg);

    // clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//output  message to DOM
function outputMessage(msg){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
            <p class="meta">${msg.username} <span>${msg.time}</span></p>
            <p class="text">
                ${msg.text}
            </p>

    `
    document.querySelector('.chat-messages').appendChild(div);
    
    //scroll Down
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// add room nama to DOM
function ouputRoomName(room){
    roomName.innerText = room;
}

//add users to DOM

function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user=> `<li>${user.username}</li>`).join('')}
    `
}