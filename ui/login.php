<?php
   require_once('header.php');
   makeHeader('CGAT', 'Login / Register',
              array('login.css'),
              array('login.js', 'sha256.js'));
?>

<div id='content' class='top-level-area'>

   <div id='login' class='second-level-area'>
      <h2 onclick='toggleCollapse("login-collapse-button", "login-area");'>
         <div class='collapse-button' id='login-collapse-button'></div>
         Login
      </h2>
      <div id='login-area' class='collapsing-area'>
         <div id='login-username-area' class='login-register-field input-align-kids-field'>
            <span id='login-username-span'>Username: </span>
            <input type='text' id='login-username' class='login-field' autofocus />
         </div>

         <div id='login-password-area' class='login-register-field input-align-kids-field'>
            <span>Password: </span>
            <input type='password' class='login-field' id='login-password' />
         </div>

         <button onclick='login();'>Login</button>
      </div>
   </div>

   <div id='register' class='second-level-area'>
      <h2 onclick='toggleCollapse("register-collapse-button", "register-area");'>
         <div class='collapse-button collapse-on' id='register-collapse-button'></div>
         Register A New Account
      </h2>
      <div id='register-area' class='collapsing-area collapse'>
         <div class='login-register-field input-align-kids-field'>
            <span>Username: </span>
            <input type='text' id='register-username' class='register-field' />
         </div>

         <div class='login-register-field input-align-kids-field'>
            <span>First Name: </span>
            <input type='text' id='register-firstname' class='register-field' />
         </div>

         <div class='login-register-field input-align-kids-field'>
            <span>Last Name: </span>
            <input type='text' id='register-lastname' class='register-field' />
         </div>

         <div class='login-register-field input-align-kids-field'>
            <span>Email: </span>
            <input type='text' id='register-email' class='register-field' />
         </div>

         <div class='login-register-field input-align-kids-field'>
            <span>Password: </span>
            <input type='password' class='register-field' id='register-password' />
         </div>

         <button onclick='register();'>Register</button>
      </div>
   </div>

</div>

<?php
   require('footer.php');
?>
