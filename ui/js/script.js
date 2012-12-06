"use strict";

// This will round an int using its largest order.
// Ex: 10023 => 10000, 1500 => 2000
function highestOrderIntRound(num) {
   var stringNum = '' + parseInt(num);
   var finalNum = '';

   if (stringNum.length < 2) {
      return parseInt(stringNum);
   }

   if (parseInt(stringNum[1]) >= 5) {
      finalNum += (parseInt(stringNum[0]) + 1);
   } else {
      finalNum += parseInt(stringNum[0]);
   }

   for (var i = 1; i < stringNum.length; i++) {
      finalNum += '0';
   }

   return parseInt(finalNum);
}

function collapse(buttonId, collapseAreaId) {
   $('#' + buttonId).addClass('collapse-on');
   $('#' + collapseAreaId).addClass('collapse');
}

function uncollapse(buttonId, collapseAreaId) {
   $('#' + buttonId).removeClass('collapse-on');
   $('#' + collapseAreaId).removeClass('collapse');
}

function toggleCollapse(buttonId, collapseAreaId) {
   var collapseButton = document.getElementById(buttonId);
   var collapseArea = document.getElementById(collapseAreaId);

   if (collapseButton.className.match(/collapse-on/)) {
      // Turn collapse off
      collapseButton.className = collapseButton.className.replace(/collapse-on/, '');
      collapseArea.className = collapseArea.className.replace(/collapse/, '');
   } else {
      // Turn collapse on
      collapseButton.classList.add('collapse-on');
      collapseArea.classList.add('collapse');
   }
}

// This assumes that the page is under the normal framework and uses header.php.
function setTitle(title) {
   window.cgatTitle.title = title;
   document.title = window.cgatTitle.title + " | " +
                    window.cgatTitle.subtitle;
}
function setSubtitle(subtitle) {
   window.cgatTitle.subtitle = subtitle;
   document.getElementById('top-subtitle-text').innerHTML = subtitle;
   document.title = window.cgatTitle.title + " | " +
                    window.cgatTitle.subtitle;
}


// This accpets time string from an input[type=date] field ('yyyy-mm-dd').
// Will return epoch time in seconds.
function fromInputDateToEpoch(dateStr) {
   var splitDate = dateStr.split('-');
   return Math.floor((new Date(splitDate[0], parseInt(splitDate[1]) - 1, splitDate[2])).getTime() / 1000);
}

// Note that this accepts SECONDS, but JS defaults to miliseconds.
function formatEpochDate(epochTime) {
   var date = new Date(epochTime * 1000);

   return (date.getMonth() + 1) + "/" +
          date.getDate() + "/" +
          date.getFullYear() + " -- " +
          date.getHours() + ":" +
          (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
}

// |invalidElement| is the element that the validation error will be attached to.
function validationError(error, errorDump) {
   console.log('Validation Error: ' + error);
   $('#' + errorDump).attr('data-validation-error', error);
   $('#' + errorDump).addClass('validation-error');
}

// This will empty out the entire error dump.
// If you want to remove a specific error, that functionality will have to be added.
function clearValidationError(errorDump) {
   $('#' + errorDump).removeClass('validation-error');
   $('#' + errorDump).removeAttr('data-validation-error');
}

function enableModal(modalInnerHTML, modalClass) {
   $('#overlay').remove();
   $('body').append('<div id="overlay"><div id="modal" class="' + modalClass + '">' +
                    modalInnerHTML + '</div></div>');
}

function disableModal() {
   $('#overlay').remove();
}

function enableLoadingModal(modalPrefix) {
   enableModal('<div class="loading-modal-image ' + modalPrefix + '-loading-image">' +
                  '<img src="images/paring-animation.gif" alt="Loading" />' +
                  '<p>Loading...</p>' +
                  '</div>',
               'loading-modal ' + modalPrefix + '-loading');
}

function enableErrorModal(errorString, modalPrefix) {
   var loginButton = window.cgatSession ? '' : '<button onclick="goToLogin();">Login</button>';
   enableModal('<div class="modal-content error-modal-content"><h1>Error</h1><p>' + errorString + '</p>' +
                     '<button onclick="goToRoot();">Home</button>' +
                     loginButton +
                     '</div>',
               modalPrefix + '-modal-error');
   console.log('Error: ' + errorString);
}

// Enable an error modal that has a confirmation button that will remove it.
// The callback will be called before the modal is cleared.
//  The callback must not be an anonymous function, it must be referenced by name.
function enableErrorConfirmModal(errorString, modalPrefix, callbackName) {
   var functionInvoke = callbackName ? callbackName + '()' : '';
   enableModal('<div class="modal-content error-modal-content"><h1>Error</h1><p>' + errorString + '</p>' +
                     '<button class="error-modal-confirm" onclick="' + functionInvoke + '; disableModal();">OK</button></div>',
               modalPrefix + '-modal-error');
   console.log('Error: ' + errorString);
   $('.error-modal-confirm').focus();
}

// Enable a modal that has a confirmation button that will remove it.
// The callback will be called before the modal is cleared.
//  The callback must not be an anonymous function, it must be referenced by name.
function enableConfirmModal(message, modalPrefix, callbackName) {
   var functionInvoke = callbackName ? callbackName + '()' : '';
   enableModal('<div class="modal-content"><p>' + message + '</p>' +
                     '<button class="modal-confirm" onclick="' + functionInvoke + '; disableModal();">OK</button></div>',
               modalPrefix + '-modal');
   $('.modal-confirm').focus();
}

function goToLogin() {
   window.location.href = '/login';
}

function goToRoot() {
   window.location.href = '/';
}

function logout() {
   enableLoadingModal('logout');
   $.ajax({
      url: 'api/logout',
      type: 'POST',
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Logging Out', 'profile');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Logged Out', 'logout', 'goToRoot');
      }
   });
}

// Generate some html to represent a contig (given the standard information from the api).
function makeContig(contig) {
   var contigInfo = '';
   contigInfo += "<label>Contig Name: </label><span>" + contig.meta.name + "</span><br />";
   contigInfo += "<label>Difficulty: </label><span>" + contig.meta.difficulty + "</span><br />";
   contigInfo += "<label>Species: </label><span>" + contig.meta.species + "</span><br />";
   contigInfo += "<label>Source: </label><span>" + contig.meta.source + "</span><br />";
   contigInfo += "<label>Upload Date: </label><span>" + contig.meta.upload_date.sec + "</span><br />";
   contigInfo += "<label>Uploader: </label><span>" + contig.meta.uploader_name + "</span>";
   return contigInfo;
}

// Generate some html to represent the help info (given the standard information from the api).
function makeHelp(help) {
   var helpInfo = '';
   helpInfo += String(help);
   return helpInfo;
}

// Generate some html meant to diplay an inline annotation given stantard api annotation info.
function makeInlineAnnotation(annotation) {
   var numExons = annotation.exons ? annotation.exons.length : 0;
   return "<a href='/view-annotation?id=" + annotation['_id']['$id'] + "'>" +
          "Gene Name: " + annotation.isoform_name +
          ", Number of Exons: " + numExons +
          ", Expert: " + annotation.expert +
          ", Reverse Complement: " + annotation.reverse_complement +
          "</a>";
}
