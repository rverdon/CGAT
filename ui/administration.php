<?php
   require_once('header.php');
   makeHeader('CGAT', 'Administration',
              array('administration.css'),
              array('administration.js'));
?>

<div id='content' class='top-level-area'>

   <div id='join-group' class='second-level-area'>
      <h2 onclick='toggleCollapse("join-group-collapse-button", "join-group-area");'>
         <div class='collapse-button' id='join-group-collapse-button'></div>
         Join A Group
      </h2>
      <div id='join-group-area' class='collapsing-area'>
         <a name='join-group'></a>
         <select id='join-group-select'>
            <option value=''>Existing Groups</option>
         </select>
         <button id='join-group-button' onclick='joinGroup();'>Join Group</button>
      </div>
   </div>

   <div id='leave-group' class='second-level-area'>
      <h2 onclick='toggleCollapse("leave-group-collapse-button", "leave-group-area");'>
         <div class='collapse-button' id='leave-group-collapse-button'></div>
         Leave A Group
      </h2>
      <div id='leave-group-area' class='collapsing-area'>
         <a name='leave-group'></a>
         <select id='leave-group-select'>
            <option value=''>Joined Groups</option>
         </select>
         <button id='leave-group-button' onclick='leaveGroup();'>Leave Group</button>
      </div>
   </div>

   <div id='create-group' class='second-level-area'>
      <h2 onclick='toggleCollapse("create-group-collapse-button", "create-group-area");'>
         <div class='collapse-button' id='create-group-collapse-button'></div>
         Create A Group
      </h2>
      <div id='create-group-area' class='collapsing-area'>
         <a name='create-group'></a>
         <div class='input-align-kids-field'>
            <span id='create-group-name-span'>Group Name</span>
            <input type='text' id='create-group-name' />
         </div>

         <div class='input-align-kids-field'>
            <span id='create-group-description-span'>Group Description</span>
            <textarea id='create-group-description' /></textarea>
         </div>

         <button id='create-group-button' onclick='createGroup();'>Create Group</button>
      </div>
   </div>

   <div id='assign-task' class='second-level-area'>
      <h2 onclick='toggleCollapse("assign-task-collapse-button", "assign-task-area");'>
         <div class='collapse-button' id='assign-task-collapse-button'></div>
         Assign A Task
      </h2>
      <div id='assign-task-area' class='collapsing-area'>
         <a name='assign-task'></a>

         <div class='input-align-kids-field'>
            <span id='assign-task-description-span'>Task Description</span>
            <textarea class='assign-task-field' id='assign-task-description' /></textarea>
         </div>

         <div class='input-align-kids-field'>
            <span id='assign-task-contig-select-span'>Contig: </span>
            <select class='assign-task-field' id='assign-task-contig-select'>
               <option value=''>Available Contigs</option>
            </select>
         </div>

         <div class='input-align-kids-field'>
            <span id='assign-task-groups-span'>Groups</span>
            <select class='assign-task-field' id='assign-task-group-select' multiple="multiple">
               <option value=''>Available Groups</option>
            </select>
         </div>

         <div class='input-align-kids-field'>
            <span id='assign-task-end-date-span'>Date To Stop Notifying</span>
            <input type='date' class='assign-task-field' id='assign-task-end-date' />
         </div>

         <button id='assign-task-button' onclick='assignTask();'>Assign Task</button>
      </div>
   </div>

   <div id='upload-contig' class='second-level-area'>
      <h2 onclick='toggleCollapse("upload-contig-collapse-button", "upload-contig-area");'>
         <div class='collapse-button' id='upload-contig-collapse-button'></div>
         Upload A Contig
      </h2>
      <div id='upload-contig-area' class='collapsing-area'>
         <a name='upload-contig'></a>

         <input type="radio" name="method" value="fasta"  checked><span>FASTA</span>
         <input type="radio" name="method" value="manual"><span>Manual</span>

         <div id='upload-inset' class='second-level-inset'>
            <div class='method selected-method' id='fasta-method-area'>

               <div id='fasta-file-upload-area'>
                  <form id='fasta-file-upload-form' action='/api/parse_fasta' method='POST' enctype='multipart/form-data' >
                     <label>Choose a FASTA File: </label>
                     <input id="fasta-file-upload-input" name='file' type="file" />
                     <iframe id='fasta-file-upload-iframe' src=""></iframe>
                  </form>
               </div>

               <div>
                  <div id='fasta-method-seqence-area' class='method-seqence-area' >
                     <h2>Sequence</h2>
                     <textarea id='fasta-method-sequence' class='method-sequence'></textarea>
                  </div>

                  <div id='fasta-method-details' class='method-details'>
                     <div class='input-align-kids-field'>
                        <span>Name</span>
                        <input type='text' id='fasta-method-name' />
                     </div>

                     <div class='input-align-kids-field'>
                        <span>Source</span>
                        <input type='text' id='fasta-method-source' />
                     </div>

                     <div class='input-align-kids-field'>
                        <span>Species</span>
                        <input type='text' id='fasta-method-species' />
                     </div>

                     <div class='input-align-kids-field'>
                        <span>Difficulty</span>
                        <input type='number' id='fasta-method-difficulty' />
                     </div>

                     <button onclick='uploadFasta();'>Upload Contig</button>
                  </div>
               </div>
            </div>

            <div class='method' id='manual-method-area'>
               <div id='manual-method-seqence-area' class='method-seqence-area'>
                  <h2>Sequence</h2>
                  <textarea id='manual-method-sequence' class='method-sequence'></textarea>
               </div>

               <div id='manual-method-details' class='method-details'>
                  <div class='input-align-kids-field'>
                     <span>Name</span>
                     <input type='text' id='manual-method-name' />
                  </div>

                  <div class='input-align-kids-field'>
                     <span>Source</span>
                     <input type='text' id='manual-method-source' />
                  </div>

                  <div class='input-align-kids-field'>
                     <span>Species</span>
                     <input type='text' id='manual-method-species' />
                  </div>

                  <div class='input-align-kids-field'>
                     <span>Difficulty</span>
                     <input type='number' id='manual-method-difficulty' />
                  </div>

                  <button onclick='uploadManual();'>Upload Contig</button>
               </div>
            </div>
         </div>
      </div>
   </div>


</div>

<?php
   require('footer.php');
?>
