/*
 * node-markdownblog 1.0
 * http://semu.mp/node-markdownblog.html
 *
 * (c) 2012 Sebastian Müller <c@semu.mp>
 * MIT license 
 */

/**
 * Require needed modules and define variables
 **/
var fs = require('fs'),
crypto = require('crypto'),
y = require('yamlish'),
app = {
  'meta':         {}, 
  'path':         {'articles': null, 'pages': null},
  'files':        {'articles': [], 'pages': []},
  'data':         {'articles': {}, 'pages': {}, 'hidden': {}},
  'tags':         {}, 
  'default':      {}, 
  'mapping':      {}, 
  'md':           require('markdown').markdown, 
  'admin':        [], 
  'maxID':        3141}, 
dummyArticle = "/*\n Title: {newTitle}\n Hidden: true\n Date: {newDate}\n Tags: Example\n Category: Example\n Sources:\n   example.com: http://example.com \n*/\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas orci nibh, convallis ac venenatis at, aliquet eget neque. Nulla tortor nulla, varius quis ultricies sit amet, posuere nec velit. In hac habitasse platea dictumst. Suspendisse a nulla lacus, dignissim dignissim felis. Morbi ut dui lacus. Sed aliquet tristique malesuada. Morbi sit amet neque eu nunc fringilla sollicitudin. Quisque condimentum arcu non odio pulvinar eget placerat mauris auctor. Quisque quam nulla, vestibulum vitae tincidunt eu, lacinia eget metus. Nam commodo cursus facilisis. Nam convallis porta orci, in sodales erat vestibulum quis.";
exports = module.exports = app;

/** 
 * Set general meta information
 * @param string name
 * @param mixed value
 **/
exports.setMeta = function(name, value) { this.meta[name] = value; };

/**
 * Count words 
 * @param string s
 * @return intenger 
 **/
var countWords = function(s) { return !s ? 0 : (s.split(/^\s+$/).length === 2 ? 0 : 2 + s.split(/\s+/).length - s.split(/^\s+/).length - s.split(/\s+$/).length); };

/**
 * Calculate time to read
 * @param integer words
 * @return intenger 
 **/
var timeToRead = function(words) { return {'min': Math.floor(words / 200), 'sec': Math.floor(words % 200 / (200 / 60))}; };

/** 
 * Set default information
 * @param string name
 * @param mixed value
 **/
exports.setDefault = function(key, value) { this.default[key] = value; };

/** 
 * Get default information
 * @param string key
 * @return mixed
 **/
exports.getDefault = function(key) { return this.default[key]; };

/** 
 * Add admin login
 * @param object user
 **/
exports.addLogin = function(user) { app.admin.push(user); };

/** 
 * Get current session
 * @return object
 **/
exports.getSession = function() { return {'valid': app.userIsAdmin, 'maxID': this.maxID+1}; };

/**
 * Check given login and run callback
 * @param string name
 * @param string password
 * @param function callback
 */
exports.checkLogin = function(name, password, callback) {
  var item = {'username': name, 'password': password};
  var found = null;
  for (var i = 0; i < app.admin.length; i++) {
    var cur = app.admin[i];
    if (cur.username == item.username && cur.password == item.password) {
      found = true; continue; }
  }
  return callback(!found);
};

/**
 * Update article file
 * @param integer id 
 * @param string content
 **/
exports.updateArticle = function(id, data) {
  if (this.data.hidden[id]) {
    var curItem = this.data.hidden[id]; } 
  else {
    var curItem = this.data.articles[id]; }
  
  var curFile = this.path.articles + '/' + curItem.file

  var fd = fs.openSync(curFile, 'w+', 0666);
  fs.writeSync(fd, data);
  fs.closeSync(fd);
  
  this.index(this.path.articles);
};

/**
 * Create new article
 * @param string name
 * @return string article url
 **/
exports.createNewArticle = function(name) {
  if (!name) {
    return null; }

  var slug = this.toSlug(name);
  if (slug == '' || slug == '-') {
    return null; }      
  var curID = (app.maxID+1);
    
  if (this.data.articles[curID]) {
    return null; }
    
  app.maxID++;
  var now = new Date();    
  var newName = slug + '-' + curID;
  var newFile = this.path.articles + '/' + curID + '-' + slug + '.md';
  var newContent = dummyArticle.replace('{newTitle}', name).replace('{newDate}', now.format("isoDateTime").replace('T', ' '));

  var fd = fs.openSync(newFile, 'w+', 0666);
  fs.writeSync(fd, newContent);
  fs.closeSync(fd);
  this.index(this.path.articles);
    
  return newName;
};

