/* Config */
easyrtc.setSocketUrl('http://loyolalawtech.org:8080');
var ref = new Firebase('https://dazzling-torch-5906.firebaseio.com/receptionista'),

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
    easyrtc.setRoomApiField('receptionista',  'favorite_alien', 'Mr Spock');
    easyrtc.setRoomOccupantListener(function(roomName, list, selfInfo){
        console.log(roomName);
        for( var i in list ){
            console.log('easyrtcid=' + i + ' belongs to user ' + list[i].username);
            $('.video-start').attr('data-id', i).prop('disabled', false);
        }
    });
    easyrtc.setPeerListener(setMsgs);
    easyrtc.easyApp('easyrtc.receptionistaj', 'self', ['caller'], loginSuccess, loginFailure);

},

loginSuccess = function (easyrtcid) {
    this.thisUser = easyrtcid;
    toastr.success('Success! Video connection made.');
},

loginFailure = function () {
    toastr.error('Sorry! Couldn\'t log in to video server.');
},

updateStatus = function() {

},

makeCall = function(easyrtcid) {
    this.otherUser = easyrtcid;
    var currentUser = easyrtc.idToName(thisUser);
    easyrtc.call(easyrtcid, function success (){
        toastr.success(easyrtc.idToName(easyrtcid)  + ' is connected');
        easyrtc.sendPeerMessage(otherUser, 'set_recptionist', {name: currentUser},
         function () {
            console.log('message sent');
        },
         function () {
            console.log('message failed');
        });
    }, function fail (){
        toastr.error('Failed to connect to ' +  easyrtc.idToName(easyrtcid));
    });

},

stopVideo = function (){
    console.log(otherUser);
    easyrtc.clearMediaStream( document.getElementById('self'));
    easyrtc.sendPeerMessage(otherUser, 'offer_candy', {candy_name:'mars'},
            function(msgType, msgBody ) {
                console.log('message was sent');
            },
            function(errorCode, errorText) {
                console.log('error was ' + errorText);
            });
},

setMsgs = function (who, msgType, content) {
    if (msgType === 'set_recptionist'){
        $('#status').html(content.name + ' is on the desk');
    }
    console.log(who);
    console.log(msgType);
    console.log(content);
};

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
    setNav(0);
});

Path.map('#/main/reception').to(function() {
    $('.content').html(Handlebars.templates.recep);
    connect();
});

Path.map('#/main/desk').to(function() {
    var context = {name:'Jady', org_name:'LoyolaLawClinic' };
    $('.content').html(Handlebars.templates.desk(context));
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

Path.map('#/account').to(function() {
    $('.content').html(Handlebars.templates.account);
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
    makeCall($(this).data('id'));
});
$('.content').on('click', '.video-stop', function(e) {
    console.log('clicked stop video');
    stopVideo();
});
