var koa = require('koa'),
    koa_request = require('koa-request'),
    koa_route = require('koa-route'),
    port = 3000;

var app = koa();

// route middleware
app.use(koa_route.get('/', getGeoInfo));
app.use(koa_route.get('/:ip', getGeoInfo));
app.use(koa_route.get('/json/:ip', getGeoInfo));

// json
function *getGeoInfo(ip) {
    var options = {
        url: 'http://freegeoip.net/json' + '/' + ip,
        headers: { 'User-Agent': 'request' }
    };
 
    this.body  =  '';
    
    var response = yield koa_request(options);
    var info = JSON.parse(response.body);
    
    this.type = 'text/html';
    
    for (var key in info) {
        this.body = this.body + '<b>' + key + ': </b>' + info[key] + '<br/>';
    }
}

// x-response-time
app.use(function *responseTime(next) {
    var start = new Date;
    yield next;
    var ms = new Date - start;
    this.set('X-Response-Time', ms +'ms');
});

// logger
app.use(function *logger(next) {
    var start = new Date;
    yield next;
    var ms = new Date - start;
    console.log('%s %s - %s', this.method, this.url, ms);
});

// listen
app.listen(port);
console.log('koa server started on port %s', port);