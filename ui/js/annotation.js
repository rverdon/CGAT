"use strict";

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

   $.ajax({
      url: 'fetch/annotation',
      dataType: 'json',
      error: function(jqXHR, textStatus, errorThrown) {
         // TODO(eriq): Do more.
         console.log("Error fetching annotation: " + textStatus);
      },
      success: function(data, textStatus, jqXHR) {
         window.cgat.dna = data.sequence;
         updateDnaSelection(0);
         var topDnas = document.getElementsByClassName('top-dna');
         var selector = null;
         for (var i = 0; i < topDnas.length; i++) {
            // TODO(eriq): This is bugged when you click the same place twice in a row.
            topDnas[i].addEventListener('click', function(mouseEvent) {
               updateDnaSelection(mouseEvent.offsetX);
               selector = document.getElementById('dna-selection-draggable');
               selector.style.left =
                     mouseEvent.offsetX - Math.floor(selector.offsetWidth / 2);
            });
         }

         fillRuler(window.cgat.dna.length);

         // Set the value in #nucleotides-per-window.
         document.getElementById('nucleotides-per-window').value = window.cgat.nucleoditesPerWindow;
      },
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
      document.title = 'Annotate: ' + newName;
      setSubtitle(newName);
   });

   // Pay attention to changin the rc checkbox.
   document.getElementById('annotation-rc').addEventListener('change', function() {
      window.cgat.reverseComplement = document.getElementById('annotation-rc').checked;
      updateDnaSelection(document.getElementById('dna-selection-draggable').offsetLeft);
   });
});

$(function() {
   $('#dna-selection-draggable').draggable({axis: 'x',
                                            containment: 'parent',
                                            stop: selectorStopped});
});

function fillRuler(length) {
   var tick = Math.floor(length / 10);
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
   // TODO(eriq): Only place delta
   placeExons();
}

function addExon(start, end) {
   createExonElement(start, end, window.cgat.exonKey);
   window.cgat.exons[window.cgat.exonKey] = {start: start, end: end};
   window.cgat.exonKey++;

   // TODO(eriq): Only place delta
   placeExons();
}

function addExonFromButton() {
   var start = document.getElementById('add-exon-start').value;
   var end = document.getElementById('add-exon-end').value;

   // Validate that start < end
   if (start >= end) {
      validationError('Start must be < End', 'add-exon-collapse-area');
      return;
   }
   clearValidationError('add-exon-collapse-area');

   addExon(start, end);
}

function createExonElement(start, end, key) {
   var exonElement = document.createElement('div');
   exonElement.id = 'exon-' + key;
   exonElement.classList.add('exon');

   var exonElementString =
         "<span>Start: </span>" +
         "<input type='number' id='exon-start-" + key + "'" +
            " value=" + start +
            " onchange='updateExon(" + key + ");'/>" +
         "<span>End: </span>" +
         "<input type='number' id='exon-end-" + key + "'" +
            " value=" + end +
            " onchange='updateExon(" + key + ");'/>" +
         "<button onclick='removeExon(" + key + ");'>Remove Exon</button>";

   exonElement.innerHTML = exonElementString;
   document.getElementById('exons').appendChild(exonElement);
}

// TODO(eriq): Deal with start getting larger than end and visa-versa.
function updateExon(key) {
   window.cgat.exons[key].start =
         document.getElementById('exon-start-' + key).value;
   window.cgat.exons[key].end =
         document.getElementById('exon-end-' + key).value;
   // TODO(eriq): Only place delta
   placeExons();
}

// TODO(eriq): Exons should be validated earlier.
//  Also, the annotation start/end should be possiblty modified.
function placeExons() {
   // Clear all old exons.
   var oldNucleotides = document.getElementsByClassName('nucleotide');
   for (var i = 0; i < oldNucleotides.length; i++) {
      oldNucleotides[i].className =
         oldNucleotides[i].className.replace(/exon((Start)|(End))/, '');
   }

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
   }

   // Mark the exons on the top dna.
   // Clear the previous markers.
   $('.top-dna-exon-marker').remove();

   // TODO(eriq): Constant this and enfore in less
   var sizeRatio = document.getElementsByClassName('top-dna')[0].offsetWidth / window.cgat.dna.length;

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
      document.getElementsByClassName('top-dna')[0].appendChild(marker);
   }
}

// markPosition is meant to mark the first nucleotide in each line.
function createNucleotideDiv(nucleotide, position, markPosition) {
   var positionMarker = '';
   if (markPosition) {
      positionMarker = '<div class="line-position-marker">' + position + '</div>';
   }

   return "<div class='nucleotide nucleotide-" + nucleotide + "'" +
          " data-position='" + position + "'" +
          " onClick='nucleotideClicked(" + position + ");'" +
          " id='" + "nucleotide-" + position + "'>" +
          nucleotide +
          positionMarker +
          "</div>";
}

function selectorStopped(eventObj, uiObj) {
   updateDnaSelection(uiObj.position.left);
}

// TODO(eriq): Multiple dna viewers will break everything.
function updateDnaSelection(leftEdge) {
   var topDnaWidth = document.getElementsByClassName('top-dna')[0].offsetWidth;
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

   var sequenceDivs = [];
   var markPosition = false;
   for (var i = 0; i < sequence.length; i++) {
      // TODO(eriq): 50 is magic for number of nucleotides per line. Put it in constants.
      markPosition = (i % 50) === 0;
      sequenceDivs.push(createNucleotideDiv(sequence[i], start + i, markPosition));
   }
   document.getElementById('standard-sequence').innerHTML = sequenceDivs.join('');

   placeExons();
}
