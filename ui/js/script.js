"use strict";

// Get the reverse complement of a sequence
// Will return undefined if the sequence is not valid (not upcase ATCG).
function reverseComplement(sequence) {
   var rc = [];

   for (var i = sequence.length - 1; i >= 0; i--) {
      switch(sequence[i]) {
         case 'A':
            rc.push('T');
            break;
         case 'T':
            rc.push('A');
            break;
         case 'C':
            rc.push('G');
            break;
         case 'G':
            rc.push('C');
            break;
         default:
            return undefined;
      }
   }

   return rc.join('');
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
function setSubtitle(subtitle) {
   document.getElementById('top-subtitle-text').innerHTML = subtitle;
}

// Note that this accepts SECONDS, but JS defaults to miliseconds.
function formatEpochDate(epochTime) {
   var date = new Date(epochTime * 1000);

   return (date.getMonth() + 1) + "/" +
          date.getDate() + "/" +
          date.getFullYear() + " -- " +
          date.getHours() + ":" +
          date.getMinutes();
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
   enableModal('<div class="' + modalPrefix + '-loading-image">' +
                  '<img src="images/paring-animation.gif" alt="Loading" />' +
                  '<p>Loading...</p>' +
                  '</div>',
               modalPrefix + '-loading');
}

function enableErrorModal(errorString, modalPrefix) {
   enableModal('<div class="error-modal-content"><h1>Error</h1><p>' + errorString + '</p></div>',
               modalPrefix + '-modal-error');
   console.log(errorString);
}
