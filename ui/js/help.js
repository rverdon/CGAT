"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('help');

   if (!window.params.page) {
      enableErrorModal("No help file specified.", 'help');
      return;
   }

   window.cgat = {};
   window.cgat.helpPage = '';

   $.ajax({
      url: '/api/help.php',
      dataType: 'json',
      data: {page: window.params.page},
      error: function(jqXHR, textStatus, errorThrown) {
         console.log(textStatus);
         console.log(errorThrown);

         enableErrorModal('Fetching help file', 'help');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid help file', 'help');
            return;
         }

         console.log(data);

         //setSubtitle(data.info.help.meta.name);

/*
         window.cgat.helpPage = data.info.help['_id']['$page'];

         // Place the help info.
         $('#help-info-area').html(makeHelp(data.info.help));
*/

         disableModal();
      }
   });
});

function setHelpPage() {
   enableLoadingModal('help');
   $.ajax({
      url: '/api/set_help',
      type: 'POST',
      dataType: 'json',
      data: {help: window.cgat.helpId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Setting help info', 'help');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorConfirmModal('Setting help info', 'help');
            return;
         }
      }
   });
}

