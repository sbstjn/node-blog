Simple Node.js framework for handling common express servers and default configuration. Enables jade template rendering and automatic less css processing. See [kickstart-example](https://github.com/semu/node-kickstart-example) for a basic example app using [kickstart](https://github.com/semu/node-kickstart).

    var kickstart = require('kickstart').withConfig({'name': 'example.com', 'port': 8585, 'path': __dirname});
    var srv = kickstart.srv();
    
    srv.all('*', function(req, res) {
      res.render('home', {title: 'node-kickstart'});
    });
    
    var router = kickstart.listen();
    console.log("Listening on http://%s:%d", kickstart.conf().name, router.address().port);