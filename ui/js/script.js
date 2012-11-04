"use strict";

document.addEventListener('DOMContentLoaded', function () {
   window.cgat = {};
   window.cgat.exons = [];
   window.cgat.currentStandardExon = null;
   window.cgat.currentRCExon = null;
   window.cgat.selectionStart = 0;
   window.cgat.selectionEnd = 0;
   window.cgat.exonKey = 0;

   updateDnaSelection(0);
   var topDnas = document.getElementsByClassName('top-dna');
   var selector = null;
   for (var i = 0; i < topDnas.length; i++) {
      topDnas[i].addEventListener('click', function(mouseEvent) {
         updateDnaSelection(mouseEvent.offsetX);
         selector = document.getElementById('dna-selection-draggable');
         selector.style.left =
               mouseEvent.offsetX - Math.floor(selector.offsetWidth / 2);
      });
   }

   fillRuler(window.sampleDna.length);
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

// Get the reverse compliment of a sequence
// Will return undefined if the sequence is not valid (not upcase ATCG).
function reverseCompliment(sequence) {
   var rc = [];

   for (var i = sequence.length - 1; i >= 0; i--) {
      switch(sequence[i]) {
         case 'A':
            rc.push('T');
            break;
         case 'T':
            rc.push('A');
            break;
         case 'C':
            rc.push('G');
            break;
         case 'G':
            rc.push('C');
            break;
         default:
            return undefined;
      }
   }

   return rc.join('');
}

function toggleCollapse(buttonId, collapseAreaId) {
   var collapseButton = document.getElementById(buttonId);
   var collapseArea = document.getElementById(collapseAreaId);

   if (collapseButton.className.match(/collapse-on/)) {
      // Turn collapse off
      collapseButton.className = collapseButton.className.replace(/collapse-on/, '');
      collapseArea.className = collapseArea.className.replace(/collapse/, '');
   } else {
      // Turn collapse on
      collapseButton.classList.add('collapse-on');
      collapseArea.classList.add('collapse');
   }
}

function nucleotideClicked(position, reverseCompliment) {
   var currentExonKey = reverseCompliment ? 'currentRCExon' : 'currentStandardExon';
   var prefix = reverseCompliment ? 'rc-' : 'std-';

   if (window.cgat[currentExonKey]) {
      if (window.cgat[currentExonKey] === position) {
         window.cgat[currentExonKey] = null;
         document.getElementById(prefix + 'nucleotide-' + position).className =
               document.getElementById(prefix + 'nucleotide-' + position)
                  .className.replace(/selected-nucleotide/, '');
      } else {
         var start = Math.min(window.cgat[currentExonKey], position);
         var end = Math.max(window.cgat[currentExonKey], position);

         var selectedElement = document.getElementById(prefix + 'nucleotide-' + window.cgat[currentExonKey]);
         // Selected element may no longer be visible.
         if (selectedElement) {
            selectedElement.className = selectedElement.className.replace(/selected-nucleotide/, '');
         }

         addExon(start, end, reverseCompliment);
         window.cgat[currentExonKey] = null;
      }
   } else {
      window.cgat[currentExonKey] = position;
      document.getElementById(prefix + 'nucleotide-' + position).classList.add('selected-nucleotide');
   }
}

function removeExon(key) {
   delete window.cgat.exons[key];
   var removeExon = document.getElementById('exon-' + key);
   removeExon.parentElement.removeChild(removeExon);
   // TODO(eriq): Only place delta
   placeExons();
}

function addExon(start, end, reverseCompliment) {
   createExonElement(start, end, window.cgat.exonKey, reverseCompliment);
   window.cgat.exons[window.cgat.exonKey] = {start: start, end: end, rc: reverseCompliment};
   window.cgat.exonKey++;

   // TODO(eriq): Only place delta
   placeExons();
}

function addExonFromButton() {
   var reverseCompliment = document.getElementById('add-exon-rc').checked;
   var start = document.getElementById('add-exon-start').value;
   var end = document.getElementById('add-exon-end').value;

   addExon(start, end, reverseCompliment);
}

function createExonElement(start, end, key, reverseCompliment) {
   var checked = reverseCompliment ? 'checked' : '';
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
         "<span>Reverse Compliment: </span>" +
         "<input type='checkbox' id='exon-rc-" + key + "' " + checked +
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
   window.cgat.exons[key].rc =
         document.getElementById('exon-rc-' + key).checked;
   // TODO(eriq): Only place delta
   placeExons();
}

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
      var prefix = exon.rc ? 'rc-' : 'std-';

      if (exon.start >= window.cgat.selectionStart &&
          exon.start < window.cgat.selectionEnd) {
         document.getElementById(prefix + 'nucleotide-' + exon.start).classList.add('exonStart');
      }

      if (exon.end >= window.cgat.selectionStart &&
          exon.end < window.cgat.selectionEnd) {
         document.getElementById(prefix + 'nucleotide-' + exon.end).classList.add('exonEnd');
      }
   }

   // Mark the exons on the top dna.
   // Clear the previous markers.
   $('.top-dna-exon-marker').remove();

   // TODO(eriq): Constant this and enfore in less
   var sizeRatio = document.getElementsByClassName('top-dna')[0].offsetWidth / window.sampleDna.length;

   // Place the new ones.
   for (var exonKey in window.cgat.exons) {
      var exon = window.cgat.exons[exonKey];
      var topOffset = exon.rc ? '16' : '0';

      var marker = document.createElement('div');
      marker.className = 'top-dna-exon-marker';
      marker.style.top = '' + topOffset + 'px';
      marker.style.width = '' + Math.floor(sizeRatio * (exon.end - exon.start)) + 'px';
      marker.style.left = '' + Math.floor(exon.start * sizeRatio) + 'px';

      // TODO(eriq): Append all the kids at the same time.
      document.getElementsByClassName('top-dna')[0].appendChild(marker);
   }
}

