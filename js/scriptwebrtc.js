var connection = new RTCMultiConnection();
var startTime;
var endTime;
// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';
connection.enableFileSharing = true; // by default, it is "false".


// comment-out below line if you do not have your own socket.io server
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'Video-Plus-Text-Chat';
connection.maxParticipantsAllowed=2;
connection.session = {
    audio: true,
    video: true,
    data: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

// https://www.rtcmulticonnection.org/docs/iceServers/
// use your own TURN-server here!
connection.iceServers=[];
connection.iceServers = [{
    urls: [ "stun:167.71.39.251" ]
}, {
    username: "test",
    credential: "test",
    urls: [
        "turn:167.71.39.251",
    ]
}];

connection.onstream = function(event) {
    var existing = document.getElementById(event.streamid);
    if(existing && existing.parentNode) {
        existing.parentNode.removeChild(existing);
    }

    event.mediaElement.removeAttribute('src');
    event.mediaElement.removeAttribute('srcObject');
    event.mediaElement.muted = true;
    event.mediaElement.volume = 0;
    if(event.type === 'local') {
        var video = document.getElementById('localVideo');
    } else {
        var video = document.getElementById('remoteVideo');
    //    startTime=Date();
    //    console.log('Start Time');
    //    console.log(startTime);
    }
    try {
        video.setAttributeNode(document.createAttribute('autoplay'));
        video.setAttributeNode(document.createAttribute('playsinline'));
    } catch (e) {
        video.setAttribute('autoplay', true);
        video.setAttribute('playsinline', true);
    }

    if(event.type === 'local') {
        video.volume = 0;
        try {
            video.setAttributeNode(document.createAttribute('muted'));
        } catch (e) {
            video.setAttribute('muted', true);
        }
    }

    video.srcObject = event.stream;

    $('#pleaseWait').hide();
    $('.div-video-buttons').show();
    $('#div-call-button').show();



    // to keep room-id in cache
    localStorage.setItem(connection.socketMessageEvent, connection.sessionid);

    // chkRecordConference.parentNode.style.display = 'none';

    // if(chkRecordConference.checked === true) {
    //     btnStopRecording.style.display = 'inline-block';
    //     recordingStatus.style.display = 'inline-block';

    //     var recorder = connection.recorder;
    //     if(!recorder) {
    //         recorder = RecordRTC([event.stream], {
    //             type: 'video'
    //         });
    //         recorder.startRecording();
    //         connection.recorder = recorder;
    //     } else {
    //         recorder.getInternalRecorder().addStreams([event.stream]);
    //     }

    //     if(!connection.recorder.streams) {
    //         connection.recorder.streams = [];
    //     }

    //     connection.recorder.streams.push(event.stream);
    //     recordingStatus.innerHTML = 'Recording ' + connection.recorder.streams.length + ' streams';
    // }

    if(event.type === 'local') {
        connection.socket.on('disconnect', function() {
            if(!connection.getAllParticipants().length) {
                location.reload();
            }
        });
    }
};



connection.onstreamended = function(event) {
    var mediaElement = document.getElementById(event.streamid);
    if (mediaElement) {
        mediaElement.parentNode.removeChild(mediaElement);
    }
    endTime=new Date();
    console.log('End Time');
    console.log(endTime);
};

connection.onMediaError = function(e) {
    if (e.message === 'Concurrent mic process limit.') {
        if (DetectRTC.audioInputDevices.length <= 1) {
            alert('Please select external microphone. Check github issue number 483.');
            return;
        }

        var secondaryMic = DetectRTC.audioInputDevices[1].deviceId;
        connection.mediaConstraints.audio = {
            deviceId: secondaryMic
        };

        connection.join(connection.sessionid);
    }
};

// ..................................
// ALL below scripts are redundant!!!
// ..................................

function disableInputButtons(enable) {
    document.getElementById('room-id').onkeyup();

    document.getElementById('open-or-join-room').disabled = !enable;
    document.getElementById('open-room').disabled = !enable;
    document.getElementById('join-room').disabled = !enable;
    document.getElementById('room-id').disabled = !enable;
}

// ......................................................
// ......................Handling Room-ID................
// ......................................................



(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

var roomid = '';
if (localStorage.getItem(connection.socketMessageEvent)) {
    roomid = localStorage.getItem(connection.socketMessageEvent);
} else {
    roomid = connection.token();
}

var txtRoomId = document.getElementById('room-id');
txtRoomId.value = roomid;
txtRoomId.onkeyup = txtRoomId.oninput = txtRoomId.onpaste = function() {
    localStorage.setItem(connection.socketMessageEvent, document.getElementById('room-id').value);
};

var hashString = location.hash.replace('#', '');
if (hashString.length && hashString.indexOf('comment-') == 0) {
    hashString = '';
}

var roomid = params.roomid;
if (!roomid && hashString.length) {
    roomid = hashString;
}

if (roomid && roomid.length) {
    document.getElementById('room-id').value = roomid;
    localStorage.setItem(connection.socketMessageEvent, roomid);

    // auto-join-room
    (function reCheckRoomPresence() {
        connection.checkPresence(roomid, function(isRoomExist) {
            if (isRoomExist) {
                connection.join(roomid);
                return;
            }

            setTimeout(reCheckRoomPresence, 5000);
        });
    })();

    disableInputButtons();
}

// detect 2G
if(navigator.connection &&
    navigator.connection.type === 'cellular' &&
    navigator.connection.downlinkMax <= 0.115) {
    alert('2G is not supported. Please use a better internet service.');
}
function  start() {
    // var room=document.getElementById('connection-id').value;
    // connection.openOrJoin(room);
}

document.getElementById('text-message').onkeyup = function(e) {
    if (e.keyCode != 13) return;

    // removing trailing/leading whitespace
    this.value = this.value.replace(/^\s+|\s+$/g, '');
    if (!this.value.length) return;

    connection.send(this.value);
    appendDIV(this.value);
    this.value = '';
};


var myfile;
var fileCheck=false;
function readURL(input) {

    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            // connection.send(input.files[0]);

        myfile=input.files[0];
        console.log(myfile);
        if (hasExtension(myfile.name,['.jpg', '.gif', '.png','.jpeg'])){
            $('#attachmentPreview').append('<img id="imageToSend" src="'+e.target.result+'" style="width: 75px;max-height: 100px;display: block;border-radius: 10px">')
            $('#attachmentPreview').show(350);
            $('#icon-close').css({position: 'fixed', 'margin-left':'50px'});
            $('#attachmentPreview').css('display', 'inline-block');


        }else {
            $('#attachmentPreview').append('<label style="font-weight: 200; margin: 5px; font-size: 1em">'+myfile.name+'</label>');
            $('#attachmentPreview').css({backgroundColor:'rgb(57, 59, 61)','color':'white'});
            $('#attachmentPreview').show(350);
        }
        }
        reader.readAsDataURL(input.files[0]);
    fileCheck=true;
    }
}

