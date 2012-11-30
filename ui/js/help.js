"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('help');
   
   if (!window.params.id) {
      enableErrorModal("No help file specified.", 'help');
      return;
   }
   
   window.cgat = {};
   window.cgat.helpId = '';
   
   $.ajax({
      url: 'api/help',
      dataType: 'json',
      data: {id: window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching help file', 'help');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid help file', 'help');
            return;
         }
         
         //setSubtitle(data.info.help.meta.name);

         window.cgat.helpId = data.info.help['_id']['$id'];

         // Place the help info.
         $('#help-info-area').html(makeHelp(data.info.help));
         
         disableModal();
      }
   });
});

function postAHelpFile() {
   enableLoadingModal('help');
   $.ajax({
      url: 'api/create_help',
      type: 'POST',
      dataType: 'json',
      data: {help: window.cgat.helpId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Creating help info', 'help');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorConfirmModal('Creating help info', 'help');
            return;
         }
      }
   });
}

