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
pc.onicecandidate = 
(event => event.candidate?sendMessage(yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );

pc.onaddstream = 
(event => remoteVideo.srcObject = event.stream);


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


//textChat Bubble




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

var count = 1;
$('.message-submit').click(function() {
    $('<div />', { class:'my-message' , id:'my-message-' + count})
       .append($('<b>' + 'moi'+ '</b>'))
       .append(document.getElementsByClassName('message-input')[0].value)
       .append($('<div />', { class:'attachment-container', id:'container-' + count }))
       .append('<span class="time" id="my-datetime">' +  ( (("0"+new Date().getHours()).slice(-2)) +":"+ (("0"+new Date().getMinutes()).slice(-2))) + '</span>')
       .appendTo("#div-messenger");
       $('#my-message-' + count).hide();
       $('#my-message-' + count).fadeIn(650);


       const input = document.getElementById('attach');
       if (input.files && input.files[0]) {
           const reader = new FileReader();
           reader.onload = function() {
               var i = count -1;
               var id = 'container-' + i;
               $('#' + id).fadeIn(650);
               $('#' + id).css('background-image', 'url(' + reader.result + ')');
           };
           reader.readAsDataURL(input.files[0]);
         }


    setTimeout(() => {
        $('#div-messenger').animate({scrollTop: $('#div-messenger').get(0).scrollHeight}, 400);
    }, 100);
    
    setTimeout(function() {
        textarea.style.cssText = 'height:auto';
        textarea.style.cssText = 'height:' + this.scrollHeight + 'px';
        document.getElementById("text-message").value = "";
    }, 0);

    $('#attachmentPreview').hide(350);
    $('#attach').val('');
    count++;
    sendData();
  });



let localConnection;
let remoteConnection;
let sendChannel;
let receiveChannel;
const dataChannelSend = document.querySelector('textarea#text-message');
const dataChannelReceive = document.querySelector('textarea#receiveText');




function createTextConnection() {
  dataChannelSend.placeholder = '';
  const servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'Test1234','username': 'rrmazouz@aol.com'}]};
  window.localConnection = localConnection = new RTCPeerConnection(servers);
  console.log('Created local peer connection object localConnection');

  sendChannel = pc.createDataChannel('sendDataChannel');
  console.log('Created send data channel');

  localConnection.onicecandidate = e => {
    onIceCandidate(localConnection, e);
  };
  sendChannel.onopen = onSendChannelStateChange;
  sendChannel.onclose = onSendChannelStateChange;

  window.remoteConnection = remoteConnection = new RTCPeerConnection(servers);
  console.log('Created remote peer connection object remoteConnection');

  remoteConnection.onicecandidate = e => {
    onIceCandidate(remoteConnection, e);
  };
  remoteConnection.ondatachannel = receiveChannelCallback;

  localConnection.createOffer().then(
    gotDescription1,
    onCreateSessionDescriptionError,
  );
}

function onCreateSessionDescriptionError(error) {
  console.log('Failed to create session description: ' + error.toString());
}

function sendData() {
  const data = dataChannelSend.value;
  sendChannel.send(data);
  console.log('Sent Data: ' + data);
}

function closeDataChannels() {
  console.log('Closing data channels');
  sendChannel.close();
  console.log('Closed data channel with label: ' + sendChannel.label);
  receiveChannel.close();
  console.log('Closed data channel with label: ' + receiveChannel.label);
  localConnection.close();
  remoteConnection.close();
  localConnection = null;
  remoteConnection = null;
  console.log('Closed peer connections');
  dataChannelSend.value = '';
  dataChannelReceive.value = '';
  dataChannelSend.disabled = true;
}

function gotDescription1(desc) {
  localConnection.setLocalDescription(desc);
  console.log(`Offer from localConnection\n${desc.sdp}`);
  remoteConnection.setRemoteDescription(desc);
  remoteConnection.createAnswer().then(
    gotDescription2,
    onCreateSessionDescriptionError
  );
}

function gotDescription2(desc) {
  remoteConnection.setLocalDescription(desc);
  console.log(`Answer from remoteConnection\n${desc.sdp}`);
  localConnection.setRemoteDescription(desc);
}

function getOtherPc(pc) {
  return (pc === localConnection) ? remoteConnection : localConnection;
}

function getName(pc) {
  return (pc === localConnection) ? 'localPeerConnection' : 'remotePeerConnection';
}

function onIceCandidate(pc, event) {
  getOtherPc(pc)
    .addIceCandidate(event.candidate)
    .then(
      () => onAddIceCandidateSuccess(pc),
      err => onAddIceCandidateError(pc, err)
    );
  console.log(`${getName(pc)} ICE candidate: ${event.candidate ? event.candidate.candidate : '(null)'}`);
}

function onAddIceCandidateSuccess() {
  console.log('AddIceCandidate success.');
}

function onAddIceCandidateError(error) {
  console.log(`Failed to add Ice Candidate: ${error.toString()}`);
}

function receiveChannelCallback(event) {
  console.log('Receive Channel Callback');
  receiveChannel = event.channel;
  receiveChannel.onmessage = onReceiveMessageCallback;
  receiveChannel.onopen = onReceiveChannelStateChange;
  receiveChannel.onclose = onReceiveChannelStateChange;
}

function onReceiveMessageCallback(event) {
  console.log('Received Message');
  dataChannelReceive.value = event.data;
}

function onSendChannelStateChange() {
  const readyState = sendChannel.readyState;
  console.log('Send channel state is: ' + readyState);
  if (readyState === 'open') {
    dataChannelSend.disabled = false;
    dataChannelSend.focus();
  } else {
    dataChannelSend.disabled = true;
  }
}

function onReceiveChannelStateChange() {
  const readyState = receiveChannel.readyState;
  console.log(`Receive channel state is: ${readyState}`);
}