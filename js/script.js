//Create an account on Firebase, and use the credentials they give you in place of the following
var config = {
  apiKey: "AIzaSyAi6lUUAZLrEnzBJLdYvfFFZsKVNRNv1nI",
  authDomain: "tuto-826bc.firebaseapp.com",
  databaseURL: "https://tuto-826bc.firebaseio.com",
  projectId: "tuto-826bc",
  storageBucket: "tuto-826bc.appspot.com",
  messagingSenderId: "598214492111",
  appId: "1:598214492111:web:4215623cf927af7eef9cba",
  measurementId: "G-S2911NRVND"
};
firebase.initializeApp(config);

var database = firebase.database().ref();
var locaVideo = document.getElementById("locaVideo");
var remoteVideo = document.getElementById("remoteVideo");
var yourId = Math.floor(Math.random()*1000000000);
//Create an account on Viagenie (http://numb.viagenie.ca/), and replace {'urls': 'turn:numb.viagenie.ca','credential': 'websitebeaver','username': 'websitebeaver@email.com'} with the information from your account
var servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'Test1234','username': 'rrmazouz@aol.com'}]};
var pc = new RTCPeerConnection(servers);
pc.onicecandidate = (event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
pc.onaddstream = (event => remoteVideo.srcObject = event.stream);


function sendMessage(senderId, data) {
    var msg = database.push({ sender: senderId, message: data });
    msg.remove();
}

function readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    if (sender != yourId) {
        if (msg.ice != undefined)
            pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => pc.createAnswer())
              .then(answer => pc.setLocalDescription(answer))
              .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})));
        else if (msg.sdp.type == "answer")
            pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};

database.on('child_added', readMessage);

function start() {
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => localVideo.srcObject = stream)
    .then(stream => pc.addStream(stream));
}

function call() {
  pc.createOffer()
    .then(offer => pc.setLocalDescription(offer) )
    .then(() => sendMessage(yourId, JSON.stringify({'sdp': pc.localDescription})) );
}

function goToPage() {
  window.location.href = 'https://ronimazouz1.github.io/index#tutor';
}

if (location.hash === "#tutor") {
  localVideo.onloadedmetadata = function() {
    call();
  };
}



//shows attachment preview
function readURL(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      $('#attachmentPreview').css({backgroundImage: "url('" + e.target.result + "')"});
      $('#attachmentPreview').show(650);
    }
    reader.readAsDataURL(input.files[0]);
  }
}

$("#attach").change(function() {
  readURL(this);
});

function closeAttachment() {
  $('#attachmentPreview').hide(350);
  $('#attach').val('');
}

//resize textarea
const textarea = document.querySelector('textarea');
textarea.addEventListener('input', autosize);
function autosize() {
  const el = this;
  setTimeout(function() {
    el.style.cssText = 'height:auto;';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  }, 0);
}


//TEXT MESSENGER PART

function createTextConnection() {
  console.log('Sending offer to peer');
  //create channel for chat
  var dataChannelParams = {
      reliable: true,
      ordered: true
  };
var dataChannel = pc.createDataChannel("chat", dataChannelParams);

  pc.ondatachannel = function(event) {
      var receiveChannel = event.channel;
      receiveChannel.onmessage = function(event) {
          console.log("I receive: " + event.data);
          document.querySelector("textarea#receiveText").innerHTML = event.data;
      };
  };

  document.querySelector("button#sendMessage").onclick = function() {
      var data = document.querySelector("textarea#text-message").value;
      console.log("invio questo messaggio: " + data);
      dataChannel.send(data);
  };

  dataChannel.onmessage = function(event) {
    document.querySelector("textarea#receiveText").innerHTML = event.data;
};

  // pc.createOffer(setLocalAndSendMessage, handleCreateOfferError);
}


