/*
 Title: Where to put your files
 Date: 2012-02-07 20:26:33
 Tags: Files, Organizing, Folders
 Category: HowTo
 Sources:
   node-kickstart: http://semu.mp/node-kickstart.html
*/

Inside node-blog is a `public/` folder, all files within here will be available for public access at your website! Thanks to express.js with [node-kickstart](http://semu.mp/node-kickstart.html) configuration all LESS files located in `public/styles/` will be watched for changes and new minifies CSS files will be generated whenever needed. Future releases may include automated javascript cleanup as well, but you never know. It's done when it's done…

**Jade Templates** located in `views/`

**LESS Stylesheets** located in `public/styles/`

**Markdown Articles** stored in `markdown/`

Feel free to store your files whereever you want. Keep in mind all files below `public/` are public :)