/**
 * Load markdownblog framework for data handling
 * Load config JSON file
 **/
var mdb = require('node-markdownblog');
var config = JSON.parse(require('fs').readFileSync(__dirname + '/config.json','utf8'));

/**
 * Set default category and set default URL
 **/
mdb.setDefault('category', 'General');
mdb.setDefault('url', 'http://' + config.host + (config.port == '80' ? '' : ':' + config.port));

/**
 * Set basic variables passed to jade template
 **/
 
mdb.setMeta('site', config.host); 
mdb.setMeta('url', 'http://' + config.host);
mdb.setMeta('author', config.author);
mdb.setMeta('disqus', config.disqus);

/**
 * Add admin login
 **/
mdb.addLogin(config.admin);

/**
 * Index markdown folder
 **/
mdb.index(__dirname + '/' + config.paths.articles);
/**
 * Start express.js http servr with kickstart (more: http://semu.mp/node-kickstart.html)
 **/
var kickstart = require('kickstart').withConfig({'name': config.host, 'port': config.port, 'path': __dirname});
var srv = kickstart.srv();

/**
 * Set error handling
 **/
srv.error(function(err, req, res, next){
  if (err instanceof NotFound) {
    mdb.setMeta('url', mdb.getDefault('url') + req.url);
    mdb.setMeta('title', '404 Not Found');
      
    res.statusCode = 404;
    res.render('errors/404', mdb.jadeData({url: req.url}, req)); } 
  else {
    next(err); }
});

/**
 * Check session data
 **/
srv.all('*', function(req, res, next) {
  if (req.session && req.session.valid) {
    req.isAdmin = true; } else { req.isAdmin = false; }
  next();
});

/**
 * Callback for creating new articles
 **/
srv.all('/api/new', function(req, res) {
  var newName = null;
  if (req.session && req.body.name && (newName = mdb.createNewArticle(req.body.name)) != null) {
    return res.end(newName); } 
  else {
    return res.end('0'); }
});

/**
 * Callback for creating new articles
 **/
srv.all('/api/drafts', function(req, res) {
  var newName = null;
  if (req.session) {
    return res.end(JSON.stringify(mdb.getDrafts())); } 
  else {
    return res.end('0'); }
});

/**
 * Callback for authenticating user session
 **/
srv.post('/api/auth', function(req, res) {
  mdb.checkLogin(req.body.name, req.body.password, function(err) {
    if (err) {
      if (req.session) {
      	req.isAdmin = false;
        delete req.session; }
      res.end('0'); }
    else {
      req.session.valid = true;
      res.end('1'); }
  });
});

/**
 * Display all posts available
 * @example http://semu.mp/posts
 **/
srv.all('/posts', function(req, res) {
  mdb.setMeta('url', mdb.getDefault('url') + req.url);
  mdb.setMeta('title', 'Articles');
  mdb.setMeta('headline', 'Recent Articles');
  mdb.setMeta('current', 'posts');  

  res.render('posts', mdb.jadeData({list: mdb.getArticles(), tags: mdb.getTagCloud(30, 14)}, req));
});

/**
 * Display single blog post
 * @example http://semu.mp/neues-layout-und-so-3158.html
 **/
srv.all(/([A-Za-z0-9\-]+\-([0-9]+)\.html)/, function(req, res) {
  var updateData = req.param('data', null);
  var hasSession = req.session.valid;
  if (updateData && hasSession) {
    mdb.updateArticle(req.params[1], updateData); }
  
  var item = mdb.getArticle([req.params[1]], hasSession);
  if (!item) {
    throw new NotFound; }
  if (item.url != mdb.getDefault('url') + req.url) {
    return res.redirect(item.url, 301); }
    
	mdb.setMeta('url', item.url);
	mdb.setMeta('title', item.name);
	mdb.setMeta('headline', item.name);	
	mdb.setMeta('current', 'posts');
	
  res.render('article', mdb.jadeData({article: item, auth: req.session.valid}, req));
});

/**
 * Display articles by tag
 * @example http://semu.mp/tag/node.html
 **/
srv.all(/\/tag\/([A-Za-z0-9\-]+\.html)/, function(req, res) {
	var articles = mdb.getArticlesByTag(req.params[0].replace('.html','').toLowerCase().replace(/[^a-z0-9-]/g, '-')) || [];
  mdb.setMeta('url', mdb.getDefault('url') + req.url);
  mdb.setMeta('title', 'Tag: ' + req.params[0].replace('.html',''));
  mdb.setMeta('headline', 'Tagged with ' + req.params[0].replace('.html',''));  
  mdb.setMeta('current', 'posts');
	
  res.render('posts', mdb.jadeData({tags: mdb.getTagCloud(30, 14), list: articles}, req));
});

/**
 * Display about
 * @example http://semu.mp/about
 */
srv.all('/about', function(req, res) {
  mdb.setMeta('url', mdb.getDefault('url') + req.url);
	mdb.setMeta('title', 'About');
	
  res.render('about', mdb.jadeData({}, req));
});

/**
 * Display Index
 * @example http://semu.mp/ 
 **/
srv.all('/', function(req, res) {
	mdb.setMeta('url', mdb.getDefault('url'));
	mdb.setMeta('title', 'Home, node-blog');
  mdb.setMeta('current', 'home');

  return res.render('home', mdb.jadeData({list: mdb.getArticles()}, req));
});

/**
 * Export RSS Feed
 * @example http://semu.mp/feed 
 **/
srv.all('/feed', function(req, res) {
  return res.render('feed', mdb.jadeData({url: mdb.getDefault('url') + req.url, layout: false, list: mdb.getArticles()}, req));
});

/**
 * Display single page or throw errors
 **/
srv.all('*', function(req, res, next) {
  throw new NotFound;
});

/**
 * FileNotFound Exception
 * @param string msg
 **/
function NotFound(msg) {
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
} NotFound.prototype.__proto__ = Error.prototype;

/**
 * Trim strings
 * @param string str
 * @return array
 */
function trim(str) { return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/ +(?= )/g,''); }

/**
 *
 * Start node-blog
 *
 **/
var router = kickstart.listen();
console.log("Listening on http://%s:%d", kickstart.conf().name, router.address().port);