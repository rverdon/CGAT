"use strict";

/**
 * This should be the place to put core bio/chemistry utilities.
 * Ideally, this file should be able to be riped out and used as
 * a library for another project.
 */

window.bioConstants = {};
window.bioConstants.codons = {'TTT': 'PHE', 'TCT': 'SER', 'TAT': 'TYR', 'TGT': 'CYS', 'TTC': 'PHE',
                              'TCC': 'SER', 'TAC': 'TYR', 'TGC': 'CYS', 'TTA': 'LEU', 'TCA': 'SER',
                              'TAA': 'STOP', 'TGA': 'STOP', 'TTG': 'LEU', 'TCG': 'SER', 'TAG': 'STOP',
                              'TGG': 'TRP', 'CTT': 'LEU', 'CCT': 'PRO', 'CAT': 'HIS', 'CGT': 'ARG',
                              'CTC': 'LEU', 'CCC': 'PRO', 'CAC': 'HIS', 'CGC': 'ARG', 'CTA': 'LEU',
                              'CCA': 'PRO', 'CAA': 'GLN', 'CGA': 'ARG', 'CTG': 'LEU', 'CCG': 'PRO',
                              'CAG': 'GLN', 'CGG': 'ARG', 'ATT': 'ILE', 'ACT': 'THR', 'AAT': 'ASN',
                              'AGT': 'SER', 'ATC': 'ILE', 'ACC': 'THR', 'AAC': 'ASN', 'AGC': 'SER',
                              'ATA': 'ILE', 'ACA': 'THR', 'AAA': 'LYS', 'AGA': 'ARG', 'ATG': 'MET*',
                              'ACG': 'THR', 'AAG': 'LYS', 'AGG': 'ARG', 'GTT': 'VAL', 'GCT': 'ALA',
                              'GAT': 'ASP', 'GGT': 'GLY', 'GTC': 'VAL', 'GCC': 'ALA', 'GAC': 'ASP',
                              'GGC': 'GLY', 'GTA': 'VAL', 'GCA': 'ALA', 'GAA': 'GLU', 'GGA': 'GLY',
                              'GTG': 'VAL', 'GCG': 'ALA', 'GAG': 'GLU', 'GGG': 'GLY'};

// Get the reverse complement of a sequence
// Will return undefined if the sequence is not valid (not upcase ATCG).
function reverseComplement(sequence) {
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

// Use offest to specify your window (0, 1, and 2).
function codonTranslation(sequence, offset) {
   var codons = [];
   offset = offset || 0;

   for (var i = offset + 2; i < sequence.length; i += 3) {
      codons.push(getCodon(sequence[i - 2] + sequence[i - 1] + sequence[i]));
   }

   return codons;
}

// Get a codon give a nucleotide triplet (as a string).
function getCodon(triplet, test) {
   return window.bioConstants.codons[triplet];
}
