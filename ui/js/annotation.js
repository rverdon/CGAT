"use strict";

// TODO(eriq): Centralize the annotation data.
//  Maybe use some setters to update dom elements accordingly.

// TODO(eriq): Validation is not done where someone shrinks the gene size smaller
//  than the range of the current exons.
//  Aldrin says to just yell at them on gene start/end change.

document.addEventListener('DOMContentLoaded', function () {
   window.cgat = {};
   window.cgat.exons = [];
   window.cgat.currentExon = null;
   window.cgat.selectionStart = 0;
   window.cgat.selectionEnd = 0;
   window.cgat.exonKey = 0;
   window.cgat.dna = '';
   window.cgat.geneName = '';
   window.cgat.reverseComplement = false;
   window.cgat.nucleoditesPerWindow = 200;
   window.cgat.geneStart = 0;
   window.cgat.geneEnd = 0;
   window.cgat.contigId = null;
   window.cgat.userId = null;

   // Block interation until the info is loaded.
   enableLoadingModal('annotation');

   $.ajax({
      url: 'api/annotation',
      dataType: 'json',
      data: {'id': window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Annotation', 'annotation');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Annotation', 'annotation');
            return;
         }

         // Users must be logged in to visit an annotation page. They must also own the annotation.
         // If they are not, forward them to the view-annotation page for this annotation.
         if (!window.cgatSession || window.cgatSession.userId != data.annotation.user_id['$id']) {
            window.location.href = 'view-annotation?id=' + data.annotation['_id']['$id'];
            return;
         }

         window.cgat.annotationId = data.annotation['_id']['$id'];
         window.cgat.dna = data.contig.sequence;
         window.cgat.geneStart = data.annotation.start || 0;
         window.cgat.geneEnd = data.annotation.end || window.cgat.dna.length - 1;
         window.cgat.contigId = data.contig['_id']['$id'];
         window.cgat.userId = data.annotation.user_id['$id'];

         // Place the exons.
         if (data.annotation.exons) {
            data.annotation.exons.forEach(function(exon) {
               addExonWithoutPlacing(exon.start, exon.end);
            });
         }

         // Check for RC
         window.cgat.reverseComplement = data.annotation.reverse_complement;
         document.getElementById('annotation-rc').checked = data.annotation.reverse_complement;

         // Set up the simple-box.
         var geneOptions = '';
         for (var geneName in data.contig.isoform_names) {
            geneOptions += "<option value='" + geneName + "'>" + geneName + "</option>";
         }
         $('#annotation-name').html(geneOptions);
         $('#annotation-name').addClass('simple-box');
         simpleBoxInit();

         // Fill in the gene name
         window.cgat.geneName = data.annotation.isoform_name || '';
         setSubtitle(window.cgat.geneName);
         simpleBoxSelectValue(0, window.cgat.geneName, window.cgat.geneName);

         fillRuler(window.cgat.dna.length);

         // Set the gene end.
         $('#annotation-end').val(window.cgat.geneEnd);
         $('#annotation-start').val(window.cgat.geneStart);
         updateBoundingMarkers();

         // Set the value in #nucleotides-per-window.
         document.getElementById('nucleotides-per-window').value = window.cgat.nucleoditesPerWindow;

         updateDnaSelection(0);

         // Interation enabled.
         disableModal();
      }
   });

   var topDna = document.getElementById('top-dna');
   var selector = document.getElementById('dna-selection-draggable');
   // TODO(eriq): This is bugged when you click the same place twice in a row.
   topDna.addEventListener('click', function(mouseEvent) {
      updateDnaSelection(mouseEvent.offsetX);
      selector.style.left =
            mouseEvent.offsetX - Math.floor(selector.offsetWidth / 2);
   });

   // Change the size of the slider with the number box.
   document.getElementById('nucleotides-per-window').addEventListener('change', function(test, test2) {
      var inputBox = document.getElementById('nucleotides-per-window');
      var newValue = parseInt(inputBox.value, 10);

      // Validate the field. Must be > 0 and <= dna.length.
      if (newValue < 1 || newValue > window.cgat.dna.length) {
         // Reset the field to the previous value.
         inputBox.value = window.cgat.nucleoditesPerWindow;
         validationError('Must be between 1 and ' + window.cgat.dna.length, 'nucleotides-per-window-span');
         return;
      }
      clearValidationError('nucleotides-per-window-span');

      window.cgat.nucleoditesPerWindow = newValue;
      updateDnaSelection(document.getElementById('dna-selection-draggable').offsetLeft);
   });

   // Change the title of the page with the gene name.
   document.getElementById('annotation-name').addEventListener('change', function() {
      var newName = document.getElementById('annotation-name').value;
      window.cgat.geneName = newName;
      setSubtitle(newName);
   });

   // Pay attention to changin the rc checkbox.
   document.getElementById('annotation-rc').addEventListener('change', function() {
      window.cgat.reverseComplement = document.getElementById('annotation-rc').checked;
      updateDnaSelection(document.getElementById('dna-selection-draggable').offsetLeft);
   });

   // Validate and update start/end of gene.
   document.getElementById('annotation-start').addEventListener('change', function() {
      var newStart = parseInt($('#annotation-start').val());
      if (!startEndValidate(newStart, window.cgat.geneEnd, 'annotation-start-area')) {
         $('#annotation-start').val(window.cgat.geneStart);
         return;
      }
      // Clear the error for the end also.
      clearValidationError('annotation-end-area');

      window.cgat.geneStart = newStart;
      updateBoundingMarkers();
   });

   document.getElementById('annotation-end').addEventListener('change', function() {
      var newEnd = parseInt($('#annotation-end').val());
      if (!startEndValidate(window.cgat.geneStart, newEnd, 'annotation-end-area')) {
         $('#annotation-end').val(window.cgat.geneEnd);
         return;
      }
      // Clear the error for the start also.
      clearValidationError('annotation-start-area');

      window.cgat.geneEnd = newEnd;
      updateBoundingMarkers();
   });
});

