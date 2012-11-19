<?php
   require_once('header.php');
   makeHeader('CGAT', 'HOME');
?>

<div id='content' class='top-level-area'>
   <a href='/contig?id=000000000000000000000002'>View Contig</a>
   <br />
   <a href='/gene?name=gene1'>View Gene</a>
   <br />
   <a href='/view-annotation?id=000000000000000000000001'>View Annotation</a>
   <br />
   <a href='/profile?user=Bob'>View Profile</a>
   <br />
   <a href='/group?id=000000000000000000000004'>View Group</a>
</div>

<?php
   require('footer.php');
?>
