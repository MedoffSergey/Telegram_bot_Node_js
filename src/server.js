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
  bot.sendMessage(-276583637, 'Работяга john вышел на работу');//связываем бота с чатом
}
newQuestion();


let like = [];
let dislike = []
let ratingController = {};

function canUserVote (user, date) {
  console.log('ratingController[user]',ratingController.id)
    if (!ratingController.id) {
            console.log("Этот пользователь ещё не голосовал");
            return true
    } else {
        if (ratingController.lastMessage + 30 <= date) {
            console.log("Вы смогли еще раз проголосовать");
            return true
        } else {
            console.log("Вы не можете ещё голосовать", ratingController.lastMessage + 30 - date, "секунд");
            return false
        }
    }
}


bot.onText(/.+/, function(msg, match) {
  let answer = msg.reply_to_message
  let conditions1 = answer && msg.from.id != answer.from.id
  let textLowerCase = msg.text.toLowerCase()

  if ((conditions1) && (msg.text === "+" || textLowerCase === "спасибо" || textLowerCase === "спс" || msg.text === "👍") && canUserVote(msg.from.id,msg.date)) {
    ratingController = { id: msg.from.id , lastMessage: msg.date}
    like.push(answer.from.first_name);
  }
  if ((conditions1) && (msg.text === "-" || textLowerCase === "дизлайк" || textLowerCase === "нет" || msg.text === "👎") && canUserVote(msg.from.id,msg.date)) {
    ratingController = { id: msg.from.id , lastMessage: msg.date}
    dislike.push(answer.from.first_name)
  }
})

function countFunc(like, dislike) {//функция подсчета лайков и дизлайков
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

  return finalRating //возвращаем результат подсчета лайков и дизлайков
}

bot.onText(/\/history/,function showHistory(msg) {
  console.log(msg)
})

bot.onText(/\/rating/, function showRating(msg) { // вывод полученных данных в телеграмме по команде /rating
  let object = countFunc (like, dislike)
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

  console.log(message)
  bot.sendMessage(msg.chat.id, message)
})
