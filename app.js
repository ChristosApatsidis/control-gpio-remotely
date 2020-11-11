const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
require('./sockets/GPIOsockets').GPIO(io)

app.set('view engine', 'ejs')

app.use(express.static('public'))

const routes = require('./routes/routes')
app.use('/', routes)

http.listen(3000, '0.0.0.0');