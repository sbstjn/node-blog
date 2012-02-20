/*
 Title: 2 Steps to get node-blog running
 Date: 2012-02-20 21:04:12
 Tags: Configuration, Usage, Example, HowTo
 Category: Usage
 Sources:
   example: http://node-blog.semu.mp
*/

Assuming you have already downloaded node-blog from GitHub and copied all files to your very special server for running node.js applications, there are just **two simple steps** to get node-blog running like available here.

### Installation

#### 1. Configure node-blog

Open `config.json` with your favorite text editor and configure node-blog

    {
      "host": "node-blog.semu.mp",
      "port": 80,
      "admin": {"username": "admin", "password": "loremipsumdolor"},
      "author": "Lorem Ipsum",
      "disqus": "loremipsum", // disqus username for comments
      "paths": {
        "articles": "markdown"}
    }
    
#### 2. Use NPM to install requirements

    $ > npm install

### Usage

After setting up the configuration and installing all needed packages with npm you have to start node-blog with `node app.js` and you are ready to go!

![node-blog](http://semu.mp/node-blog.jpg)