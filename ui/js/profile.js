"use strict";

document.addEventListener('DOMContentLoaded', function () {
   // Block interation until the info is loaded.
   enableLoadingModal('profile');

   $.ajax({
      url: 'fetch/user_profile',
      dataType: 'json',
      data: {user: window.params.user},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Profile', 'profile');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Profile', 'profile');
            return;
         }

         // Bio Info
         $('#profile-user-name').text(data.meta.first_name + ' ' + data.meta.last_name);
         $('#profile-user-full-name').text(data.meta.user_name);
         setSubtitle(data.meta.user_name);
         document.title = '' + data.meta.user_name + "'s Profile";
         $('#profile-user-email').text(data.meta.email);
         $('#profile-user-pic').attr('src', data.profilePic);
         $('#profile-user-last-login').text('Last Login: ' + formatEpochDate(data.meta.last_login.sec));

         // Notifications
         // TODO(eriq): Make links to the contig/species and whatnot
         var notifications = '';
         data.tasks.forEach(function(notification) {
            notifications += "<div class='notification profile-entry' id='notification-" + notification.contig_id +
                                "' " + "onclick='annotationClicked(" + notification.contig_id + ");'>" +
                             "<h3>" + notification.contig_meta.meta.name + "</h3>" +
                             "<span>Species: " + notification.contig_meta.meta.species + "</span>" +
                             "<span>Difficulty: " + notification.contig_meta.meta.difficulty + "</span>" +
                             "<div class='cancel-button' onclick='cancelNotification(" + notification.contig_id + ");'></div>" +
                             "</div>";
         });
         $('#notifications-area').html(notifications);


         // Partials
         var partials = '';
         data.incomplete_annotations.forEach(function(partial) {
            partials += "<div class='partial profile-entry' id='partial-" + partial.id + "' " +
                           "onclick='annotationClicked(" + partial.id + ");'>" +
                        "<h3>Name: " + partial.annotation_info.isoform_name + "</h3>" +
                        "<h3>Contig: " + partial.contig_info.meta.name + "</h3>" +
                        "<h3>Last Mod: " + formatEpochDate(partial.annotation_info.meta.last_modified) + "</h3>" +
                        "</div>";
         });
         $('#partials-area').html(partials);

         // Recents
         var recents = '';
         data.history.forEach(function(recent) {
            recents += "<div class='recent profile-entry' id='recent-" + recent.id + "' " +
                          "onclick='annotationClicked(" + recent.id + ");'>" +
                        "<h3>Name: " + recent.annotation_info.isoform_name + "</h3>" +
                        "<h3>Contig: " + recent.contig_info.meta.name + "</h3>" +
                        "<h3>Submitted At: " + formatEpochDate(recent.meta.date.sec) + "</h3>" +
                        "<h3>Score: " + recent.meta.experience_gained + "</h3>" +
                        "</div>";
         });
         $('#recents-area').html(recents);

         // Interation enabled.
         disableModal();
      }
   });
});

function cancelNotification(id) {
   $('#notification-' + id).remove();
   $.ajax({
      url: 'fetch/cancel_notification',
      type: 'POST',
      data: {id: id},
      error: function(jqXHR, textStatus, errorThrown) {
         // TODO(eriq): Do more.
         console.log("Error canceling an annotation: " + textStatus);
      }
   });
}

// TODO(eriq): Navigate to the real annotation.
function annotationClicked(id) {
   window.location.href = 'annotation?id=' + id;
}