/**
 * Merge data with needed framework information for jade rendering
 * @param array data
 * @return array
 **/
exports.jadeData = function(data, req) {
  data['session'] = {'valid': req.isAdmin, 'maxID': this.maxID+1};
  data['meta'] = this.meta;
  
  return data;
};

/**
 * Scan filesystem for article
 * @param integer id
 * @return object
 **/
exports.scanForArticleID = function(id) {
  var articleList = fs.readdirSync(this.path.articles).sort();
  var file = null;
  for (var i = 0; i < articleList.length; i++) {
    if (articleList[i].indexOf(id + '-') == 0) {
      file = articleList[i];
    }
  }
  
  if (file == null) {
    return null; }
    
  var article = this.parseFile(file);

  article.html = this.markdownToHTML(article.content);
  article.markdown = article.content;
  article.words = countWords(article.content);
  article.readtime = timeToRead(article.words);
  article.excerpt = article.html.split('</p>')[0] + '</p>';
  article.excerptClean = strip_tags(article.excerpt);
    
  delete article.content;
    
  return article;
};

/**
 * Initialize data structure 
 * @param string dir directory for articles
 **/
exports.index = function(dir) {
  this.path.articles = dir;
  this.data.articles = {};
  this.data.pages = {};
  this.data.hidden = {};
  this.tags = [];
  this.files.articles = fs.readdirSync(this.path.articles).sort();
  this.processArticles();
};

/**
 * Initialize pages data structure
 * @param string dir directory for articles
 */
exports.pages = function(dir) {
  this.path.pages = dir;
  this.files.pages = fs.readdirSync(this.path.pages).sort();
  this.processPages();
};

/**
 * Create slug from string
 * @param string str
 * @return string
 **/
var toSlug = function(str) {
  str = str.replace(/^\s+|\s+$/g, '');
  str = str.toLowerCase();
  
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) { 
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i)); }

  return str.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}; exports.toSlug = toSlug;

/**
 * Parse file 
 * @param string b filename
 **/
exports.parseFile = function(b) {
  var c=(fs.readFileSync(this.path.articles+'/'+b)+'').split('*/'),d=c[0].substr(3),e=c[1],f=y.decode(d),g=[],h=f.Sources||{};
  var name=(/Title:(.*)/.exec(d)[1]+'').replace('Title:','').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  var i=b.split('-'),j=i.shift(),k=i.join('-').replace('.md','')+'-'+j+'.html',l=f.Tags.split(', ').sort(), m=new Date(f.Date),o=[];
  for (var n in h) { g.push({'name': n, 'url': f.Sources[n]}); }
  for (var n=0;n<l.length;n++) { o.push({'name': l[n], 'url': toSlug(l[n])}); }

  return {
    'name': name,
    'id': j*1,
    'file': b,
    'hidden': f.Hidden,
    'category': f.Category+''===f.Category ? f.Category : this.default.category,
    'date': m,
    'md': (fs.readFileSync(this.path.articles+'/'+b)),
    'datestring': m.toISOString().split('T')[0],
    'hash': crypto.createHash('md5').update(name).digest("hex").substr(8, 6),
    'url': this.default.url+'/'+k,
    'tags': o,
    'sources': g,
    'content': c[1]};
};

/**
 * Parse pages files
 * @param string b filename
 **/
exports.parseFilePage = function(b) {
  var c=(fs.readFileSync(this.path.pages+'/'+b)+'').split('*/'),d=c[0].substr(3),e=c[1],f=y.decode(d),g=[],h=f.Sources||{};
  var name=(/Title:(.*)/.exec(d)[1]+'').replace('Title:','').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  var url=(/URL:(.*)/.exec(d)[1]+'').replace('URL:','').replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  if (d.indexOf('Github')>0){
    var github=(/Github:(.*)/.exec(d)[1]+'').replace('Github:','').replace(/^\s\s*/, '').replace(/\s\s*$/, ''); }
    else { var github = false; }
  var i=b.split('-'),j=i.shift(),k=i.join('-').replace('.md','')+'-'+j+'.html', m=new Date(f.Date),o=[];
  for (var n in h) { g.push({'name': n, 'url': f.Sources[n]}); }
  
  return {
    'name': name,
    'date': m,
    'github': github,
    'datestring': m.toISOString().split('T')[0],
    'url': '/'+url+'.html',
    'content': c[1]};
};

