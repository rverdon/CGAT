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
         var notifications = '';
         data.tasks.forEach(function(notification) {
            notifications += makeNotification(notification, data['_id']['$id']);
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

function makeNotification(notification, userId) {
   var notificationId = notification['_id']['$id'];
   return "<div class='notification profile-entry' id='notification-" + notificationId + "'>" +
          "<span>Contig: <a href='contig?id=" + notification.contig_meta['_id']['$id'] + "'>" +
                notification.contig_meta.meta.name + "</a></span>" +
          "<span>Species: <a href='search?species=" + notification.contig_meta.meta.species + "'>" +
                notification.contig_meta.meta.species + "</a></span>" +
          "<span>Difficulty: " + notification.contig_meta.meta.difficulty + "</span>" +
          "<div class='cancel-button' onclick='cancelNotification(\"" + notificationId + "\", \"" + userId + "\");'></div>" +
          "<div class='annotate-button' onclick='beginAnnotation(\"" + notificationId + "\", \"" + userId + "\");'></div>" +
          "</div>";
}

//TODO(eriq)
function beginAnnotation(notificationId, userId) {
   console.log("Begin Annotation: " + notificationId);
   //window.location.href = 'annotation?id=' + id;
}

function cancelNotification(id, userId) {
   $('#notification-' + id).remove();
   $.ajax({
      url: 'fetch/cancel_notification',
      type: 'POST',
      data: {id: id, user: userId},
      error: function(jqXHR, textStatus, errorThrown) {
         // TODO(eriq): Do more.
         console.log("Error canceling an annotation: " + textStatus);
      }
   });
}
