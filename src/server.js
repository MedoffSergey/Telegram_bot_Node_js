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


function newQuestion() {
  var arr = questions[0];
  var text = arr.title;
  var options = {
    reply_markup: JSON.stringify({
      inline_keyboard: arr.buttons
    })
  };
  bot.sendMessage(311805730, text, options);
}

newQuestion();

bot.on('callback_query', msg => {
    bot.editMessageText(msg.message.text+' '+ msg.from.first_name + ' ' + msg.from.last_name,  {
                chat_id: msg.from.id,
                message_id: msg.message.message_id
            })

})