$(function() {
   $('#dna-selection-draggable').draggable({axis: 'x',
                                            containment: 'parent',
                                            stop: selectorStopped});
});

// TODO(eriq): Abstract this more and move it into script.js.
// Returns true on no error, false on error.
// This will clear any errors on the dump if it is valid.
function startEndValidate(start, end, errorDump) {
   if (start < 0 || end < 0 ||
       start >= window.cgat.dna.length ||
       end >= window.cgat.dna.length) {
      validationError('Gene Start and End must be >= 0 and < ' + window.cgat.dna.length,
                      errorDump);
      return false;
   } else if (start >= end) {
      validationError('Begin must be < End', errorDump);
      return false;
   }

   clearValidationError(errorDump);
   return true;
}

// Update the markers that mark the beginning and end of the gene.
function updateBoundingMarkers() {
   // Clear the previous markers.
   $('.top-dna-boundary-marker').remove();

   var sizeRatio = document.getElementById('top-dna').offsetWidth / window.cgat.dna.length;

   var startSize = Math.floor(window.cgat.geneStart * sizeRatio);
   var endSize = Math.floor((window.cgat.dna.length - window.cgat.geneEnd) * sizeRatio);

   var startBound = document.createElement('div');
   startBound.className = 'top-dna-boundary-marker top-dna-boundary-marker-begin';
   startBound.style.top = '0px';
   startBound.style.width = '' + startSize + 'px';
   startBound.style.left = '0px';
   document.getElementById('top-dna').appendChild(startBound);

   var endBound = document.createElement('div');
   endBound.className = 'top-dna-boundary-marker top-dna-boundary-marker-end';
   endBound.style.top = '0px';
   endBound.style.width = '' + endSize + 'px';
   endBound.style.right = '0px';
   document.getElementById('top-dna').appendChild(endBound);
}

function fillRuler(length) {
   var tick = highestOrderIntRound(Math.floor(length / 10));
   var ruler = [];

   for (var i = 1; i <= 10; i++) {
      ruler.push("<p class='dna-ruler-tick'>" + (tick * i) + "</p>");
   }
   document.getElementsByClassName('dna-ruler')[0].innerHTML = ruler.join('');
}

