<?php session_start() ?>

<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <link rel='stylesheet' type='text/css' media='screen' href='style/upload.css' />
      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/script.js' type='text/javascript'></script>
      <script src='js/upload.js' type='text/javascript'></script>
      <title>CGAT Upload Contig</title>
   </head>
   <body>
      <div id='page'>
         <?php
            $title = 'Upload Contig';
            require('header.php');
         ?>

         <div id='content' class='top-level-area'>

            <h1>Upload a Contig</h1>
            <p>This page will be for uploading contigs</p>
            <p>You will also be able to assign a task right after an upload</p>
            <p>Maybe this page, or maybe a link straight to the assign page with fields filled in</p>

            <div id='options' class='second-level-area'>
               <h2 onclick='toggleCollapse("options-collapse-button", "options-area");'>
                  <div class='collapse-button' id='options-collapse-button'></div>
                  Options
               </h2>
               <div id='options-area' class='collapsing-area'></div>
            </div>

            <div id='choose' class='second-level-area'>
               <h2 onclick='toggleCollapse("choose-collapse-button", "choose-area");'>
                  <div class='collapse-button' id='choose-collapse-button'></div>
                  Choose Contig
               </h2>
               <div id='choose-area' class='collapsing-area'>
                  <div id='contig-method-radio'>
                     <input type="radio" name="method" value="fasta"  checked><span>FASTA</span>
                     <input type="radio" name="method" value="manual"><span>Manual</span>
                     <input type="radio" name="method" value="previous"><span>Previously Uploaded</span>

                     <div id='method-area' class='second-level-inset'>
                        <div id='fasta-method-area' class='method selected-method'>
                           FASTA
                        </div>

                        <div id='manual-method-area' class='method'>
                           <div id='manual-sequence-area'>
                              <textarea id='manual-method-sequence' placeholder='Forward Sequence'></textarea>
                           </div>
                           <div id='manual-data-area'>
                              <!-- TODO(eriq): These are crazy time. Find out real values for them, -->
                              <span>Contig Name: </span>
                              <input type='text' id='manual-method-contig-name' />
                              <br />

                              <span>Species: </span>
                              <input type='text' id='manual-method-species' />
                              <br />

                              <span>Somethig: </span>
                              <input type='text' id='manual-method-something' />
                              <br />

                              <span>Source: </span>
                              <select id='manual-method-source'>
                                 <option value="unknown">Unknown</option>
                                 <option value="flybase">Flybase</option>
                                 <option value="somewhere">Somewhere</option>
                                 <option value="else">Somewhere Else</option>
                              </select>
                           </div>
                        </div>

                        <div id='previous-method-area' class='method'>
                           PREVIOUS
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
         </div>

         <?php
            require('footer.php');
         ?>
      </div>
   </body>
</html>
