/* Config */
easyrtc.setSocketUrl('http://loyolalawtech.org:8080');
var ref = new Firebase('https://dazzling-torch-5906.firebaseio.com'),

/* System */
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
};

/* RTC */
var connect = function (){

    var userId = ref.getAuth();
    easyrtc.setUsername(userId.password.email);
    easyrtc.setRoomApiField("receptionista",  "favorite_alien", "Mr Spock");
    easyrtc.setRoomOccupantListener(function(roomName, list, selfInfo){
        console.log(roomName);
        for( var i in list ){
            console.log("easyrtcid=" + i + " belongs to user " + list[i].username);
        } 
    });
    easyrtc.easyApp("easyrtc.receptionistaj", "self", ["caller"], loginSuccess, loginFailure);

},

loginSuccess = function () {
    toastr.success('Success! Video connection made.');

},

loginFailure = function () {
    toastr.error('Sorry! Couldn\'t log in to video server.');
},

updateStatus = function() {



};
//startVideo = function (role) {
//    if (role === 'target'){ //the machine on the desk
//        var uniqId = (0|Math.random()*9e6).toString(36);
//        var userId = ref.getAuth();
//        var dateStamp = new Date().toString();
//        //add unique room id to firebase
//        ref.child('receptionista/sessions').push({
//            sessId : uniqId,
//            startedOn : dateStamp,
//            startedBy : userId.password.email,
//            sessStatus : 'active'
//        }, function (error){
//            if (error){
//                console.log('error logging'); 
//            } else {
//                console.log('successfully logged session');
//            }
//        });
//
//    } else {
//        //we are loggin in to watch the desk
//        ref.child('receptionista//sessions').on('value', function(snap){
//            snap.val();
//        });
//    }
//    easyrtc.initMediaSource(function(){
//        var selfVideo = document.getElementById('self');
//        easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
//        easyrtc.connect(uniqId, 
//            function (easyrtcid){
//                console.log('success: ' + easyrtcid); 
//            },
//            function(errorCode,msg){
//                console.log('fail: ' + msg);
//            });
//        }
//    );
//},
//
//stopVideo = function () {
//    easyrtc.clearMediaStream( document.getElementById('self'));
//    easyrtc.setVideoObjectSrc(document.getElementById('self'),'');
//    easyrtc.closeLocalMediaStream();
//
//}

/* Paths */

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
    connect();
});

Path.map('#/main/target').to(function() {
    var context = {name:'Jady', org_name:'LoyolaLawClinic' };
    $('.content').html(Handlebars.templates.target(context));
    connect();
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

/* Listeners */

$('.content').on('submit', '#login', function(e) {
    e. preventDefault();
    loginUser($('#inputEmail3').val(), $('#inputPassword3').val());
});

$('.content').on('click', '.video-start', function(e) {
    console.log('clicked start video');
    makeCall();
});
$('.content').on('click', '.video-stop', function(e) {
    console.log('clicked stop video');
    stopVideo();
});