function nucleotideClicked(position) {
   if (window.cgat.currentExon != null) {
      if (window.cgat.currentExon === position) {
         window.cgat.currentExon = null;
         document.getElementById('nucleotide-' + position).className =
               document.getElementById('nucleotide-' + position)
                  .className.replace(/selected-nucleotide/, '');
      } else {
         var start = Math.min(window.cgat.currentExon, position);
         var end = Math.max(window.cgat.currentExon, position);

         var selectedElement = document.getElementById('nucleotide-' + window.cgat.currentExon);
         // Selected element may no longer be visible.
         if (selectedElement) {
            selectedElement.className = selectedElement.className.replace(/selected-nucleotide/, '');
         }

         addExon(start, end);
         window.cgat.currentExon = null;
      }
   } else {
      window.cgat.currentExon = position;
      document.getElementById('nucleotide-' + position).classList.add('selected-nucleotide');
   }
}

function removeExon(key) {
   delete window.cgat.exons[key];
   var removeExon = document.getElementById('exon-' + key);
   removeExon.parentElement.removeChild(removeExon);
   placeExons();
}

// This is a dangerous function and should only be called from within
//  addExon() and the initial placement.
function addExonWithoutPlacing(start, end) {
   createExonElement(start, end, window.cgat.exonKey);
   window.cgat.exons[window.cgat.exonKey] = {start: start, end: end};
   window.cgat.exonKey++;
}

function addExon(start, end) {
   addExonWithoutPlacing(start, end);
   placeExons();
}

function addExonFromButton() {
   var start = document.getElementById('add-exon-start').value;
   var end = document.getElementById('add-exon-end').value;

   if (!startEndValidate(start, end, 'add-exon-collapse-area')) {
      return;
   }

   addExon(start, end);
}

function createExonElement(start, end, key) {
   var exonElement = document.createElement('div');
   exonElement.id = 'exon-' + key;
   exonElement.classList.add('exon');
   exonElement.setAttribute('data-start', start);

   var exonElementString =
         "<span>Begin: </span>" +
         "<input type='number' id='exon-start-" + key + "'" +
            " value=" + start +
            " onchange='updateExon(" + key + ");'/>" +
         "<span>End: </span>" +
         "<input type='number' id='exon-end-" + key + "'" +
            " value=" + end +
            " onchange='updateExon(" + key + ");'/>" +
         "<button onclick='removeExon(" + key + ");'>Remove Exon</button>";

   exonElement.innerHTML = exonElementString;

   // Find the correct place to insert the node.
   // This is the exon that belongs after this node.
   // If it remains null, the new exon will be inserted at the end.
   var afterNode = null;
   $('.exon').each(function() {
      if (parseInt(this.getAttribute('data-start')) > start) {
         afterNode = this;
         // This breaks.
         return false;
      }
   });
   document.getElementById('exons').insertBefore(exonElement, afterNode);
}

function updateExon(key) {
   var newStart = parseInt(document.getElementById('exon-start-' + key).value, 10);
   var newEnd = parseInt(document.getElementById('exon-end-' + key).value, 10);

   if (!startEndValidate(newStart, newEnd, 'exon-start-' + key)) {
      document.getElementById('exon-start-' + key).value = window.cgat.exons[key].start;
      document.getElementById('exon-end-' + key).value = window.cgat.exons[key].end;
      return;
   }

   window.cgat.exons[key].start = newStart;
   window.cgat.exons[key].end = newEnd;

   placeExons();
}