var mymessageCheck=false;
var localVideo = document.getElementById('#localVideo');

$('#sendMessage').on('click',function (e) {
    var message=document.getElementById('text-message').value;
    if (fileCheck==true){
        connection.send(myfile);
    } else {
        connection.send(message);
        appendDIV(message)
    }
    fileCheck=false;
    mymessageCheck=true;
    document.getElementById('text-message').value='';
    closeAttachment();
});

function closeAttachment() {
    $('#attachmentPreview').hide(350);
    $('#attachmentPreview').children("label").remove();
    $('#imageToSend').remove();
    $('#attachmentPreview').css({backgroundColor:'transparent'});
    $('#icon-close').css({position: 'inherit', 'margin-left':'0px'});
    $('#attach').val('');
}

$("#attach").change(function() {
    readURL(this);
});

connection.filesContainer = document.getElementById('div-messenger');


var count = 1;


connection.onmessage = appendDIV;

var progressHelper = {};
var outputPanel = document.getElementById('div-messenger');

var fileHelper = {
    onBegin: function (file) {
        var div = document.createElement('div');
        div.title = file.name;
        div.innerHTML = '<label>0%</label> <progress></progress>';
        outputPanel.insertBefore(div, outputPanel.firstChild);
        progressHelper[file.uuid] = {
            div: div,
            progress: div.querySelector('progress'),
            label: div.querySelector('label')
        };
        progressHelper[file.uuid].progress.max = file.maxChunks;
    },
    onEnd: function (file) {
        progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '"<' + file.name + '</a>';
    },
    onProgress: function (chunk) {
        var helper = progressHelper[chunk.uuid];
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    }
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}


