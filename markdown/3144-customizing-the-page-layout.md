/*
 Title: Customizing the Page Layout
 Date: 2012-02-07 20:26:03
 Tags: Layout, Design, Jade, Template, Files
 Category: Layout
 Sources:
   Jade Template Engine: http://jade-lang.com
*/

All HTML generating is done using the [Jade Template Engine](http://jade-lang.com). The basic layout is defined in `views/layout.jade`, in line 64 the needed content is inserted inside the layout. All Information about Jade can be found on [GitHub](http://github.com/visionmedia/jade), there are many examples available for simple loops and condition checks.

        
        #content!= body
        
At the moment there is no support for themes nor an editor for changing the layout. All editing have to be done with an editor. The `views/` folder contains a single file for each site: `home.jade`, `posts.jade`, `article.jade` and `about.jade`. The template for generating the RSS news feed is located in `feed.jade`, a separated folder for error messages exists as well.

    .container.error
      section#article
        .page-header
          h1 Error 404 
            small #{url}
        p.img
          img(src="http://semu.mp/screenshots/404.png")