// TODO(eriq): Only place delta
// Since this is called whenever exons need placement, this is the time
//  to do any coordination with the global gene end and start.
function placeExons() {
   // Clear all old exons.
   var oldNucleotides = document.getElementsByClassName('nucleotide');
   for (var i = 0; i < oldNucleotides.length; i++) {
      oldNucleotides[i].className =
         oldNucleotides[i].className.replace(/exon((Start)|(End))/, '');
   }

   var updateBounds = false;

   // Mark the exons on the viewer.
   for (var exonKey in window.cgat.exons) {
      var exon = window.cgat.exons[exonKey];

      if (exon.start >= window.cgat.selectionStart &&
          exon.start < window.cgat.selectionEnd) {
         document.getElementById('nucleotide-' + exon.start).classList.add('exonStart');
      }

      if (exon.end >= window.cgat.selectionStart &&
          exon.end < window.cgat.selectionEnd) {
         document.getElementById('nucleotide-' + exon.end).classList.add('exonEnd');
      }

      // Check the bounds
      if (exon.start < window.cgat.geneStart) {
         window.cgat.geneStart = exon.start;
         updateBounds = true;
      }
      if (exon.end > window.cgat.geneEnd) {
         window.cgat.geneEnd = exon.end;
         updateBounds = true;
      }
   }

   if (updateBounds) {
      $('#annotation-start').val(window.cgat.geneStart);
      $('#annotation-end').val(window.cgat.geneEnd);
      updateBoundingMarkers();
   }

   // Mark the exons on the top dna.
   // Clear the previous markers.
   $('.top-dna-exon-marker').remove();

   var sizeRatio = document.getElementById('top-dna').offsetWidth / window.cgat.dna.length;

   // Place the new ones.
   for (var exonKey in window.cgat.exons) {
      var exon = window.cgat.exons[exonKey];
      var topOffset = window.cgat.reverseComplement ? '16' : '0';

      var marker = document.createElement('div');
      marker.className = 'top-dna-exon-marker';
      marker.style.top = '' + topOffset + 'px';
      marker.style.width = '' + Math.floor(sizeRatio * (exon.end - exon.start)) + 'px';
      marker.style.left = '' + Math.floor(exon.start * sizeRatio) + 'px';

      // TODO(eriq): Append all the kids at the same time.
      document.getElementById('top-dna').appendChild(marker);
   }

   placeExonDiagram();
}

function placeExonDiagram() {
   var html = '';

   var count = 0;
   sortExons(window.cgat.exons).forEach(function(exon) {
      html += "<div class='gene-diagram-exon gene-diagram-element'>" +
              "<p class='gene-diagram-exon-begin'>" + exon.start + "</p>" +
              "<p class='gene-diagram-exon-end'>" + exon.end + "</p>" +
              "</div>";

      count++;

      if (count != window.cgat.exons.length) {
         html += "<div class='gene-diagram-element gene-diagram-intron'>" +
                 "<div class='gene-diagram-intron-line'></div>" +
                 "</div>";
      }
   });

   $('#gene-diagram').html(html);
}

function sortExons(exons) {
   var sorted = [];

   for (var exonKey in exons) {
      sorted.push(exons[exonKey]);
   }

   return sorted.sort(function(a, b) {
      return a.start - b.start;
   });
}

// markPosition is meant to mark the first nucleotide in each line.
function createNucleotideDiv(nucleotide, position, markPosition, codon, codonWindow) {
   var positionMarker = '';
   if (markPosition) {
      positionMarker = '<div class="line-position-marker">' + position + '</div>';
   }

   var codonElement = '';
   if (codon) {
      codonElement = '<div class="codon codon-' + codon.replace(/\W/, '') + ' codon-window-' +
                     codonWindow + '">' + codon + '</div>';
   }

   return "<div class='nucleotide'" +
          " data-position='" + position + "'" +
          " onClick='nucleotideClicked(" + position + ");'" +
          " id='" + "nucleotide-" + position + "'>" +
          "<div class='nucleotide-base nucleotide-" + nucleotide + "'>" + nucleotide + "</div>" +
          positionMarker +
          codonElement +
          "</div>";
}

function selectorStopped(eventObj, uiObj) {
   updateDnaSelection(uiObj.position.left);
}

