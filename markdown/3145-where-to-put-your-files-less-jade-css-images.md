/*
 Title: Where to put your files
 Date: 2012-02-07 20:26:33
 Tags: Files, Organizing, Folders
 Category: HowTo
 Sources:
   node-kickstart: http://semu.mp/node-kickstart.html
*/

Inside node-blog is a `public/` folder included, all files in here will be available for public access! Thanks to [node-kickstart](http://semu.mp/node-kickstart.html) all LESS files saved in `public/styles/` will be watched for changes and new minifies CSS files will be generated whenever needed. Future releases may include minified javascript generation as well, but you never know. It's done when it's done…

**Jade Templates** in `views/`

**LESS Stylesheets** in `public/styles/`

**Markdown Articles** in `markdown/`

Feel free to store your files whereever you want. Keep in mind all files below `public/` are public :)