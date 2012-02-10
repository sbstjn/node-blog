/*
 Title: Managing and Composing Articles
 Date: 2012-02-07 20:25:20
 Tags: HowTo, Composing, Blogging
 Category: Howto
 Sources: 
   Example Blog: http://semu.mp
*/

Please login with the username and password you have configured or use the default setting of `admin` as username and `loremipsum` for password. Hopefully you have changed the default settings, you should definitely do that before going live with your new site ;)

![node-blog composing article](/screenshots/compose.jpeg)

After having successfully logged in you can access the administration and view your unpublished drafts or create a new article. Every published articles has an `Edit` button on the top right if you are logged in. All markdown files follow a specific but simple schema and need to in`clude a basic header formatted in [YAML](http://).

    /*
     Title: Managing and Composing Articles
     Date: 2012-02-07 20:25:20
     Tags: HowTo, Composing, Blogging
     Category: Howto
     Sources: 
       Example Blog: http://semu.mp
    

After the strict header information you are free to start writing you articles using markdown. New articles already have a basic structure and all needed header fields. If you find any bugs in parsing markdown please create an issue at GitHub!