function createNucleotideDiv(nucleotide, position, reverseCompliment) {
   var prefix = reverseCompliment ? 'rc-' : 'std-';

   return "<div class='nucleotide nucleotide-" + nucleotide + "'" +
          " data-position='" + position + "'" +
          " onClick='nucleotideClicked(" + position + ", " + reverseCompliment + ");'" +
          " id='" + prefix + "nucleotide-" + position + "'>" +
          nucleotide + "</div>";
}

function selectorStopped(eventObj, uiObj) {
   updateDnaSelection(uiObj.position.left);
}

// TODO(eriq): Multiple dna viewers will break everything.
function updateDnaSelection(leftEdge) {
   var topDnaWidth = document.getElementsByClassName('top-dna')[0].offsetWidth;
   var selectorWidth = document.getElementById('dna-selection-draggable').offsetWidth;

   var leftEdgePercent = leftEdge / topDnaWidth;
   // Number of neucliotides in a window.
   // TODO(eriq): Solidify size constants and use less to enforce them in js.
   // (selector size / top dna size) * total sequence length.
   var windowSize = Math.floor(selectorWidth / topDnaWidth * window.sampleDna.length);
   var start = Math.floor(leftEdgePercent * window.sampleDna.length);

   window.cgat.selectionStart = start;
   window.cgat.selectionEnd = start + windowSize;

   document.getElementById('debug-selection-x').innerHTML = leftEdge;
   document.getElementById('debug-selection-percent').innerHTML = leftEdgePercent * 100;

   var sequence = window.sampleDna.substring(start, start + windowSize);
   var rcSequence = reverseCompliment(sequence);

   var sequenceDivs = [];
   for (var i = 0; i < sequence.length; i++) {
      sequenceDivs.push(createNucleotideDiv(sequence[i], start + i, false));
   }
   document.getElementById('standard-sequence').innerHTML = sequenceDivs.join('');

   var rcDivs = [];
   for (var i = 0; i < rcSequence.length; i++) {
      rcDivs.push(createNucleotideDiv(rcSequence[i], start + i, true));
   }
   document.getElementById('rc-sequence').innerHTML = rcDivs.join('');

   placeExons();
}
