/*
 Title: Extending app.js
 Hidden: false
 Date: 2012-02-11 09:34:26
 Tags: Internal, Code, Node
 Category: Handling
 Sources:
   example.com: http://example.com 
*/

node-blog uses the default routing system from express.js, for easy setup the [node-kickstart](http://semu.mp/node-kickstart.html) framework is added as well. You can use all known express methods for adding routes like `.get()`, `.post()` or `.all()`. Last `*` route is called if no other route matched, insert your custom callbacks before this line!

    srv.all('*', function(req, res, next) {
      throw new NotFound;
    });
    
When adding custom sites, make sure to follow the node-blog structure for integrating your additions to the existing routing. You can set variables and HTTP meta information using single function calls, for example `mdb.setMeta('current', 'home')` for setting the current menu item…

    srv.all('/', function(req, res) {
      mdb.setMeta('url', mdb.getDefault('url'));
      mdb.setMeta('title', 'Home, node-blog');
      mdb.setMeta('current', 'home');
    
      return res.render('home', mdb.jadeData({list: mdb.getArticles()}, req));
    });
    
Internal handling of your markdown files is done with [node-markdownblog](http://github.com/semu/node-markdownblog), I'm using the core functions on an other site, so I needed to include it as a submodule.