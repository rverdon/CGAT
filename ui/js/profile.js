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
            partials += makePartial(partial, data['_id']['$id']);
         });
         $('#partials-area').html(partials);

         // Recents
         var recents = '';
         data.history.forEach(function(recent) {
            recents += makeRecent(recent, data['_id']['$id']);
         });
         $('#recents-area').html(recents);

         // Interation enabled.
         disableModal();
      }
   });
});

function makeRecent(recent, userId) {
   var annotationId = recent.annotation_info['_id']['$id'];
   return "<div class='recent profile-entry' id='recent-" + annotationId + "'>" +
          "<span>Gene: <a href='gene?id=" + recent.annotation_info.isoform_name + "'>" +
                recent.annotation_info.isoform_name + "</a></span>" +
          "<span>Contig: <a href='contig?id=" + recent.contig_info['_id']['$id'] + "'>" +
                recent.contig_info.meta.name + "</a></span>" +
          "<span>Score: " + recent.meta.experience_gained + "</span>" +
          "<span>Submitted At: " + formatEpochDate(recent.meta.date.sec) + "</span>" +
          "<div class='annotate-button' onclick='viewAnnotation(\"" + annotationId + "\");'></div>" +
          "</div>";
}

function makePartial(partial, userId) {
   var annotationId = partial.annotation_id['$id'];
   return "<div class='partial profile-entry' id='partial-" + annotationId + "'>" +
          "<span>Gene: <a href='gene?id=" + partial.annotation_info.isoform_name + "'>" +
                partial.annotation_info.isoform_name + "</a></span>" +
          "<span>Contig: <a href='contig?id=" + partial.contig_info['_id']['$id'] + "'>" +
                partial.contig_info.meta.name + "</a></span>" +
          "<span>Difficulty: " + partial.contig_info.meta.difficulty + "</span>" +
          "<span>Last Mod: " + formatEpochDate(partial.annotation_info.meta.last_modified.sec) + "</span>" +
          "<div class='annotate-button' onclick='beginAnnotation(\"" + annotationId + "\", \"" + userId + "\");'></div>" +
          "</div>";
}

function makeNotification(notification, userId) {
   var notificationId = notification['_id']['$id'];
   return "<div class='notification profile-entry' id='notification-" + notificationId + "'>" +
          "<span>Contig: <a href='contig?id=" + notification.contig_meta['_id']['$id'] + "'>" +
                notification.contig_meta.meta.name + "</a></span>" +
          "<span>Species: <a href='search?species=" + notification.contig_meta.meta.species + "'>" +
                notification.contig_meta.meta.species + "</a></span>" +
          "<span>Difficulty: " + notification.contig_meta.meta.difficulty + "</span>" +
          "<div class='cancel-button' onclick='cancelNotification(\"" + notificationId + "\", \"" + userId + "\");'></div>" +
          "<div class='annotate-button' onclick='createAnnotation(\"" + notificationId +
                "\", \"" + notification.contig_meta['_id']['$id'] + "\", \"" + userId + "\");'></div>" +
          "</div>";
}

function viewAnnotation(annotationId) {
   window.location.href = 'view-annotation?id=' + annotationId;
}

//TODO(eriq): Remove notification if it is submitted.
function createAnnotation(notificationId, contigId, userId) {
   enableLoadingModal('profile');
   $.ajax({
      url: 'fetch/create_annotation',
      type: 'POST',
      dataType: 'json',
      data: {user: userId, contig: contigId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Creating Annotation', 'profile');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorConfirmModal('Creating Annotation', 'profile');
            return;
         }

         beginAnnotation(data.annotationId['$id'], userId);
      }
   });
}

// Work on an annotation.
function beginAnnotation(annotationId, userId) {
   window.location.href = 'annotation?id=' + annotationId;
}

function cancelNotification(id, userId) {
   $('#notification-' + id).remove();
   $.ajax({
      url: 'fetch/cancel_notification',
      type: 'POST',
      data: {id: id, user: userId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Removing Notification', 'profile');
         console.log("Error canceling an annotation: " + textStatus);
      }
   });
}
