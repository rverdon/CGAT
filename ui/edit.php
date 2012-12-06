<?php
   require_once('header.php');
   makeHeader('CGAT Make Help Entry', '',
              array(),
              array('edit.js'));
?>

<div id='content' class='top-level-area'>
   <h2>Create or Edit a Help Page</h2>
      Name:<br>
      <input type="text" name="name" id="name-field" value="" autofocus><br>
      Title: <br>
      <input type="text" name="title" id="title-field" value=""><br>
      HTML Content:<br>
      <textarea name="html" id="html-field" value="" style="width: 400px; height: 300px;"></textarea><br><br>
      <button id="save-button">Save</button>
      <button id="go-button">Go there now</button>
</div>

<?php
   require('footer.php');
?>
