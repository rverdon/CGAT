"use strict";

// TODO(eriq): Validate group name.

// TODO(eriq): Have an option that disables previews for FASTA
//  it requires a full round trip... then again, it is a good chance for the loading screen.

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

         // Need all the groups for the assign task.
         var allGroupOptions = "<option value=''>Available Groups</option>";

         // Add the groups to the join group select.
         var joinOptions = "<option value=''>Existing Groups</option>";
         for (var groupId in window.cgat.outGroups) {
            joinOptions += "<option value='" + groupId + "'>" +
                       window.cgat.outGroups[groupId].name + "</option>";
            allGroupOptions += "<option value='" + groupId + "'>" +
                       window.cgat.outGroups[groupId].name + "</option>";
         }
         $('#join-group-select').html(joinOptions);

         // Add the groups to the leave group select.
         var leaveOptions = "<option value=''>Joined Groups</option>";
         for (var groupId in window.cgat.inGroups) {
            leaveOptions += "<option value='" + groupId + "'>" +
                       window.cgat.inGroups[groupId].name + "</option>";
            allGroupOptions += "<option value='" + groupId + "'>" +
                       window.cgat.inGroups[groupId].name + "</option>";
         }
         $('#leave-group-select').html(leaveOptions);

         // Fill in the assign task groups.
         $('#assign-task-group-select').html(allGroupOptions);

         // Fill the assign task contigs select.
         var contigOptions = "<option value=''>Available Contigs</option>";
         data.info.contigs.forEach(function(contig) {
            contigOptions += "<option value='" + contig['_id']['$id'] + "'>" +
                             contig.meta.name + "</option>";
         });
         $('#assign-task-contig-select').html(contigOptions);
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

   // Validate assign task.
   $('#assign-task-button').attr('disabled', 'disabled');
   $('.assign-task-field').change(function() {
      validateAssignTask();
   });

   // Attach listeners to the radio buttons.
   $('input[name=method]:radio').change(updateSelectedMethod);

   // Listen to the file upload iframe.
   document.getElementById('fasta-file-upload-iframe').addEventListener('load', function() {
      var content = document.getElementById('fasta-file-upload-iframe').contentWindow.cgatFasta;

      if (content && content.valid) {
         $('#fasta-method-sequence').val(content.sequence);
         $('#fasta-method-name').val(content.contigName);
         disableModal();
      } else {
         enableErrorConfirmModal('Parsing FASTA File', 'administration');
      }
   });

   // Automatically try to parse the FASTA file.
   $('#fasta-file-upload-input').change(function() {
      if (this.value != '') {
         document.getElementById('fasta-file-upload-form').target = 'fasta-file-upload-iframe';
         document.getElementById('fasta-file-upload-form').submit();

         // Balanced in the load listener for the iframe.
         enableLoadingModal('administration');
      }
   });
});

function updateSelectedMethod(eventObj) {
   $('input[name=method]:radio').each(function(radioElement) {
      if (this.checked) {
         $('#' + this.value + '-method-area').addClass('selected-method');
      } else {
         $('#' + this.value + '-method-area').removeClass('selected-method');
      }
   });
}

// TODO(eriq): Don't yell about all fields if they have never gotten any input.
function validateAssignTask() {
   var error = false;

   if (!$('#assign-task-description').val()) {
      validationError('Need Description', 'assign-task-description-span');
      error = true;
   } else {
      clearValidationError('assign-task-description-span');
   }

   if (!$('#assign-task-contig-select').val()) {
      validationError('Need Contig', 'assign-task-contig-select-span');
      error = true;
   } else {
      clearValidationError('assign-task-contig-select-span');
   }

   if (!$('#assign-task-group-select').val()) {
      validationError('Need Group', 'assign-task-groups-span');
      error = true;
   } else {
      clearValidationError('assign-task-groups-span');
   }

   if (!$('#assign-task-end-date').val()) {
      validationError('Need End Date', 'assign-task-end-date-span');
      error = true;
   } else if (fromInputDateToEpoch($('#assign-task-end-date').val()) < Math.floor((new Date()).getTime() / 1000)) {
      validationError('Need Future Date', 'assign-task-end-date-span');
      error = true;
   } else {
      clearValidationError('assign-task-end-date-span');
   }

   if (error) {
      $('#assign-task-button').attr('disabled', 'disabled');
   } else {
      $('#assign-task-button').removeAttr('disabled');
   }

   return !error;
}

// TODO(eriq): Validate that group does not yet exist.
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

   return !error;
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
   if (!validateCreateGroup()) {
      return;
   }

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

function assignTask() {
   if (!validateAssignTask()) {
      return;
   }

   enableLoadingModal('administration');
   $('#assign-task-button').attr('disabled', 'disabled');
   $.ajax({
      url: 'api/assign_task',
      type: 'POST',
      data: {groups: $('#assign-task-group-select').val(),
             taskDescription: $('#assign-task-description').val(),
             contig: $('#assign-task-contig-select').val(),
             endDate: fromInputDateToEpoch($('#assign-task-end-date').val())},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Assigning Task', 'administration');
         $('#assign-task-button').removeAttr('disabled');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Successfully Assigned Task', 'administration',
                            'goToAssignTask');
         $('#assign-task-button').removeAttr('disabled');
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

function goToAssignTask() {
   window.location.href = '/administration#assign-task';
   window.location.reload(true);
}

function uploadManual() {
   // TODO(eriq): Validation.

   enableLoadingModal('administration');
   $.ajax({
      url: 'api/upload_contig',
      type: 'POST',
      data: {name: $('#manual-method-name').val(),
             source: $('#manual-method-source').val(),
             difficulty: $('#manual-method-difficulty').val(),
             species: $('#manual-method-species').val(),
             sequence: $('#manual-method-sequence').val()},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Uploading Contig', 'administration');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Successfully Uploaded Contig', 'administration',
                            'goToAssignTask');
      }
   });
}

function uploadFasta() {
   // TODO(eriq): Validation, share validation with manual.

   enableLoadingModal('administration');
   $.ajax({
      url: 'api/upload_contig',
      type: 'POST',
      data: {name: $('#fasta-method-name').val(),
             source: $('#fasta-method-source').val(),
             difficulty: $('#fasta-method-difficulty').val(),
             species: $('#fasta-method-species').val(),
             sequence: $('#fasta-method-sequence').val()},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Uploading Contig', 'administration');
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Successfully Uploaded Contig', 'administration',
                            'goToAssignTask');
      }
   });
}
