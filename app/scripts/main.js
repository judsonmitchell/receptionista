//Login User
easyrtc.setSocketUrl('http://loyolalawtech.org:8080');
var ref = new Firebase('https://dazzling-torch-5906.firebaseio.com'),
stream,

checkAuth = function () {
    var authData = ref.getAuth();
    if (authData){
        console.log('logged in user');
        return true;
    } else {
        return false;
    }
},

loginUser = function (user,pwd) {
    ref.authWithPassword({
        email    : user,
        password : pwd
    }, function(error, authData) {
        if (error) {
            console.log('Login Failed!', error);
            toastr.error('Sorry! Bad email or password.');
        } else {
            console.log('Authenticated successfully with payload:', authData);
            if (!$('#remember').prop('checked')){
                remember: 'sessionOnly'
            }
            //$('.content').html(Handlebars.templates.index);
            location.href = '#/main/index';
        }
    });

},

logoutUser = function () {
    ref.unauth();
    //$('.content').html(Handlebars.templates.login);
    location.href = '#/login';
},

setNav = function (index) {
    $('ul.nav li').removeClass('active');
    $('ul.nav li').eq(index).addClass('active');
},

startVideo = function () {
    //navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
    //navigator.getUserMedia({video:true,audio:true},
    //    function(localMediaStream){
    //            stream = localMediaStream;
    //            var video = document.querySelector('video');
    //            video.src = window.URL.createObjectURL(localMediaStream);
    //            video.onloadedmetadata = function(e) {
    //                video.play();
    //            };
    //        },
    //    function (e){
    //        console.log('error');
    //    });
    //easyrtc.setRoomOccupantListener( convertListToButtons);
    easyrtc.initMediaSource(function(){
        var selfVideo = document.getElementById('self');
        easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
        easyrtc.connect('receptionista', 
            function (easyrtcid){
                console.log('success: ' + easyrtcid); 
            },
            function(errorCode,msg){
                console.log('fail: ' + msg);
            });
        }
    );
},

stopVideo = function () {
    //stream.stop();
    easyrtc.clearMediaStream( document.getElementById('self'));
    easyrtc.setVideoObjectSrc(document.getElementById('self'),'');
    easyrtc.closeLocalMediaStream();

}

Path.before('#/main/', function () {
    var authData = ref.getAuth();
    if (authData){
        console.log('logged in user');
        return true;
    } else {
        return false;
    }
});

Path.map('#/main/index').to(function() {
    $('.content').html(Handlebars.templates.index);
})
.enter(function() {
    $('#logout').show();
    setNav(0)
});

Path.map('#/main/desk').to(function() {
    $('.content').html(Handlebars.templates.desk);
    startVideo();
});

Path.map('#/main/target').to(function() {
    var context = {name:'Jady', org_name:'LoyolaLawClinic' };
    $('.content').html(Handlebars.templates.target(context));
    startVideo();
});

Path.map('#/login').to(function() {
    $('.content').html(Handlebars.templates.login);
})
.enter(function () {
    $('#logout').hide();
    setNav(0);
});

Path.map('#/logout').to(function() {
    logoutUser();
});

Path.map('#/about').to(function() {
    $('.content').html(Handlebars.templates.about);
})
.enter(function(){
    setNav(1);
});

Path.map('#/contact').to(function() {
    $('.content').html(Handlebars.templates.contact);
})
.enter(function(){
    setNav(2);
});
Path.root('#/login');

Path.rescue(function () {
    //$('.content').html(Handlebars.templates.login);
    location.href = '#/login';
});

Path.listen();

$('.content').on('submit', '#login', function(e) {
    e. preventDefault();
    loginUser($('#inputEmail3').val(), $('#inputPassword3').val());
});

$('.content').on('click', '.video-stop', function(e) {
    console.log('clicked stop video');
    stopVideo();
});
