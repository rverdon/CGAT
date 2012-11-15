"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('gene');

   if (!window.params.name) {
      enableErrorModal("No Gene Specified", 'gene');
      return;
   }

   $.ajax({
      url: 'api/gene',
      dataType: 'json',
      data: {name: window.params.name},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Gene', 'gene');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Gene', 'gene');
            return;
         }

         setSubtitle(window.params.name);

         //TODO: Place the info.
         console.log(data);

         disableModal();
      }
   });
});
