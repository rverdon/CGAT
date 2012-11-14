"use strict";

// TODO(eriq): COMBOBOXES!

// TODO(eriq): Style disabled buttons.

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
         var options = "<option value=''>Existing Groups</option>";
         for (var groupId in window.cgat.outGroups) {
            options += "<option value='" + groupId + "'>" +
                       window.cgat.outGroups[groupId].name + "</option>";
         }
         $('#join-group-select').html(options);
      }
   });

   $('#join-group-button').attr('disabled', 'disabled');
   // Add an onchange to the join group select to enable/disable the button.
   $('#join-group-select').change(function() {
      if ($('#join-group-select').val() != '') {
         $('#join-group-button').removeAttr('disabled');
      } else {
         $('#join-group-button').attr('disabled', 'disabled');
      }
   });

});

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
         enableConfirmModal('Successfully Joined Group', 'administration');
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
      data: {group: window.cgat.groupId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Leaving Group', 'administration');
         $('#leave-group-button').removeAttr('disabled');
      },
      success: function(data, textStatus, jqXHR) {
         $('#leave-group-button').removeAttr('disabled');
      }
   });
}
