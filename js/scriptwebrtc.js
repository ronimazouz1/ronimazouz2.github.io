var connection = new RTCMultiConnection();

// by default, socket.io server is assumed to be deployed on your own URL
connection.socketURL = '/';
connection.enableFileSharing = true; // by default, it is "false".


// comment-out below line if you do not have your own socket.io server
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

connection.socketMessageEvent = 'Video-Plus-Text-Chat';

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

connection.videosContainer = document.getElementById('videos-container');
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
    }else {
        var video = document.getElementById('remoteVideo');
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

    // var width = parseInt(connection.videosContainer.clientWidth / 3) - 20;
    // var mediaElement = getHTMLMediaElement(video, {
    //     title: event.userid,
    //     buttons: ['full-screen'],
    //     width: width,
    //     showOnMouseEnter: false
    // });

    // connection.videosContainer.appendChild(mediaElement);

    // setTimeout(function() {
    //     mediaElement.media.play();
    // }, 5000);

    // mediaElement.id = event.streamid;

    // to keep room-id in cache
    localStorage.setItem(connection.socketMessageEvent, connection.sessionid);

    chkRecordConference.parentNode.style.display = 'none';

    if(chkRecordConference.checked === true) {
        btnStopRecording.style.display = 'inline-block';
        recordingStatus.style.display = 'inline-block';

        var recorder = connection.recorder;
        if(!recorder) {
            recorder = RecordRTC([event.stream], {
                type: 'video'
            });
            recorder.startRecording();
            connection.recorder = recorder;
        }
        else {
            recorder.getInternalRecorder().addStreams([event.stream]);
        }

        if(!connection.recorder.streams) {
            connection.recorder.streams = [];
        }

        connection.recorder.streams.push(event.stream);
        recordingStatus.innerHTML = 'Recording ' + connection.recorder.streams.length + ' streams';
    }

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

function showRoomURL(roomid) {
    var roomHashURL = '#' + roomid;
    var roomQueryStringURL = '?roomid=' + roomid;

    var html = '<h2>Unique URL for your room:</h2><br>';

    html += 'Hash URL: <a href="' + roomHashURL + '" target="_blank">' + roomHashURL + '</a>';
    html += '<br>';
    html += 'QueryString URL: <a href="' + roomQueryStringURL + '" target="_blank">' + roomQueryStringURL + '</a>';

    var roomURLsDiv = document.getElementById('room-urls');
    roomURLsDiv.innerHTML = html;

    roomURLsDiv.style.display = 'block';
}

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
    var room=document.getElementById('connection-id').value;
    connection.openOrJoin(room);
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


document.getElementById('label-attach').onclick = function() {
    var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        connection.send(file);
    });
};

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
     $('<div/>', {class: 'my-message', id: 'my-message-' + count})
         .append($('<b>' + 'moi' + '</b>'))
         .append(event.data || event)
         .append($('<div />', {class: 'attachment-container', id: 'container-' + count}))
         .append('<span class="time" id="my-datetime">' + ((("0" + new Date().getHours()).slice(-2)) + ":" + (("0" + new Date().getMinutes()).slice(-2))) + '</span>')
         .appendTo("#div-messenger");
 }else {
     $('<div/>', {class: 'my-message', id: 'my-message-' + count})
         .append($('<b>' + 'moi' + '</b>'))
         .append(event.data || event)
         .append($('<div />', {class: 'attachment-container', id: 'container-' + count}))
         .append('<span class="time" id="my-datetime">' + ((("0" + new Date().getHours()).slice(-2)) + ":" + (("0" + new Date().getMinutes()).slice(-2))) + '</span>')
         .appendTo("#div-messenger").css('float','left');
 }
    $('#my-message-' + count).hide();
    $('#my-message-' + count).fadeIn(650);
    count++;

    setTimeout(() => {
        $('#div-messenger').animate({scrollTop: $('#div-messenger').get(0).scrollHeight}, 400);
    }, 100);

    // setTimeout(function() {
    //     textarea.style.cssText = 'height:auto';
    //     textarea.style.cssText = 'height:' + this.scrollHeight + 'px';
    //     document.getElementById("text-message").value = "";
    // }, 0);

}
connection.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};
connection.onFileStart = function (file) {
    var div = document.createElement('div');
    div.title = file.name;
    div.innerHTML = '<label>0%</label> <progress></progress>';
    document.body.appendChild(div);
    progressHelper[file.uuid] = { div: div, progress: div.querySelector('progress'), label: div.querySelector('label') };
    progressHelper[file.uuid].progress.max = file.maxChunks;
};
connection.onFileEnd = function (file) {
    // progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>'; }; function updateLabel(progress, label) { if (progress.position == -1) return; var position = +progress.position.toFixed(2).split('.')[1] || 100;
    // label.innerHTML = position + '%';
    var message='';
    if (isFileImage(file)) {
        message = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name +'<img src="'+file.url+'" style="width: 150px;">'+ '</a>';

    }else {
        message = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';

    }

    $('<div />', { class:'my-message' , id:'my-message-' + count})
        .append($('<b>' + 'moi'+ '</b>'))
        .append( message || event)
        .append($('<div />', { class:'attachment-container', id:'container-' + count }))
        .append('<span class="time" id="my-datetime">' +  ( (("0"+new Date().getHours()).slice(-2)) +":"+ (("0"+new Date().getMinutes()).slice(-2))) + '</span>')
        .appendTo("#div-messenger");
    $('#my-message-' + count).hide();
    $('#my-message-' + count).fadeIn(650);

    setTimeout(() => {
        $('#div-messenger').animate({scrollTop: $('#div-messenger').get(0).scrollHeight}, 400);
    }, 100);

    // setTimeout(function() {
    //     textarea.style.cssText = 'height:auto';
    //     textarea.style.cssText = 'height:' + this.scrollHeight + 'px';
    //     document.getElementById("text-message").value = "";
    // }, 0);
}

function isFileImage(file) {
    const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
    return file && $.inArray(file['type'], acceptedImageTypes)
}