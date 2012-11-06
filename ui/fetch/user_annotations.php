<?php
   header('Content-type: application/json');

   require_once '../functions.php';

   function genContig() {
      $contig = array();
      $contig['id'] = rand(0, 10000);
      $contig['name'] = randString(10);
      return $contig;
   }

   function genAnnotation() {
      $annotation = array();
      $annotation['id'] = rand(0, 10000);
      $annotation['contig'] = genContig();
      $annotation['name'] = randString(15);
      $annotation['lastModification'] = rand(1300000000, 1352168963);
      return $annotation;
   }

   // TEST user
   $user = array();
   $user['id'] = 1;
   $user['name'] = 'John';
   #$user['email'] = 'abc123poiuytrewq@gmail.com';
   $user['email'] = 'eriq.augustine@gmail.com';
   # TODO(eriq): This sucks. When we host somewhere on a default port, we can use our own image.
   $user['profilePic'] = getGravatar($user['email'], 200, 'http://i47.tinypic.com/wo26c.png');
   $user['notifications'] = array(genContig(), genContig());
   $user['recentAnnotations']= array(genAnnotation(), genAnnotation());
   $user['partialAnnotations'] = array(genAnnotation(), genAnnotation());

   echo json_encode($user);
?>
