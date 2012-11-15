"use strict";

// TODO(eriq): COMBOBOXES!
// TODO(eriq): Validate group name.

document.addEventListener('DOMContentLoaded', function() {
   if (!window.cgatSession) {
      enableConfirmModal('You Need To Login', 'administration', 'goToLogin');
      return;
   }

   window.cgat = {};
   window.cgat.inGroups = {};
   window.cgat.outGroups = {};

   // Always collapse at the beginning.
   // If there is no hash, all gets collapsed
   collapseAllButHash();

   $.ajax({
      url: 'api/administration_info',
      dataType: 'json',
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Administration Information', 'administration');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Fetching Administration Information', 'administration');
            return;
         }

         // Build and maintain maps of in- and out- groups.
         data.info['in-groups'].forEach(function(group) {
            window.cgat.inGroups[group['_id']['$id']] = group;
         });
         data.info['out-groups'].forEach(function(group) {
            window.cgat.outGroups[group['_id']['$id']] = group;
         });

         // Add the groups to the join group select.
         var joinOptions = "<option value=''>Existing Groups</option>";
         for (var groupId in window.cgat.outGroups) {
            joinOptions += "<option value='" + groupId + "'>" +
                       window.cgat.outGroups[groupId].name + "</option>";
         }
         $('#join-group-select').html(joinOptions);

         // Add the groups to the leave group select.
         var leaveOptions = "<option value=''>Joined Groups</option>";
         for (var groupId in window.cgat.inGroups) {
            leaveOptions += "<option value='" + groupId + "'>" +
                       window.cgat.inGroups[groupId].name + "</option>";
         }
         $('#leave-group-select').html(leaveOptions);
      }
   });

   // Add an onchange to the join group select to enable/disable the button.
   $('#join-group-button').attr('disabled', 'disabled');
   $('#join-group-select').change(function() {
      if ($('#join-group-select').val() != '') {
         $('#join-group-button').removeAttr('disabled');
      } else {
         $('#join-group-button').attr('disabled', 'disabled');
      }
   });

   // Add an onchange to the leave group select to enable/disable the button.
   $('#leave-group-button').attr('disabled', 'disabled');
   $('#leave-group-select').change(function() {
      if ($('#leave-group-select').val() != '') {
         $('#leave-group-button').removeAttr('disabled');
      } else {
         $('#leave-group-button').attr('disabled', 'disabled');
      }
   });

   // Add an onchange to the create group input and validate it.
   $('#create-group-button').attr('disabled', 'disabled');
   $('#create-group-name').change(function() {
      validateCreateGroup();
   });
   $('#create-group-description').change(function() {
      validateCreateGroup();
   });
});

function validateCreateGroup() {
   var error = false;

   // TODO(eriq): Real validation generalized to script.js
   if (!$('#create-group-name').val()) {
      validationError('Bad Group Name', 'create-group-name-span');
      error = true;
   } else {
      clearValidationError('create-group-name-span');
   }

   if (!$('#create-group-description').val()) {
      validationError('Bad Group Description', 'create-group-description-span');
      error = true;
   } else {
      clearValidationError('create-group-description-span');
   }

   if (error) {
      $('#create-group-button').attr('disabled', 'disabled');
   } else {
      $('#create-group-button').removeAttr('disabled');
   }
}

// Collapse other areas
$(window).bind('hashchange', function() {
   if (window.location.hash.length > 0) {
      collapseAllButHash();
   }
});

// The buttons should be named "<second level id>-collapse-button"
// and the areas should be "<second level id>-area"
function collapseAllButHash() {
   var focusArea = window.location.hash.replace(/#/, '');

   $('.second-level-area').each(function() {
      if (this.id == focusArea) {
         uncollapse(this.id + '-collapse-button', this.id + '-area');
      } else {
         collapse(this.id + '-collapse-button', this.id + '-area');
      }
   });
}

function createGroup() {
   enableLoadingModal('administration');
   $('#craete-group-button').attr('disabled', 'disabled');
   $.ajax({
      url: 'api/create_group',
      type: 'POST',
      data: {groupName: $('#create-group-name').val(),
             groupDescription: $('#create-group-description').val()},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Creating Group', 'administration');
         $('#create-group-button').removeAttr('disabled');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Successfully Created and Joined Group', 'administration',
                            'goToCreateGroup');
         $('#create-group-button').removeAttr('disabled');
      }
   });
}

// TODO(eriq): Mod the group lists on this side so a reload is not necessary.
function joinGroup() {
   enableLoadingModal('administration');
   $('#join-group-button').attr('disabled', 'disabled');
   $.ajax({
      url: 'api/join_group',
      type: 'POST',
      data: {group: $('#join-group-select').val()},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Joining Group', 'administration');
         $('#join-group-button').removeAttr('disabled');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Successfully Joined Group', 'administration',
                            'goToJoinGroup');
         $('#join-group-button').removeAttr('disabled');
      }
   });
}

function leaveGroup() {
   enableLoadingModal('administration');
   $('#leave-group-button').attr('disabled', 'disabled');
   $.ajax({
      url: 'api/leave_group',
      type: 'POST',
      data: {group: $('#leave-group-select').val()},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Leaving Group', 'administration');
         $('#leave-group-button').removeAttr('disabled');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Successfully Left Group', 'administration',
                            'goToLeaveGroup');
         $('#leave-group-button').removeAttr('disabled');
      }
   });
}

function goToJoinGroup() {
   window.location.href = '/administration#join-group';
   window.location.reload(true);
}

function goToLeaveGroup() {
   window.location.href = '/administration#leave-group';
   window.location.reload(true);
}

function goToCreateGroup() {
   window.location.href = '/administration#create-group';
   window.location.reload(true);
}
