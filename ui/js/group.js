"use strict";

// TODO(eriq): Get login status from backend and change button accordingly.

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('group');

   window.cgat = {};
   window.cgat.disableGroupButton = false;
   window.cgat.userId = '';
   window.cgat.userName = '';
   window.cgat.groupId = '';
   window.cgat.groupName = '';

   // TODO(eriq): If there is no logged-in user, then remove the join/leave button.
});

function joinGroup() {
   if (window.cgat.disableGroupButton) {
      return;
   }

   // Don't let people spam the button.
   window.cgat.disableGroupButton = true;

   $.ajax({
      url: 'fetch/leave_notification',
      type: 'POST',
      data: {user: window.cgat.userId, group: window.cgat.groupId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Leaving Group', 'group');
         window.cgat.disableGroupButton = false;
      },
      success: function(data, textStatus, jqXHR) {
         $('#join-leave-button').text('Leave ' + window.cgat.groupName);
         $('#join-leave-button').click(leaveGroup);
         window.cgat.disableGroupButton = false;
      }
   });
}

function leaveGroup() {
   if (window.cgat.disableGroupButton) {
      return;
   }

   // Don't let people spam the button.
   window.cgat.disableGroupButton = true;

   $.ajax({
      url: 'fetch/leave_notification',
      type: 'POST',
      data: {user: window.cgat.userId, group: window.cgat.groupId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Leaving Group', 'group');
         window.cgat.disableGroupButton = false;
      },
      success: function(data, textStatus, jqXHR) {
         $('#join-leave-button').text('Join ' + window.cgat.groupName);
         $('#join-leave-button').click(joinGroup);
         window.cgat.disableGroupButton = false;
      }
   });
}
