// $('document').ready(function(){

//     // enable material-style inputs in entire body
//     $('body').materializeInputs();
  
//   });


var isFullscreen = false;
function fullscreen(){
    var d = {};
    var speed = 300;
    if(!isFullscreen){ // MAXIMIZATION
        d.width = "100%";
        d.height = "100%";
        isFullscreen = true;
        $("#div-messenger").slideUp(speed)
        $(".messenger-bottom").slideUp(speed)

    }
    else{ // MINIMIZATION
        d.width = "100%";
        d.height = "49%";
        isFullscreen = false;
        $("#div-messenger").slideDown(speed+200)
        $(".messenger-bottom").slideDown(speed+200)

    }
    $("#div-video-big").animate(d,speed);
}


$("button").click(function() {
  $(this).toggleClass('click');
});

$("button").click(function() {
  $(this).toggleClass('rec');
});

$("button").click(function(){
 $(this).toggleClass('rotator');
})

var image =  document.getElementById("icon-record");
function changeimg() {
    if (image.getAttribute('src') == "img/record.png")
    {
        image.src = "img/camcorder-black.png";
    }
    else{
        image.src = "img/record.png";
    }
}

var image2 =  document.getElementById("expand");
function changeimg2() {
    if (image2.getAttribute('src') == "img/minimize-black.png")
    {
        image2.src = "img/maximize-black.png";
    }
    else
    {
        image2.src = "img/minimize-black.png";
    }
}

var image3 =  document.getElementById("cam-cut");
function changeimg3() {
    if (image3.getAttribute('src') == "img/cam-off-black.png")
    {
        image3.src = "img/cam-on-black.png";
    }
    else
    {
        image3.src = "img/cam-off-black.png";
    }
}

var image4 =  document.getElementById("mic-cut");
function changeimg4() {
    if (image4.getAttribute('src') == "img/mic-off-black.png")
    {
        image4.src = "img/mic-on-black.png";
    }
    else
    {
        image4.src = "img/mic-off-black.png";
    }
}


function showDiv(){
    document.getElementById('div-show-accueil').setAttribute('style', 'display:block');
}

$('#select-company').on('change', function () {
    if($(this).val() == "Je n'ai pas d'entreprise"){
        $("#show-company").hide();
    }
    else {
        $("#show-company").show();
    }
});




// disable select options based on previous select
$('#start_year').on('change', function() {
  var value = parseInt($(this).val(), 10);
    $('select option').prop('disabled', false);
    $('#last_year option').each(function() {
        if ($(this).val() < value) {
            $(this).prop('disabled', true);
         }
        if ($(this).val() <= value) {
            $(this).prop('selected', true);
        }
     }); 
});


// resize textarea messenger
const textarea = document.querySelector('textarea');
textarea.addEventListener('input', autosize);
function autosize() {
  const el = this;
  setTimeout(function() {
    el.style.cssText = 'height:auto;';
    el.style.cssText = 'height:' + el.scrollHeight + 'px';
  }, 0);
}


// add text to messenger
// var count = 1;
// $('.message-submit').click(function() {
//     $('<div />', { class:'my-message' , id:'my-message-' + count})
//        .append($('<b>' + 'moi'+ '</b>'))
//        .append(document.getElementsByClassName('message-input')[0].value)
//        .append($('<div />', { class:'attachment-container', id:'container-' + count }))
//        .append('<span class="time" id="my-datetime">' +  ( (("0"+new Date().getHours()).slice(-2)) +":"+ (("0"+new Date().getMinutes()).slice(-2))) + '</span>')
//        .appendTo("#div-messenger");
//        $('#my-message-' + count).hide();
//        $('#my-message-' + count).fadeIn(650);


//        const input = document.getElementById('attach');
//        if (input.files && input.files[0]) {
//            const reader = new FileReader();
//            reader.onload = function() {
//                var i = count -1;
//                var id = 'container-' + i;
//                $('#' + id).fadeIn(650);
//                $('#' + id).css('background-image', 'url(' + reader.result + ')');
//            };
//            reader.readAsDataURL(input.files[0]);
//          }


//     setTimeout(() => {
//         $('#div-messenger').animate({scrollTop: $('#div-messenger').get(0).scrollHeight}, 400);
//     }, 100);
    
//     setTimeout(function() {
//         textarea.style.cssText = 'height:auto';
//         textarea.style.cssText = 'height:' + this.scrollHeight + 'px';
//         document.getElementById("text-message").value = "";
//     }, 0);

//     $('#attachmentPreview').hide(350);
//     $('#attach').val('');
//     count++;
//   });

//unchecks payment forfaits when one is checked
    $('.cb').on('change', function() {
        $('.cb').not(this).prop('checked', false);
        $('#bouton-ajouter').show();
        $('.cb').filter(':checked')
          $('#bouton-ajouter').html('Ajouter le ' + $("label[for='" + this.id + "']").text());
          $('#plan-price').html($("label[for='" + this.id + "-2']").text())
         if($(this).is(':not(:checked)')) {
            $('#bouton-ajouter').hide();
            $('#plan-price').html('')
    }
    
  });


//shows attachment preview
// function readURL(input) {
//     if (input.files && input.files[0]) {
//       var reader = new FileReader();
//       reader.onload = function(e) {
//         $('#attachmentPreview').css({backgroundImage: "url('" + e.target.result + "')"});
//         $('#attachmentPreview').show(650);
//       }
//       reader.readAsDataURL(input.files[0]);
//     }
//   }
  
//   $("#attach").change(function() {
//     readURL(this);
//   });

//   function closeAttachment() {
//     $('#attachmentPreview').hide(350);
//     $('#attach').val('');
// }

// reveal password

$('#password').on('focus', function() {
    $('#showpass').show();
});

$('#confirm_password').on('focus', function() {
    $('#showpass2').show();
});


  function showPass() {
    var x = document.getElementById("password");
    var y = document.getElementById("confirm_password");
    var image =  document.getElementById("showpass");
    var image2 =  document.getElementById("showpass2");
    if (x.type === "password") {
      x.type = "text";
      y.type = "text";
      image.src = "img/show_pass.png";
      image2.src = "img/show_pass.png";
    } else {
      x.type = "password";
      y.type = "password";
      image.src = "img/hide_pass.png";
      image2.src = "img/hide_pass.png";
    }
  }

  function notify() {
    alert($('#student-firstname').val() + ' a bien été enrigistré(e)');
  }

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