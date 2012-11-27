"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('group');

   window.cgat = {};
   window.cgat.disableGroupButton = false;
   window.cgat.groupId = '';
   window.cgat.groupName = '';

   if (!window.params.id) {
      enableErrorModal("No Group Specified", 'group');
      return;
   }

   $.ajax({
      url: 'api/group',
      dataType: 'json',
      data: {id: window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Group', 'group');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Group', 'group');
            return;
         }

         window.cgat.groupId = data['_id']['$id'];
         window.cgat.groupName = data.name;

         setSubtitle(data.name);
         $('#group-name').text(data.name);
         $('#group-num-members').text(data.users.length);
         $('#group-desc').text(data.description);
         $('#group-created').text(formatEpochDate(data.created.sec));

         var users = '';
         data.users.forEach(function(user) {
            users += '<h3><a href="/profile?user=' + user.name + '">' +
                     user.name + '</a></h3>';
         });
         $('#group-members-area').html(users);

         if (!window.cgatSession) {
            $('#join-leave-button').remove();
         } else {
            var inGroup = false;
            for (var i = 0; i < data.users.length; i++) {
               if (data.users[i].user_id['$id'] === window.cgatSession.userId) {
                  inGroup = true;
                  break;
               }
            }

            if (inGroup) {
               $('#join-leave-button').text('Click To Leave ' + window.cgat.groupName);
               $('#join-leave-button').click(leaveGroup);
            } else {
               $('#join-leave-button').text('Click To Join ' + window.cgat.groupName);
               $('#join-leave-button').click(joinGroup);
            }
         }

         disableModal();
      }
   });
});

function joinGroup() {
   if (window.cgat.disableGroupButton) {
      return;
   }

   // Don't let people spam the button.
   window.cgat.disableGroupButton = true;

   $.ajax({
      url: 'api/join_group',
      type: 'POST',
      data: {group: window.cgat.groupId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Joining Group', 'group');
         window.cgat.disableGroupButton = false;
      },
      success: function(data, textStatus, jqXHR) {
         $('#join-leave-button').unbind('click');
         $('#join-leave-button').text('Click To Leave ' + window.cgat.groupName);
         $('#join-leave-button').click(leaveGroup);
         window.cgat.disableGroupButton = false;
      }
   });
}

// TODO(eriq): Maybe remove yourself from the members.
function leaveGroup() {
   if (window.cgat.disableGroupButton) {
      return;
   }

   // Don't let people spam the button.
   window.cgat.disableGroupButton = true;

   $.ajax({
      url: 'api/leave_group',
      type: 'POST',
      data: {group: window.cgat.groupId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Leaving Group', 'group');
         window.cgat.disableGroupButton = false;
      },
      success: function(data, textStatus, jqXHR) {
         $('#join-leave-button').unbind('click');
         $('#join-leave-button').text('Click To Join ' + window.cgat.groupName);
         $('#join-leave-button').click(joinGroup);
         window.cgat.disableGroupButton = false;
      }
   });
}
