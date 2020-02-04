var http = require('http')

var opcoes = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    headers: {
        'Accept': 'application/json'
    }
}

var buffer_corpo_response = [];

http.get(opcoes, function (res) {

    res.on('data', function (pedaco) {
        buffer_corpo_response.push(pedaco);
    });

    res.on('end', function () {
        var corpo_response = Buffer.concat(buffer_corpo_response).toString();
        console.log(corpo_response)
    });

});