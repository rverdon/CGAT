"use strict";

// TODO(eriq): Check email
// TODO(eriq): Enforce valid password constraints

document.addEventListener('DOMContentLoaded', function () {
   //TODO(eriq): Add onchange validators for passwords and email.

   $('.login-field').keydown(function() {
      // On enter, try to login.
      if (event.keyCode == 13) {
         // Blur this after to diable hitting enter a lot.
         this.blur();
         login();
      }
   });

   $('.register-field').keydown(function() {
      // On enter, try to login.
      if (event.keyCode == 13) {
         // Blur this after to diable hitting enter a lot.
         this.blur();
         register();
      }
   });
});

// TODO(eriq): On error, clear password.
function login() {
   var error = false;

   // Validate
   $('.login-field').each(function() {
      error |= !generalValidate(true, this.id, this.parentElement.id);
   });

   if (!error) {
      // TODO(eriq): do it
      validatePassword('login');
   }

   if (error) {
      return;
   }

   enableLoadingModal('login');

   var hash = genHash($('#login-username').val(), $('#login-password').val());

   $.ajax({
      url: 'api/login',
      type: 'POST',
      dataType: 'json',
      data: {user: $('#login-username').val(), hash: hash},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Logging In', 'login');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            if (data.error === 'relog') {
               enableErrorConfirmModal('Already Logged In', 'login');
            } else if (data.error === 'nouser') {
               enableErrorConfirmModal('User Does Not Exist', 'login');
            } else if (data.error === 'badpass') {
               enableErrorConfirmModal('Bad Password', 'login');
            } else if (data.error === 'badcombo') {
               enableErrorConfirmModal('Bad User/Password Combination', 'login');
            } else {
               enableErrorConfirmModal('Logging In', 'login');
            }
            return;
         }

         enableConfirmModal('Successfully Logged in!', 'login', 'goToProfile');
      }
   });
}

function goToProfile() {
   window.location.href = 'profile';
}

function register() {
   var error = false;

   // Validate
   $('.register-field').each(function() {
      error |= !generalValidate(true, this.id, this.parentElement.id);
   });

   if (!error) {
      // TODO(eriq): do it
      validatePassword('register');
   }

   if (error) {
      return;
   }

   enableLoadingModal('login');

   var hash = genHash($('#register-username').val(), $('#register-password').val());

   $.ajax({
      url: 'api/register',
      type: 'POST',
      dataType: 'json',
      data: {user: $('#register-username').val(), hash: hash,
             firstName: $('#register-firstname').val(),
             lastName: $('#register-lastname').val(),
             email: $('#register-email').val()},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Registering', 'login');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            if (data.error === 'relog') {
               enableErrorConfirmModal('Already Logged In', 'login');
            } else if (data.error === 'namenotavailable') {
               enableErrorConfirmModal('Username Already Taken', 'login');
            } else if (data.error === 'emailnotavailable') {
               enableErrorConfirmModal('Email Already Taken', 'login');
            } else {
               enableErrorConfirmModal('Registering', 'login');
            }
            return;
         }

         enableConfirmModal('Successfully Registered!', 'login', 'goToProfile');
      }
   });
}

// Return false on error.
function validatePassword(prefix) {
   // TODO(eriq): validate length, content, and match with repeat
   return true;
}

// Returns false on error.
function generalValidate(presence, id, errorDump) {
   var error = false;
   var value = $.trim($('#' + id).val());

   if (presence) {
      if (value.length === 0) {
         error = true;
         validationError('Must Be Present', errorDump);
         return false;
      }
   }

   if (!error) {
      clearValidationError(errorDump);
      return true;
   }
}

function genHash(username, password) {
   return CryptoJS.SHA256(username + ':' + password).toString(CryptoJS.enc.Hex);
}