function appendDIV(event) {
    console.log(event);
console.log(event.data);
console.log(event);
 if (event.data) {
     $('<div/>', {class: 'other-message', id: 'my-message-' + count})
         .append($('<b>' + 'moi' + '</b>'))
         .append(event.data || event)
         .append($('<div />', {class: 'attachment-container', id: 'container-' + count}))
         .append('<span class="time" id="my-datetime">' + ((("0" + new Date().getHours()).slice(-2)) + ":" + (("0" + new Date().getMinutes()).slice(-2))) + '</span>')
         .appendTo("#div-messenger").css('float','left');;
 } else {
     $('<div/>', {class: 'my-message', id: 'my-message-' + count})
         .append($('<b>' + 'moi' + '</b>'))
         .append(event.data || event)
         .append($('<div />', {class: 'attachment-container', id: 'container-' + count}))
         .append('<span class="time" id="my-datetime">' + ((("0" + new Date().getHours()).slice(-2)) + ":" + (("0" + new Date().getMinutes()).slice(-2))) + '</span>')
         .appendTo("#div-messenger").css('float','right');
 }
    $('#my-message-' + count).hide();
    $('#my-message-' + count).fadeIn(650);
    count++;

    setTimeout(() => {
        $('#div-messenger').animate({scrollTop: $('#div-messenger').get(0).scrollHeight}, 400);
    }, 100);


}
connection.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};
//Progress Bar Code Goes Here
connection.onFileStart = function (file) {
    $("#label-attach").prop('disabled', true);
    $("#attach").prop('disabled', true);
    //progress Bar code here
    var div = document.createElement('div');
    div.title = file.name;
    div.innerHTML = '<label class="progress-label">0%</label> <progress></progress>';
    document.body.appendChild(div);

    $('<div />', { class:'progress-bar'})
        .append($('<label class="progress-label">' + 'transfer de fichier en cours'+ '</label>'))
        .append(div)
        .appendTo("#div-messenger");
    progressHelper[file.uuid] = { div: div, progress: div.querySelector('progress'), label: div.querySelector('label') };
    progressHelper[file.uuid].progress.max = file.maxChunks;
};
connection.onFileEnd = function (file) {
    var message='';
    if (hasExtension(file.name,['.jpg', '.gif', '.png','.jpeg'])) {
        message = '<a style="font-size: 1em;color:white;" href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name +'<img src="'+file.url+'" style="width: 75px;max-height: 100px;display: block; margin: 5px; float: right; border-radius: 10px">'+ '</a>';

    } else {
        message = '<a style="font-size: 1em;color:white;" href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';

    }
    var classMe='';
    if (mymessageCheck){
        classMe='my-message';
        mymessageCheck=false;
    } else {
        classMe='other-message'
    }

    $('<div />', { class:classMe , id:'my-message-' + count})
        .append($('<b>' + 'moi'+ '</b>'))
        .append( message || event)
        // .append($('<div />', { class:'attachment-container', id:'container-' + count }))
        .append('<span class="time" id="my-datetime">' +  ( (("0"+new Date().getHours()).slice(-2)) +":"+ (("0"+new Date().getMinutes()).slice(-2))) + '</span>')
        .appendTo("#div-messenger");
    $('#my-message-' + count).hide();
    $('#my-message-' + count).fadeIn(650);

    setTimeout(() => {
        $('#div-messenger').animate({scrollTop: $('#div-messenger').get(0).scrollHeight}, 400);
    }, 100);

    $('.progress-bar').hide(300);
    $('#label-attach').prop('disabled', false);
    $('#attach').prop('disabled', false);
}

function hasExtension(fileName, exts) {

    return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
}

