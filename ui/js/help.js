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
*/
         // Place the help info.
         $('#help-title').html(makeHelp(data.info.title));
         $('#help-info-area').html(makeHelp(data.info.html));


         disableModal();
      }
   });
});

