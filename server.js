//"c:\Program Files\MongoDB\Server\3.4\bin\mongod.exe" --dbpath D:\MongoDBData\

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var log = require('./libs/log')(module);
var config = require('./libs/config');
var ArticleModel = require('./libs/mongoose').ArticleModel;
var app = express();

app.use(favicon('favicon.ico')); // отдаем стандартную фавиконку, можем здесь же свою задать
app.use(logger('dev')); // выводим все запросы со статусами в консоль
app.use(bodyParser.json()); // стандартный модуль, для парсинга JSON в запросах
app.use(methodOverride()); // поддержка put и delete
// app.use(app.router); // модуль для простого задания обработчиков путей
app.use(express.static(path.join(__dirname, "public"))); // запуск статического файлового сервера, который смотрит на
                                                         // папку public/ (в нашем случае отдает index.html)

app.use(function (req, res, next) {
    console.log("\n1\n1\n1\n");
    res.status(404);
    log.debug('Not found URL: %s', req.url);
    res.send({error: 'Not found'});
    return;
});

app.use(function (err, req, res, next) {
    console.log("\n2\n2\n2\n");
    res.status(err.status || 500);
    log.error('Internal error(%d): %s', res.statusCode, err.message);
    res.send({error: err.message});
    return;
});

app.get('/api', function (req, res) {
    console.log("\n3\n3\n3\n");
    res.send('API is running');
});

app.get('/api/articles', function (req, res) {
    console.log("\n4\n4\n4\n");
    return ArticleModel.find(function (err, articles) {
        if (!err) {
            return res.send(articles);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);
            return res.send({error: 'Server error'});
        }
    });
});

app.post('/api/articles', function (req, res) {
    console.log("\n5\n5\n5\n");
    var article = new ArticleModel({
        title      : req.body.title,
        author     : req.body.author,
        description: req.body.description,
        images     : req.body.images
    });

    article.save(function (err) {
        if (!err) {
            log.info("article created");
            return res.send({status: 'OK', article: article});
        } else {
            console.log(err);
            if (err.name == 'ValidationError') {
                res.statusCode = 400;
                res.send({error: 'Validation error'});
            } else {
                res.statusCode = 500;
                res.send({error: 'Server error'});
            }
            log.error('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
});

app.get('/api/articles/:id', function (req, res) {
    console.log("\n6\n6\n6\n");
    return ArticleModel.findById(req.params.id, function (err, article) {
        if (!article) {
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }
        if (!err) {
            return res.send({status: 'OK', article: article});
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s', res.statusCode, err.message);
            return res.send({error: 'Server error'});
        }
    });
});

app.put('/api/articles/:id', function (req, res) {
    console.log("\n7\n7\n7\n");
    return ArticleModel.findById(req.params.id, function (err, article) {
        if (!article) {
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }

        article.title = req.body.title;
        article.description = req.body.description;
        article.author = req.body.author;
        article.images = req.body.images;
        return article.save(function (err) {
            if (!err) {
                log.info("article updated");
                return res.send({status: 'OK', article: article});
            } else {
                if (err.name == 'ValidationError') {
                    res.statusCode = 400;
                    res.send({error: 'Validation error'});
                } else {
                    res.statusCode = 500;
                    res.send({error: 'Server error'});
                }
                log.error('Internal error(%d): %s', res.statusCode, err.message);
            }
        });
    });
});

app.delete('/api/articles/:id', function (req, res) {
    console.log("\n8\n8\n8\n");
    return ArticleModel.findById(req.params.id, function (err, article) {
        if (!article) {
            res.statusCode = 404;
            return res.send({error: 'Not found'});
        }
        return article.remove(function (err) {
            if (!err) {
                log.info("article removed");
                return res.send({status: 'OK'});
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s', res.statusCode, err.message);
                return res.send({error: 'Server error'});
            }
        });
    });
});

app.get('/ErrorExample', function (req, res, next) {
    next(new Error('Random error!'));
});

var server = app.listen(config.get('port'), function () {
    var host = server.address().address

    console.log("Example app listening at http://%s:%s", host, config.get('port'));
    log.info("Example app listening at http://%s:%s", host, config.get('port'));
});

// var express = require('express');
// var app = express();
// var bodyParser = require('body-parser');
//
// // Create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false })
//
// app.use(express.static('public'));
// app.get('/index.html', function (req, res) {
//     res.sendFile( __dirname + "/" + "index.html" );
// })
//
// app.post('/process_post', urlencodedParser, function (req, res) {
//     // Prepare output in JSON format
//     response = {
//         first_name:req.body.first_name,
//         last_name:req.body.last_name
//     };
//     console.log(response);
//     res.end(JSON.stringify(response));
// })
//
// var server = app.listen(8081, function () {
//     var host = server.address().address
//     var port = server.address().port
//
//     console.log("Example app listening at http://%s:%s", host, port)
//
// })