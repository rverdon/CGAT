"use strict";

// TODO(eriq): If there is no user, but one is logged in, use theior profile
// TODO(eriq): Public profiles for users (don't show partials or notifications).

document.addEventListener('DOMContentLoaded', function () {
   // Block interation until the info is loaded.
   enableLoadingModal('profile');

   $.ajax({
      url: 'api/user_profile',
      dataType: 'json',
      data: {user: window.params.user},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Profile', 'profile');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            if (data.error && data.error === 'nouser') {
               enableErrorModal('Login To See Your Profile', 'profile');
            } else if (data.error && data.error === 'cantfind') {
               enableErrorModal('Cannot Find User', 'profile');
            } else {
               enableErrorModal('Invalid Profile', 'profile');
            }
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

         // Rank info
         $('#stats-level').text('Level ' + data.meta.level);
         $('#stats-exp').text(data.meta.exp + ' Experience');

         // Notifications
         if (window.cgatSession && window.cgatSession.userId === data['_id']['$id']) {
            if (data.tasks) {
               var notifications = '';
               data.tasks.forEach(function(notification) {
                  notifications += makeNotification(notification, data['_id']['$id']);
               });
               $('#notifications-area').html(notifications);
            }
         } else {
            $('#notifications').remove();
         }

         // Partials
         if (window.cgatSession && window.cgatSession.userId === data['_id']['$id']) {
            if (data.incomplete_annotations) {
               var partials = '';
               data.incomplete_annotations.forEach(function(partial) {
                  partials += makePartial(partial, data['_id']['$id']);
               });
               $('#partials-area').html(partials);
            }
         } else {
            $('#partials').remove();
         }

         // Recents
         if (data.history) {
            var recents = '';
            data.history.forEach(function(recent) {
               recents += makeRecent(recent, data['_id']['$id']);
            });
            $('#recents-area').html(recents);
         }

         // Groups
         if (data.groups) {
            var groups = '';
            data.groups.forEach(function(group) {
               groups += makeGroup(group, data['_id']['$id']);
            });
            $('#groups-inset').html(groups);
         }

         // Interation enabled.
         disableModal();
      }
   });
});

// TODO(eriq): Make nice on-hover
function makeGroup(group, userId) {
   var cancelButton = '';
   // TODO(eriq): Problem with joining groups from admin page.
   console.log(group);
   var groupId = group.info['_id']['$id'];

   if (window.cgatSession && window.cgatSession.userId === userId) {
      cancelButton = "<div class='cancel-button group-cancel-button' onclick='leaveGroup(\"" +
                     groupId + "\");'></div>";
   }

   return "<div class='group-tag' id='group-" + groupId + "'>" +
          "<span><a href='group?id=" + groupId + "'>" +
                group.info.name + "</a></span>" +
          cancelButton +
          "</div>";
}

// TODO(eriq): Make nice on-hover
function makeRecent(recent, userId) {
   var annotationId = recent.annotation_info['_id']['$id'];
   return "<div class='recent profile-entry' id='recent-" + annotationId + "'>" +
          "<span>Gene: <a href='gene?name=" + recent.annotation_info.isoform_name + "'>" +
                recent.annotation_info.isoform_name + "</a></span>" +
          "<span>Contig: <a href='contig?id=" + recent.contig_info['_id']['$id'] + "'>" +
                recent.contig_info.meta.name + "</a></span>" +
          "<span>Score: " + recent.meta.experience_gained + "</span>" +
          "<span>Submitted At: " + formatEpochDate(recent.meta.date.sec) + "</span>" +
          "<div class='annotate-button history-annotate-button' onclick='viewAnnotation(\"" + annotationId + "\");'></div>" +
          "</div>";
}

// TODO(eriq): Make nice on-hover
function makePartial(partial, userId) {
   var annotationId = partial.annotation_id['$id'];
   return "<div class='partial profile-entry' id='partial-" + annotationId + "'>" +
          "<span>Gene: <a href='gene?name=" + partial.annotation_info.isoform_name + "'>" +
                partial.annotation_info.isoform_name + "</a></span>" +
          "<span>Contig: <a href='contig?id=" + partial.contig_info['_id']['$id'] + "'>" +
                partial.contig_info.meta.name + "</a></span>" +
          "<span>Difficulty: " + partial.contig_info.meta.difficulty + "</span>" +
          "<span>Last Mod: " + formatEpochDate(partial.annotation_info.meta.last_modified.sec) + "</span>" +
          "<div class='annotate-button' onclick='beginAnnotation(\"" + annotationId + "\");'></div>" +
          "</div>";
}

// TODO(eriq): Make nice on-hover
function makeNotification(notification, userId) {
   var notificationId = notification['_id']['$id'];
   return "<div class='notification profile-entry' id='notification-" + notificationId + "'>" +
          "<span>Contig: <a href='contig?id=" + notification.contig_meta['_id']['$id'] + "'>" +
                notification.contig_meta.meta.name + "</a></span>" +
          "<span>Species: <a href='search?species=" + notification.contig_meta.meta.species + "'>" +
                notification.contig_meta.meta.species + "</a></span>" +
          "<span>Difficulty: " + notification.contig_meta.meta.difficulty + "</span>" +
          "<div class='cancel-button annotation-cancel-button' onclick='cancelNotification(\"" + notificationId + "\");'></div>" +
          "<div class='annotate-button' onclick='createAnnotation(\"" + notificationId +
                "\", \"" + notification.contig_meta['_id']['$id'] + "\");'></div>" +
          "</div>";
}

function leaveGroup(groupId) {
   $('#group-' + groupId).remove();
   $.ajax({
      url: 'api/leave_group',
      type: 'POST',
      data: {group: groupId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Leaving Group', 'profile');
      }
   });
}

function viewAnnotation(annotationId) {
   window.location.href = 'view-annotation?id=' + annotationId;
}

function createAnnotation(notificationId, contigId) {
   enableLoadingModal('profile');
   $.ajax({
      url: 'api/create_annotation',
      type: 'POST',
      dataType: 'json',
      data: {contig: contigId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Creating Annotation', 'profile');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorConfirmModal('Creating Annotation', 'profile');
            return;
         }

         beginAnnotation(data.annotationId['$id']);
      }
   });
}

// Work on an annotation.
function beginAnnotation(annotationId) {
   window.location.href = 'annotation?id=' + annotationId;
}

function cancelNotification(id) {
   $('#notification-' + id).remove();
   $.ajax({
      url: 'api/cancel_notification',
      type: 'POST',
      data: {id: id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Removing Notification', 'profile');
      }
   });
}