/**
 * Get article
 * @param integer id
 * @param boolean showPreview include hidden files
 * @return object
 **/
exports.getArticle = function(id, showPreview) {
  if (showPreview == true && this.data.hidden[id]) {
    return this.data.hidden[id]; }
  if (!this.data.articles[id] || this.data.articles[id].hidden == true) {
    return null; }
  else {
    return this.data.articles[id]; }
};

/**
 * Get drafts
 * @return array
 **/
exports.getDrafts = function() {
  var data = [];
  for (var n in this.data.hidden) {
    if (!this.data.hidden[n].url || this.data.hidden[n].url == '') {
      continue; }
      
    data.push({'id': n, 'name': this.data.hidden[n].name, 'url': this.data.hidden[n].url, 'date': this.data.hidden[n].date});
  };
  
  return data.reverse();
};

/**
 * Get articles
 * @return array
 **/
exports.getArticles = function() {
  var data = [];
  for (var n in this.data.articles) {
    if (this.data.articles[n] && (!this.data.articles[n].hidden || this.data.articles[n].hidden == false)) {
      data.push(this.data.articles[n]); } }
  return data.reverse();
};

/**
 * Get articles by tag
 * @param string $tap
 * @return array
 **/
exports.getArticlesByTag = function(tag) {
  return this.tags[tag];
};

/**
 * Parse markdown to HTML
 * @param string data
 * @return string
 **/
exports.markdownToHTML = function(data) {
  data = this.md.toHTML(data).replace(/<pre><code>/gi, '<pre>').replace(/<\/code><\/pre>/gi, '</pre>');
  data = data.replace(/<pre>/gi, '<pre class="prettyprint">').replace(/<p><img/g, '<p class="img"><img');
  data = data.replace(/\[\-MORE\-\]/gi, '');
  return data;
};

/**
 * Process pages
 **/
exports.processPages = function() {
  for (a=this.files.pages.length;a--;) {
    var page = this.parseFilePage(this.files.pages[a]);
    this.pages[page.url] = page;
    this.pages[page.url].html = this.markdownToHTML(page.content);
    this.pages[page.url].markdown = page.content;
    this.pages[page.url].words = countWords(page.content);
    this.pages[page.url].readtime = timeToRead(this.pages[page.url].words);
    this.pages[page.url].excerpt = trim(this.pages[page.url].html.split('</img></p>')[0] + '</img></p>');
    this.pages[page.url].excerptClean = strip_tags(this.pages[page.url].excerpt);    
  }
};

/**
 * Process articles
 **/
exports.processArticles = function() {
  for (a=this.files.articles.length;a--;) {
    var article = this.parseFile(this.files.articles[a]);
    if (this.maxID < article.id) {
      this.maxID = article.id; }
    
    article.html          = this.markdownToHTML(article.content);
    article.markdown      = article.content;
    article.words         = countWords(article.content);
    article.readtime      = timeToRead(article.words);
    article.excerpt       = article.html.split('</p>')[0] + '</p>';
    article.excerptClean  = strip_tags(article.excerpt);
    
    if (article.hidden) {
      this.data.hidden[article.id] = article; } 
    else {
      this.data.articles[article.id] = article;
          
      for (var i=0;i<article.tags.length;i++) { 
        var t=article.tags[i].url; 
        if (!this.tags[t]) { 
          this.tags[t]=[]; } 
        this.tags[t].push(article); }

      this.mapping[article.id]=article.file; 
    }
  }
};

/**
 * Get Tag cloud
 * @param integer max maximum font size
 * @param integer min minimum font size 
 * @return object
 **/
