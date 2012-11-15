"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('contig');

   if (!window.params.id) {
      enableErrorModal("No Contig Specified", 'contig');
      return;
   }

   $.ajax({
      url: 'api/contig',
      dataType: 'json',
      data: {id: window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Contig', 'contig');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Contig', 'contig');
            return;
         }

         setSubtitle(data.info.contig.meta.name);

         //TODO: Place the info.

         disableModal();
      }
   });
});
