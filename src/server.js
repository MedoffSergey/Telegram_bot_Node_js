const express = require('express');
const app = express();
const url = require('url');

//telegram-bot-api
const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const token = '725276890:AAFZsqsDgLvLfhgY8t-9lhjhCN-ZwAazqUM';

//PROXY
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: "http://116.203.127.92:3128"
  }
});

var questions = [{
  title: 'Кто нажал на эту кнопку?',
  buttons: [
    [{
      text: 'click me',
      callback_data: '1'
    }]
  ]
}];

function newQuestion(msg) {
  var arr = questions[0];
  var text = arr.title;
  var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: arr.buttons
    })
  };
  chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
  console.log(options)
  bot.sendMessage(chat, text, options);

}

bot.onText(/\/start/, function(msg, match) {
  newQuestion(msg);
});

bot.on('callback_query', function(msg) {
  bot.sendMessage(msg.from.id, msg.from.first_name + ' ' + msg.from.last_name);
});
