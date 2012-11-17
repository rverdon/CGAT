"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('contig');

   if (!window.params.id) {
      enableErrorModal("No Contig Specified", 'contig');
      return;
   }

   window.cgat = {};
   window.cgat.contigId = '';

   $.ajax({
      url: 'api/contig',
      dataType: 'json',
      data: {id: window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Contig', 'contig');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Contig', 'contig');
            return;
         }

         setSubtitle(data.info.contig.meta.name);

         window.cgat.contigId = data.info.contig['_id']['$id'];

         // Place the contigs info.
         var contigInfo = '';
         contigInfo += "<label>Contig Name: </label><span>" + data.info.contig.meta.name + "</span><br />";
         contigInfo += "<label>Difficulty: </label><span>" + data.info.contig.meta.difficulty + "</span><br />";
         contigInfo += "<label>Species: </label><span>" + data.info.contig.meta.species + "</span><br />";
         contigInfo += "<label>Source: </label><span>" + data.info.contig.meta.source + "</span><br />";
         contigInfo += "<label>Upload Date: </label><span>" + data.info.contig.meta.upload_date.sec + "</span><br />";
         contigInfo += "<label>Uploader: </label><span>" + data.info.contig.meta.uploader_name + "</span>";
         $('#contig-info-area').html(contigInfo);

         // Place all the normal and expert annotations.
         var annotations = '';
         var expertAnnotations = '';
         for (var geneName in data.info.expandedAnnotations) {
            for (var id in data.info.expandedAnnotations[geneName]) {
               var numExons = data.info.expandedAnnotations[geneName][id].exons ?
                              data.info.expandedAnnotations[geneName][id].exons.length : 0;
               var annotation =
                     "<a href='/view-annotation?id=" + id + "'>Gene Name: " + geneName +
                     ", Number of Exons: " + numExons +
                     ", Expert: " + data.info.expandedAnnotations[geneName][id].expert +
                     ", Reverse Complement: " + data.info.expandedAnnotations[geneName][id].reverse_complement +
                     "</a>";

               annotations += annotation;
               if (data.info.expandedAnnotations[geneName][id].expert) {
                  expertAnnotations += annotation;
               }
            }
         }
         $('#annotations-inset').html(annotations);
         $('#expert-annotations-inset').html(expertAnnotations);

         // Place the associated genes.
         var genes = '';
         for (var geneName in data.info.expandedAnnotations) {
            genes += "<a href='/gene?name=" + geneName + "'>" + geneName + "</a>";
         }
         $('#genes-area').html(genes);

         disableModal();
      }
   });
});

function annotate() {
   enableLoadingModal('contig');
   $.ajax({
      url: 'api/create_annotation',
      type: 'POST',
      dataType: 'json',
      data: {contig: window.cgat.contigId},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorConfirmModal('Creating Annotation', 'contig');
         return;
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorConfirmModal('Creating Annotation', 'contig');
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
