"use strict";

document.addEventListener('DOMContentLoaded', function() {
   // Attach listeners to the radio buttons.
   $('input[name=method]:radio').change(updateSelectedMethod);
});

function updateSelectedMethod(eventObj) {
   $('input[name=method]:radio').each(function(radioElement) {
      console.log('#' + this.value + '-method-area');

      if (this.checked) {
         $('#' + this.value + '-method-area').addClass('selected-method');
      } else {
         $('#' + this.value + '-method-area').removeClass('selected-method');
      }
   });
}
