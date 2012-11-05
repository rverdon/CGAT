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
