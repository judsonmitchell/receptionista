/*
 *Handles new account creation
 */

var dataUrl;

function userInfo (credentials) {
    ref.authWithPassword(credentials, function (error, authData) {
        if (error){
            console.log(error);
            toastr.error('Sorry, there was an error creating your account');
        } else {
            ref.child("users").child(authData.uid).set({
                provider: authData.provider,
                username: authData.password.email.replace(/@.*/, ''),
                fname: $('#f_name').val(),
                lname: $('#l_name').val(),
                photo: dataUrl,
                approved: false,
                admin: false
            }, function (error){
                if (error){
                    toastr.error('Sorry, account creation failed!');
                } else {
                    $('.content').html(Handlebars.templates.account_confirm);
                }
            
            });
        }
    });
}


$('#photo').on('change', function (e){

    var fileInfo = $(this).prop('files')[0];
    if (fileInfo.size > 1024 * 1024 * 5){
        toastr.error('Sorry, that file is greater than 5MB');
        return;
    }

    if (fileInfo.type !== 'image/png' && fileInfo.type !== 'image/jpg' && fileInfo.type !== 'image/jpeg'){
        toastr.error('Sorry, file must be either jpg or png.');
        return;
    }

    var input = e.target;
    var reader = new FileReader();
    reader.onload = function (e) {
        dataUrl = reader.result;

    };
    reader.readAsDataURL(input.files[0]);

});

$('#new-account').on('submit', function (e) {
    e.preventDefault();
    var emailAddress = $('#email').val();
    var pword = $('#password').val();
    ref.createUser({
        email    : emailAddress ,
        password : pword,
    }, function(error, userData) {
        if (error) {
            toastr.error('Sorry, there was an error creating your account');
            console.log(error);
        } else {
            console.log('Successfully created user account with uid:', userData.uid);
            userInfo({email: emailAddress, password: pword});
        }
    });
});