exports.getTagCloud = function(max, min) {
  var data = {}, numbers = [];
  for (var n in this.tags) {
    if (typeof(this.tags[n]) == 'function') {
      continue; }  
    data[n] = this.tags[n].length;
    numbers.push(data[n]);
  }
  
  var maxqty = numbers.max();
  var minqty = numbers.min();
  var spread = maxqty - minqty;
  if (spread == 0) {
    spread = 1; }
  var step = (max - min) / spread;
  var sizes = {};
  
  for (var n in data) {
    var cur = data[n];
    sizes[n] = Math.round(min + ((cur - minqty) * step));
  }

  return sizes;
};

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */
 var dateFormat = function () {
  var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
    timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
    timezoneClip = /[^-+\dA-Z]/g,
    pad = function (val, len) {
      val = String(val);
      len = len || 2;
      while (val.length < len) val = "0" + val;
      return val;
    };

  // Regexes and supporting functions are cached through closure
  return function (date, mask, utc) {
    var dF = dateFormat;

    // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
    if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
      mask = date;
      date = undefined;
    }

    // Passing date through Date applies Date.parse, if necessary
    date = date ? new Date(date) : new Date;
    if (isNaN(date)) throw SyntaxError("invalid date");

    mask = String(dF.masks[mask] || mask || dF.masks["default"]);

    // Allow setting the utc argument via the mask
    if (mask.slice(0, 4) == "UTC:") {
      mask = mask.slice(4);
      utc = true;
    }

    var _ = utc ? "getUTC" : "get",
      d = date[_ + "Date"](),
      D = date[_ + "Day"](),
      m = date[_ + "Month"](),
      y = date[_ + "FullYear"](),
      H = date[_ + "Hours"](),
      M = date[_ + "Minutes"](),
      s = date[_ + "Seconds"](),
      L = date[_ + "Milliseconds"](),
      o = utc ? 0 : date.getTimezoneOffset(),
      flags = {
        d:    d,
        dd:   pad(d),
        ddd:  dF.i18n.dayNames[D],
        dddd: dF.i18n.dayNames[D + 7],
        m:    m + 1,
        mm:   pad(m + 1),
        mmm:  dF.i18n.monthNames[m],
        mmmm: dF.i18n.monthNames[m + 12],
        yy:   String(y).slice(2),
        yyyy: y,
        h:    H % 12 || 12,
        hh:   pad(H % 12 || 12),
        H:    H,
        HH:   pad(H),
        M:    M,
        MM:   pad(M),
        s:    s,
        ss:   pad(s),
        l:    pad(L, 3),
        L:    pad(L > 99 ? Math.round(L / 10) : L),
        t:    H < 12 ? "a"  : "p",
        tt:   H < 12 ? "am" : "pm",
        T:    H < 12 ? "A"  : "P",
        TT:   H < 12 ? "AM" : "PM",
        Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
        o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
        S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
      };

    return mask.replace(token, function ($0) {
      return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
    });
  };
}();

// Some common format strings
dateFormat.masks = {
  "default":      "ddd mmm dd yyyy HH:MM:ss",
  shortDate:      "m/d/yy",
  mediumDate:     "mmm d, yyyy",
  longDate:       "mmmm d, yyyy",
  fullDate:       "dddd, mmmm d, yyyy",
  shortTime:      "h:MM TT",
  mediumTime:     "h:MM:ss TT",
  longTime:       "h:MM:ss TT Z",
  isoDate:        "yyyy-mm-dd",
  isoTime:        "HH:MM:ss",
  isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
  isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
  dayNames: [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ],
  monthNames: [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
  ]
};

/**
 * Add format() function to Dates
 **/
Date.prototype.format = function (mask, utc) { return dateFormat(this, mask, utc); };

/**
 * Add min() and max() functions to Arrays
 **/
Array.prototype.max = function() { return Math.max.apply(null, this) };
Array.prototype.min = function() { return Math.min.apply(null, this) };

/** 
 * Trim stringt
 * @param string str
 * @return strin
 **/
function trim(str) { return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '').replace(/ +(?= )/g,''); }

/**
 * Strip HTML tags from string
 * @param string input
 * @param string allowed
 * @return string
 **/
function strip_tags (input, allowed) {
  // https://raw.github.com/kvz/phpjs/master/functions/strings/strip_tags.js
  allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
  var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
  return input.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
    return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
  });
}