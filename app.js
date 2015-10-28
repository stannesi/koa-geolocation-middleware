var koa = require('koa'),
    koa_request = require('koa-request'),
    koa_route = require('koa-route'),
    views = require('co-views'),
    port = process.env.PORT || 3000;

var app = koa();

var render = views(__dirname + '/views', {ext: 'ejs' })

// route middleware
app.use(koa_route.get('/', showIndex));
app.use(koa_route.get('/:ip', getGeoInfo));
app.use(koa_route.get('/json/:ip', getGeoInfo));

// render index
function *showIndex(){
     try {
        this.type = 'text/html';
        this.body = yield render('empty', { });
     } catch (err) {    
        this.type = 'text/html';
        this.body = yield render('error', {err});
     }
};

// render json
function *getGeoInfo(ip) {
    try {
        var options = {
            url: 'http://freegeoip.net/json' + '/' + ip,
            headers: { 'User-Agent': 'request' }
        };

        var response = yield koa_request(options);
        var info = JSON.parse(response.body);

        this.type = 'text/html';

        this.body = yield render('geo', {info});
     } catch (err) {    
        this.type = 'text/html';
        this.body =  yield render('error', {err});
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