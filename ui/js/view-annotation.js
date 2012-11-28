"use strict";

document.addEventListener('DOMContentLoaded', function() {
   enableLoadingModal('view-annotation');

   if (!window.params.id) {
      enableErrorModal("No Annotation Specified", 'view-annotation');
      return;
   }

   $.ajax({
      url: 'api/annotation',
      dataType: 'json',
      data: {id: window.params.id},
      error: function(jqXHR, textStatus, errorThrown) {
         enableErrorModal('Fetching Annotation', 'view-annotation');
      },
      success: function(data, textStatus, jqXHR) {
         if (!data.valid) {
            enableErrorModal('Invalid Annotation', 'view-annotation');
            return;
         }

         setSubtitle(data.annotation.isoform_name);

         // Place the annotation info
         var annotationInfo = '';
         annotationInfo += "<label>Gene Name: </label><span>" +
                           data.annotation.isoform_name + "</span><br />";
         annotationInfo += "<label>Reverse Complement: </label><span>" +
                           data.annotation.reverse_complement + "</span><br />";
         annotationInfo += "<label>Gene Start: </label><span>" +
                           data.annotation.start + "</span><br />";
         annotationInfo += "<label>Gene End: </label><span>" +
                           data.annotation.end + "</span><br />";
         if (data.annotation.meta.created) {
            annotationInfo += "<label>Created: </label><span>" +
                              formatEpochDate(data.annotation.meta.created.sec) +
                              "</span><br />";
         }
         if (data.annotation.meta.finished) {
            annotationInfo += "<label>Finished: </label><span>" +
                              formatEpochDate(data.annotation.meta.finished.sec) +
                              "</span><br />";
         }
         $('#annotation-info-area').html(annotationInfo);

         // Place the exons
         if (data.annotation.exons) {
            var exons = '';
            data.annotation.exons.forEach(function(exon) {
               exons += "<p>Begin: " + exon.start + ", End: " + exon.end + "</p>";
            });
            $('#exons-inset').html(exons);
         }

         // Place the contig info.
         var contigInfo = '';
         contigInfo += "<label>Contig Name: </label><span>" + data.contig.meta.name + "</span><br />";
         contigInfo += "<label>Difficulty: </label><span>" + data.contig.meta.difficulty + "</span><br />";
         contigInfo += "<label>Species: </label><span>" + data.contig.meta.species + "</span><br />";
         contigInfo += "<label>Source: </label><span>" + data.contig.meta.source + "</span><br />";
         contigInfo += "<label>Upload Date: </label><span>" + data.contig.meta.upload_date.sec + "</span><br />";
         contigInfo += "<label>Uploader: </label><span>" + data.contig.meta.uploader_name + "</span>";
         $('#contig-info-area').html(contigInfo);

         disableModal();
      }
   });
});
