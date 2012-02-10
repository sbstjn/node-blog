var express = require("express");
var connect = require("connect");
var kickstart = {'conf' : {}, 'srv': {}};

/* Compress generated less files  
 * Thanks to Matt Sain - http://stackoverflow.com/a/8379561/713518 */
var less;
express.compiler.compilers.less.compile = function (str, fn) {
  if (!less) { 
    less = require("less"); }
    
  try {
    less.render(str, { compress : true }, fn); } 
  catch (err) {
    fn(err); }
};

exports.withConfig = function(conf) {
  conf.sessionSecret = conf.sessionSecret || 'lorem123';

  kickstart.conf = conf;
  kickstart.srv = express.createServer(
    /* Optional: Use SSL certificate */
    /* {   ca:     fs.readFileSync(conf.path + '/cert/ca.pem').toString(),
      , key:    fs.readFileSync(conf.path + '/cert/domain.key').toString(), 
      , cert:   fs.readFileSync(conf.path + '/cert/domain.crt').toString()},  */
    /* Optional: Use global db connection handler */
    /* function(req, res, next) { if (req.db === undefined) { req.db = db; } next(); } */);
  
  kickstart.srv.set('views', conf.path + '/views'); 
  kickstart.srv.set('view engine', 'jade');
  kickstart.srv.set('view cache', false);   
  
  kickstart.srv.configure(function() {     
    kickstart.srv.use(express.cookieParser());
    kickstart.srv.use(express.session({ secret: conf.sessionSecret  }));
    kickstart.srv.use(express.logger(':method :url - :referrer'));
    kickstart.srv.use(express.compiler({ src:conf.path + '/public', enable: ['less'] }));
    kickstart.srv.use(express.static(conf.path + '/public'));
    kickstart.srv.use(express.bodyParser());
  });
  
  kickstart.srv.configure('development', function(){
    kickstart.srv.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });
  
  kickstart.srv.configure('production', function(){
    kickstart.srv.use(express.errorHandler());
  });
  
  return this;
};

exports.listen = function() {
  var router = express.createServer(connect.vhost(kickstart.conf.name, kickstart.srv));
  router.use(express.cookieParser());
  router.use(express.session({ secret: kickstart.conf.sessionSecret }));
  router.listen(kickstart.conf.port);
  
  return router;
}

exports.srv = function() { return kickstart.srv; };
exports.conf = function() { return kickstart.conf; };
exports.get = function(path, callback) { kickstart.srv.get(path, callback); };
exports.post = function(path, callback) { kickstart.srv.post(path, callback); };
exports.all = function(path, callback) { kickstart.srv.all(path, callback); };