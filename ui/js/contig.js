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
         $('#contig-info-area').html(makeContig(data.info.contig));

         // Place all the normal and expert annotations.
         var annotations = '';
         var expertAnnotations = '';
         for (var geneName in data.info.expandedAnnotations) {
            for (var id in data.info.expandedAnnotations[geneName]) {
               var annotation = makeInlineAnnotation(data.info.expandedAnnotations[geneName][id]);

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
