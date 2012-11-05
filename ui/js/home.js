"use strict";

document.addEventListener('DOMContentLoaded', function () {
   $.ajax({
      url: 'fetch/user_annotations.php',
      dataType: 'json',
      error: function(jqXHR, textStatus, errorThrown) {
         // TODO(eriq): Do more.
         console.log("Error fetching annotations: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
         //TODO: here
      }
   });
});
