const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const token = '725276890:AAFZsqsDgLvLfhgY8t-9lhjhCN-ZwAazqUM';

//PROXY
const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: "http://194.26.180.142:3128"
  }
});

function newQuestion() {
  bot.sendMessage(-276583637, 'Работяга john вышел на работу');
}
newQuestion();

let like = [];
let dislike = []

bot.onText(/.+/, function(msg, match) {
  if (msg.reply_to_message && msg.from.id != msg.reply_to_message.from.id && match[0] === "+" ||
    match[0].toLowerCase() === "спасибо" || match[0].toLowerCase() === "спс" || match[0] === "👍") {
    like.push(msg.reply_to_message.from.first_name)
  }
  else if (msg.reply_to_message && msg.from.id != msg.reply_to_message.from.id && match[0] === "-" ||
    match[0].toLowerCase() === "дизлайк" || match[0].toLowerCase() === "нет" || match[0] === "👎") {
    dislike.push(msg.reply_to_message.from.first_name)
  }
})

function countPlus(like, dislike) {
  let finalRating = {};

  for (let i = 0; i < like.length; i++) {
    if (finalRating[like[i]] === undefined) {
      finalRating[like[i]] = 1;
    } else {
      finalRating[like[i]]++;
    }
  };
  for (let i = 0; i < dislike.length; i++) {
    if (finalRating[dislike[i]] === undefined) {
      finalRating[dislike[i]] = -1;
    } else {
      finalRating[dislike[i]]--;
    }
  }
  console.log(finalRating)
  return finalRating
}


bot.onText(/\/rating/, function showRating(msg) {

  let object = countPlus(like, dislike)
  let result = [];
  for (let name in object) {
    result.push([name, object[name]]);
  }
  result.sort(function(a, b) {
    return b[1] - a[1];
  });

  let message = ""
  for (let i = 0; i < result.length; i++) {
    message += i + 1 + ' место ' + result[i][0] + " : " + result[i][1] + " 💙 \n";
  }

  bot.sendMessage(msg.chat.id, message)
})
