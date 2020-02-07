var express = require('express'),
    bodyParser = require('body-parser'),
    multiparty = require('connect-multiparty'),
    mongodb = require('mongodb'),
    ObjectId = require('mongodb').ObjectID,
    fs = require('fs');

var app = express();

//body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(multiparty());

var port = 3000;

app.listen(port);

var db = new mongodb.Db(
    'instagram',
    new mongodb.Server('localhost', 27017, {}),
    {}
);

console.log('servidor HTTP esta escutando na porta ' + port);

app.get('/', function (req, res) {
    res.send({ msg: 'Olá' });
});

//Inserir dados no banco Mongodb
app.post('/api', function (req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    var date = new Date();
    var time_stamp = date.getTime();

    var url_imagem = time_stamp + '_' + req.files.arquivo.originalFilename;

    var path_origem = req.files.arquivo.path;
    var path_destino = './uploads/' + url_imagem;


    fs.rename(path_origem, path_destino, function (err) {
        if (err) {
            res.status(500).json({ erro: err });
            return;
        }

        var dados = {
            url_imagem: url_imagem,
            titulo: req.body.titulo
        }

        db.open(function (err, mongoclient) {
            mongoclient.collection('postagens', function (err, collection) {
                collection.insert(dados, function (err, records) {
                    if (err) {
                        res.json({ status: 'Houve um erro.' });
                    } else {
                        res.json({ status: 'Inclusão realizada com sucesso!' });
                    }
                    mongoclient.close();
                });
            });
        });
    })
});

//Obter dados do banco Mongodb
app.get('/api', function (req, res) {

    res.setHeader("Access-Control-Allow-Origin", "*");

    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            collection.find().toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(results);
                }
                mongoclient.close();
            });
        });
    });
});

//Obter dados do banco Mongodb pelo ID
app.get('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            var id = req.params.id

            console.log('Testando', ObjectId(id));
            collection.find(ObjectId(id)).toArray(function (err, results) {
                if (err) {
                    res.json(err);
                } else {
                    res.status(200).json(results);
                }
                mongoclient.close();
            });
        });
    });
});

app.get('/imagens/:imagem', function(req, res){
    var img = req.params.imagem

    fs.readFile('./uploads/' +img, function(err, content){
        if(err){
            res.status(400).json(err);
            return;
        }

        res.writeHead(200, {'content-type' : 'image/png', 'content-type' : 'image/jpg', 'content-type' : 'image/jpeg'})
        res.end(content);
    })
})

//Atualizar dados
app.put('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            var id = req.params.id
            collection.update(
                { _id: ObjectId(id) },
                { $set: { titulo: req.body } },
                {},
                function (err, records) {
                    if (err) {
                        res.json(err);
                    } else {
                        res.json(records);
                    }
                    mongoclient.close()
                }
            );
        });
    });
});

//Deleta dados
app.delete('/api/:id', function (req, res) {
    db.open(function (err, mongoclient) {
        mongoclient.collection('postagens', function (err, collection) {
            var id = req.params.id
            collection.remove({ _id: ObjectId(id) }, function (err, records) {
                if (err) {
                    res.json(err);
                } else {
                    res.json(records);
                }
                mongoclient.close();
            });
        });
    });
});