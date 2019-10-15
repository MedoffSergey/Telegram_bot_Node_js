const express = require('express');
const app = express();
const url = require('url');

//telegram-bot-api
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const token = '725276890:AAEDGzGuSb8btbRGXGMPa8fvskt2QSasiIw';

//PROXY
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy:"http://46.105.57.149:43878"
  }});

//Index.html делаем страницей по умолчанию
// app.get('/', function (req, res) {
//   res.sendfile(__dirname + "/index.html");
// });

app.get('/site?/', function(req, res){

  let Url = req.url;
  let parseUrl = url.parse(Url,true,true);

  let str = '';
  let tel_str = '';

  for (var key in parseUrl.query){
    str += ("Ключ: " + key + " Значение: " + parseUrl.query[key]+ "<br>");
    tel_str += ("Ключ: " + key + " Значение: " + parseUrl.query[key]+ "\n");
  }

  bot.sendMessage('311805730', tel_str );
  res.send(str);
});

// запускаем новый HTTP-сервер на порту 3000
app.listen(3000, function () {
  console.log('Сервер работает на порту : 3000!');
});
