"use strict";

document.addEventListener('DOMContentLoaded', function () {
   $.ajax({
      url: 'fetch/user_annotations',
      dataType: 'json',
      error: function(jqXHR, textStatus, errorThrown) {
         // TODO(eriq): Do more.
         console.log("Error fetching annotations: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
         // Bio Info
         $('#profile-user-name').text(data.name);
         setSubtitle(data.name);
         document.title = '' + data.name + "'s Profile";
         $('#profile-user-email').text(data.email);
         $('#profile-user-pic').attr('src', data.profilePic);

         // Notifications
         var notifications = '';
         data.notifications.forEach(function(notification) {
            notifications += "<div class='notification profile-entry' id='notification-" + notification.id + "' " +
                                "onclick='annotationClicked(" + notification.id + ");'>" +
                             "<h3>" + notification.name + "</h3>" +
                             "<div class='cancel-button' onclick='cancelNotification(" + notification.id + ");'></div>" +
                             "</div>";
         });
         $('#notifications-area').html(notifications);

         // Partials
         var partials = '';
         data.partialAnnotations.forEach(function(partial) {
            partials += "<div class='partial profile-entry' id='partial-" + partial.id + "' " +
                           "onclick='annotationClicked(" + partial.id + ");'>" +
                        "<h3>Name: " + partial.name + "</h3>" +
                        "<h3>Contig: " + partial.contig.name + "</h3>" +
                        "<h3>Last Mod: " + formatEpochDate(partial.lastModification) + "</h3>" +
                        "</div>";
         });
         $('#partials-area').html(partials);


         // Recents
         var recents = '';
         data.recentAnnotations.forEach(function(recent) {
            recents += "<div class='recent profile-entry' id='recent-" + recent.id + "' " +
                          "onclick='annotationClicked(" + recent.id + ");'>" +
                        "<h3>Name: " + recent.name + "</h3>" +
                        "<h3>Contig: " + recent.contig.name + "</h3>" +
                        "<h3>Last Mod: " + formatEpochDate(recent.lastModification) + "</h3>" +
                        "<h3>Score</h3>" +
                        "</div>";
         });
         $('#recents-area').html(recents);
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
