[node-blog](http://semu.mp/node-blog.html) is a basic blog written in Node.js with nice inline composing and markdown storage. All writing is done within your web browser using the [ace editor](http://ace.ajax.org/), published articles as well as drafts are stored as [markdown](http://daringfireball.net/projects/markdown/) files on your server.

![node-blog](http://cdn.sbstjn.com/2014/10/node-blog.8e847030.png)

You can easily manage your personal site with node-blog, see [semu.mp](http://semu.mp) for a working example using [node-blog](http://semu.mp/node-blog.html). There is a nice tag cloud available, an RSS news feed for sure and comments with the help from [disqus](http://disqus.com/).

### Configuration

Please edit `config.json` for setting up your own node-blog. Please pay attention to the strict JSON syntax, you can validate your configuration with [JSONLint](http://jsonlint.com/) if you run into any problems!

    {
      "host": "example.com",
      "port": 8080,
      "admin": {"username": "admin", "password": "loremipsumdolorsitamet"},
      "author": "Lorem Ipsum",
      "disqus": "loremipsum",
      "paths": {
        "articles": "markdown"}
    }

### Using node-blog

After configuration is done just start node-blog with `node app.js` and point your web browser to the defined host and port. All needed information for customizing [node-blog](http://semu.mp/node-blog.html) and about composing articles can be found in the folder `markfiles/` or at your new node-blog…

### Article Format

    /*
     Title: Lorem Ipsum dolor sit amet
     Hidden: true
     Date: 2012-02-10 22:17:09
     Tags: Example
     Category: Example
     Sources:
       example.com: http://example.com 
    */

    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas orci nibh, convallis ac venenatis at, aliquet eget neque. Nulla tortor nulla, varius quis ultricies sit amet, posuere nec velit. In hac habitasse platea dictumst. Suspendisse a nulla lacus, dignissim dignissim felis. Morbi ut dui lacus. Sed aliquet tristique malesuada. Morbi sit amet neque eu nunc fringilla sollicitudin. Quisque condimentum arcu non odio pulvinar eget placerat mauris auctor. Quisque quam nulla, vestibulum vitae tincidunt eu, lacinia eget metus. Nam commodo cursus facilisis. Nam convallis porta orci, in sodales erat vestibulum quis.
    
### MIT License

Copyright (c) 2012 Sebastian Müller

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