function updateDnaSelection(leftEdge) {
   var topDnaWidth = document.getElementById('top-dna').offsetWidth;
   var sizeRatio = window.cgat.nucleoditesPerWindow / window.cgat.dna.length;
   var selectorWidth = Math.floor(sizeRatio * topDnaWidth);
   document.getElementById('dna-selection-draggable').style.width = selectorWidth;

   var leftEdgePercent = leftEdge / topDnaWidth;
   var start = Math.floor(leftEdgePercent * window.cgat.dna.length);

   // TODO(eriq): Don't go off the edge.
   window.cgat.selectionStart = start;
   window.cgat.selectionEnd = start + window.cgat.nucleoditesPerWindow;

   document.getElementById('debug-selection-x').innerHTML = leftEdge;
   document.getElementById('debug-selection-percent').innerHTML = leftEdgePercent * 100;

   var sequence = null;
   if (window.cgat.reverseComplement) {
      sequence = reverseComplement(window.cgat.dna.substring(start, start + window.cgat.nucleoditesPerWindow));
   } else {
      sequence = window.cgat.dna.substring(start, start + window.cgat.nucleoditesPerWindow);
   }

   // Get the translated codons.
   // Remember, because of windows, not every nucleotide will be included in a codon.
   // So, start from the first multiple of three.
   var codonStartOffset = (Math.ceil(start / 3) * 3) - start;
   var windowedCodons = [];
   windowedCodons.push(codonTranslation(sequence, codonStartOffset));
   windowedCodons.push(codonTranslation(sequence, codonStartOffset + 1));
   windowedCodons.push(codonTranslation(sequence, codonStartOffset + 2));

   var codonCounter = 0;
   var sequenceDivs = [];
   var markPosition = false;
   for (var i = 0; i < sequence.length; i++) {
      // TODO(eriq): 50 is magic for number of nucleotides per line. Put it in constants.
      markPosition = (i % 50) === 0;

      // If there is a codon associated with the nucleodite, pair it with the nucleotide.
      if (i >= codonStartOffset) {
         var currentCodon = windowedCodons[codonCounter % 3][Math.floor(codonCounter / 3)];
         sequenceDivs.push(createNucleotideDiv(sequence[i], start + i, markPosition,
                                               currentCodon, codonCounter % 3));
         codonCounter++;
      } else {
         sequenceDivs.push(createNucleotideDiv(sequence[i], start + i, markPosition, null));
      }
   }
   document.getElementById('standard-sequence').innerHTML = sequenceDivs.join('');

   placeExons();
}

function collectAnnotationData() {
   var data = {};
   data.annotationId = window.cgat.annotationId;
   data.start = window.cgat.geneStart;
   data.end = window.cgat.geneEnd;
   data.reverseComplement = window.cgat.reverseComplement;
   data.geneName = window.cgat.geneName;
   data.contigId = window.cgat.contigId;
   data.userId = window.cgat.userId;

   data.exons = [];
   for (var key in window.cgat.exons) {
      if (window.cgat.exons[key]) {
         data.exons.push(window.cgat.exons[key]);
      }
   }

   return data;
}

// Return false on calidation error
// Validate any required information before a submit.
function validateBeforeSubmit() {
   // The only thing I can think of here is the gene name.
   if ($('#annotation-name').val().length === 0) {
      validationError('Must have a Gene Name', 'gene-name-area');
      return false;
   }

   return true;
}

function saveAnnotation() {
   enableLoadingModal('annotation');
   $.ajax({
      url: 'api/save_annotation',
      type: 'POST',
      dataType: 'json',
      data: collectAnnotationData(),
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Saving Annotation', 'annotaion');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Annotation Saved', 'annotation');
      }
   });
}

//TODO(eriq): Go To view
function submitAnnotation() {
   if (!validateBeforeSubmit()) {
      return;
   }

   enableLoadingModal('annotation');
   $.ajax({
      url: 'api/submit_annotation',
      type: 'POST',
      dataType: 'json',
      data: collectAnnotationData(),
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Submitting Annotation', 'annotaion');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         enableConfirmModal('Annotation Submitted', 'annotation', 'goToView');
      }
   });
}

function goToView() {
   window.location.href = 'view-annotation?id=' + window.cgat.annotationId;
}