var currentUserName = document.getElementById('userid');
currentUserName.onkeyup = currentUserName.onpaste = currentUserName.oninput = function() {
    localStorage.setItem(this.id, this.value);
};
currentUserName.value = localStorage.getItem(currentUserName.id) || connection.token();
// document.getElementById('setup-my-username').onclick = function() {
//     this.disabled = true;
//     connection.open(currentUserName.value, function(isRoomOpened, roomid, error) {
//         if(error) {
//             alert(error);
//         }
//         joinCalleeUsingHisUsername.disabled = false;
//     });
// };

function openConnection() {
    connection.open(currentUserName.value, function(isRoomOpened, roomid, error) {
        if(error) {
            alert(error);
        }
        joinCalleeUsingHisUsername.disabled = false;
    });
}

var calleeUserName=document.getElementById('otheruserid');
var joinCalleeUsingHisUsername = document.getElementById('join-callee-using-his-username');
// joinCalleeUsingHisUsername.onclick = function() {
//     this.disabled = true;
//     connection.checkPresence(calleeUserName.value, function(isOnline, username) {
//         if(!isOnline) {
//             joinCalleeUsingHisUsername.disabled = false;
//             alert(username + ' is not online.');
//             return;
//         }
//         connection.join(username, function(isRoomJoined, roomid, error) {
//             if(error) {
//                 alert(error);
//             }
//         });
//     });
//     setTimeout(function() {
//         joinCalleeUsingHisUsername.disabled = false;
//     }, 1000);}

function call() {
    this.disabled = true;
    connection.checkPresence(calleeUserName.value, function(isOnline, username) {
        if(!isOnline) {
            joinCalleeUsingHisUsername.disabled = false;
            // alert(username + ' is not online.');
                call();
            return;
        }
        connection.join(username, function(isRoomJoined, roomid, error) {
            if(error) {
                alert(error);
            }
        });
    });
    setTimeout(function() {
        joinCalleeUsingHisUsername.disabled = false;
    }, 1000);}




var audioMuteCheck=false;
function muteAudio(){
    console.log(connection.streamEvents);
    if (!audioMuteCheck) {
        connection.attachStreams[0].mute({
            audio: true,
            type: 'local'
        });
        audioMuteCheck=true;
    }else {
        connection.attachStreams[0].unmute({
            audio: true,
            type: 'local'
        });
        audioMuteCheck=false;
    }
}

var videoMuteCheck=false;
function muteVideo(){
    console.log(connection.streamEvents);
    if (!videoMuteCheck) {
        connection.attachStreams[0].mute({
            video: true,
            type: 'local'
        });
        videoMuteCheck=true;
    }else {
        connection.attachStreams[0].unmute({
            video: true,
            type: 'local'
        });
        videoMuteCheck=false;
    }
}



// var videoDevices = document.getElementById('video-devices');
// connection.DetectRTC.load(function() {
//     connection.DetectRTC.MediaDevices.forEach(function(device) {
//         if(document.getElementById(device.id)) {
//             return;
//         }


//         if(device.kind.indexOf('video') !== -1) {
//             var option = document.createElement('option');
//             option.id = device.id;
//             option.innerHTML = device.label || device.id;
//             option.value = device.id;
//             videoDevices.appendChild(option);

//             if(connection.mediaConstraints.video.optional.length && connection.mediaConstraints.video.optional[0].sourceId === device.id) {
//                 option.selected = true;
//             }
//         }
//     });
// });
// videoDevices.onchange=function(e){
//     var videoSourceId = videoDevices.value;
//     if(connection.mediaConstraints.video.optional.length && connection.attachStreams.length) {
//         if(connection.mediaConstraints.video.optional[0].sourceId === videoSourceId) {
//             alert('Selected video device is already selected.');
//             return;
//         }
//     }

//     connection.attachStreams.forEach(function(stream) {
//         stream.getVideoTracks().forEach(function(track) {
//             stream.removeTrack(track);

//             if(track.stop) {
//                 track.stop();
//             }
//         });
//     });

//     connection.mediaConstraints.video.optional = [{
//         sourceId: videoSourceId
//     }];

//     connection.captureUserMedia();
// };

