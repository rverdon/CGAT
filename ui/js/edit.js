"use strict";

document.addEventListener('DOMContentLoaded', function() {
   
   if (!window.params.page) {
      return;
   }

   $("#save-button").click(function() {
     setHelpPage();
   });

   $("#go-button").click(function() {
     window.location.href = '/help?page=' + $('#name-field').val();
   });

   enableLoadingModal('help');

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
//         window.cgat.helpPage = data.info.help['_id']['$page'];

         // Place the help info.
         $('#name-field').val(data.info._id);
         $('#title-field').val(data.info.title);
         $('#html-field').val(data.info.html);

         disableModal();
      }
   });

});

function setHelpPage() {
   var dat = {};
   dat.pageName = String($('#name-field').val());
   dat.pageTitle = String($('#title-field').val());
   dat.pageHTML = String($('#html-field').val());

   enableLoadingModal('help');
   $.ajax({
      url: '/api/set_help',
      type: 'POST',
      dataType: 'json',
      data: dat,
      error: function(jqXHR, textStatus, errorThrown) {
         disableModal();
         enableErrorConfirmModal('Setting help info', 'help');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         disableModal();
         if (!data.valid) {
            enableErrorConfirmModal('Setting help info', 'help');
            return;
         }
      }
   });
}

