/*
 Title: Configure node-blog
 Date: 2012-02-07 20:24:14
 Tags: Configuration, Blog
 Category: Configuration
 Sources:
   About node-blog: http://semu.mp/node-blog.html
   node-blog at GitHub: http://github.com/semu/node-blog
*/

Download the most recent [node-blog version from GitHub](http://), all code is releases under the terms of the [MIT License](http://). Feel free to modify everything as the way like it, send me [Pull Request on GitHub](http://) if you have created a nice feature or fixed some bugs!

![node-blog on github](/screenshots/github.jpeg)

All needed configuration to get node-blug running is done in `app.js`, make sure your settings for hostname and port match your needs and you are all good to go. Example markdown files containing this documentation are included so you can try node-blog in action out-of-the-box.

    var config = {
        'host': 'hazelno.de',
        'port': 8400,
        'admin': {'username': 'admin', 'password': 'loremipsum'},
        'author': 'John Doe',
        'paths': {
            'articles': __dirname + '/markdown'}
    };
    
After configuration you can easily start node-blog with `node app.js`, point your web browser to the given address and you should be welcomed by a nice group of cows. 

![node-blog](/screenshots/nodeblog.jpeg)

What else you might wanna know? What about…

 - [How to manage and compose articles?](/managing-and-composing-articles-3143.html)
 - [Customizing the page layput?](/customizing-the-page-layout-3144.html)
 - [Where to put your files?](/where-to-put-your-files-less-jade-css-images-3145.html)