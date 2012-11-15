"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('view-annotation');

   if (!window.params.id) {
      enableErrorModal("No Annotation Specified", 'view-annotation');
      return;
   }

   $.ajax({
      url: 'api/annotation',
      dataType: 'json',
      data: {id: window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Annotation', 'view-annotation');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Annotation', 'view-annotation');
            return;
         }

         setSubtitle(data.annotation.isoform_name);

         //TODO: Place the info.
         console.log(data);

         disableModal();
      }
   });
});
