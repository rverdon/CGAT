<html>
   <head>
      <link rel='stylesheet' type='text/css' media='screen' href='style/style.css' />
      <link rel='stylesheet' type='text/css' media='screen' href='style/annotation.css' />
      <link rel='stylesheet' href='style/jquery-ui.css' />

      <script src='js/jquery-1.8.2.js'></script>
      <script src='js/jquery-ui.js'></script>

      <script src='js/script.js' type='text/javascript'></script>
      <script src='js/annotation.js' type='text/javascript'></script>
   </head>
   <body>

      <div id='page'>
         <div id='header' class='top-level-area'>
            <a class='logo-link' href='/'>
               <img src='images/logo.png' alt='GCAT'>
               </img>
            </a>
            <div id='top-nav' class='nav'>
               <ul>
                  <li><a href='login.php'>Login</a> / <a href='register.php'>Register</a></li>
                  <li><a href='#'>Something</a></li>
                  <li><a href='#'>Something Else</a></li>
                  <li><a href='#'>Another Thing</a></li>
               </ul>
            </div>
         </div>
         <div id='content' class='top-level-area'>
            <div class='dna-viewer'>
               <div class='second-level-area'>
                  <div class='dna-ruler'>
                  </div>
                  <div class='top-dna'>
                     <div id='dna-selection-draggable' class='draggable ui-widget-content'>
                     </div>
                  </div>
                  <div id='debug-selection-coordinates' class='debug'>
                     <span>X: </span><span id='debug-selection-x'>0</span>
                     <span>%: </span><span id='debug-selection-percent'>0</span>
                  </div>
               </div>
               <div class='dna-closeups'>
                  <div class='closeup-dna'>
                     <div class='second-level-area'>
                        <h2 onclick='toggleCollapse("standard-collapse-button", "standard-sequence");'>Sequence <div class='collapse-button' id='standard-collapse-button'></div></h2>
                        <div id='standard-sequence' class='sequence-closeup'>
                        </div>
                     </div>
                     <div class='second-level-area'>
                        <h2 onclick='toggleCollapse("rc-collapse-button", "rc-sequence");'>Reverse Compliment <div class='collapse-button collapse-on' id='rc-collapse-button'></div></h2>
                        <div id='rc-sequence' class='sequence-closeup collapse'>
                        </div>
                     </div>
                  </div>
               </div>
            </div><!-- dna-viewer -->
            <div id='add-exon-area' class='second-level-area'>
               <h2 onclick='toggleCollapse("add-exon-collapse-button", "add-exon-collapse-area");'>Add Exon <div class='collapse-button' id='add-exon-collapse-button'></div></h2>
               <div id='add-exon-collapse-area'>
                  <span>Start: </span>
                  <input type='number' id='add-exon-start' value=0 />
                  <span>End: </span>
                  <input type='number' id='add-exon-end' value=0 />
                  <span>Reverse Compliment: </span>
                  <input type='checkbox' id='add-exon-rc' \>
                  <button onclick='addExonFromButton();'>Add Exon</button>
               </div>
            </div>
            <div id='exon-area' class='second-level-area'>
               <h2 onclick='toggleCollapse("exons-collapse-button", "exons");'>Exons <div class='collapse-button' id='exons-collapse-button'></div></h2>
               <div id='exons'>
               </div>
            </div>
         </div>
         <div id='footer' class='top-level-area'>
            <div id='bottom-nav' class='nav'>
               <ul>
                  <li><a href='/'>Home</a></li>
                  <li><a href='#'>Thing 1</a></li>
                  <li><a href='#'>Thing 2</a></li>
                  <li><a href='#'>Thing 3</a></li>
               </ul>
            </div>
            <div id='colophon'>
               <p>Coptright 2012 Cal Poly</p>
            </div>
         </div>
      </div>

   </body>
</html>
