const TelegramBot = require('node-telegram-bot-api');
const request = require('request');
const fs = require('fs-extra')
const http = require('http');
const download = require('download-file')

const token = '725276890:AAFZsqsDgLvLfhgY8t-9lhjhCN-ZwAazqUM';
//PROXY
const bot = new TelegramBot(token, {
  polling: true
});

function newQuestion() {
  bot.sendMessage(-276583637, 'Работяга john вышел на работу'); //связываем бота с чатом
}
newQuestion();

let like = [];
let dislike = [];
let historyArr = [];
let ratingController = {};

function canUserVote(user, date) {
  console.log('ratingController[user]', ratingController.id)
  if (!ratingController.id) {
    console.log("Этот пользователь ещё не голосовал");
    return true
  } else {
    if (ratingController.lastMessage + 10 <= date) {
      console.log("Вы смогли еще раз проголосовать");
      return true
    } else {
      console.log("Вы не можете ещё голосовать", ratingController.lastMessage + 10 - date, "секунд");
      return false
    }
  }
}

bot.onText(/.+/, function(msg, match) {
  let answer = msg.reply_to_message
  let conditions1 = answer && msg.from.id != answer.from.id
  let textLowerCase = msg.text.toLowerCase()

  if ((conditions1) && (msg.text === "+" || textLowerCase === "спасибо" || textLowerCase === "спс" || msg.text === "👍") && canUserVote(msg.from.id, msg.date)) {
    historyArr.push({
      emotions: "Положительно",
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      date: msg.date,
      reply_first_name: msg.reply_to_message.from.first_name,
      reply_message: msg.reply_to_message.text,
      msg_text: msg.text,
      my_id: msg.reply_to_message.from.id
    })
    ratingController = {
      id: msg.from.id,
      lastMessage: msg.date
    }
    like.push(answer.from.first_name);
  }
  if ((conditions1) && (msg.text === "-" || textLowerCase === "дизлайк" || textLowerCase === "нет" || msg.text === "👎") && canUserVote(msg.from.id, msg.date)) {
    console.log( msg.reply_to_message.from.id)
    historyArr.push({
      emotions: "Отрицательно",
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      date: msg.date,
      reply_first_name: msg.reply_to_message.from.first_name,
      reply_message: msg.reply_to_message.text,
      msg_text: msg.text,
      my_id: msg.reply_to_message.from.id
    })
    ratingController = {
      id: msg.from.id,
      lastMessage: msg.date
    }
    dislike.push(answer.from.first_name)
  }
})

function countFunc(like, dislike) { //функция подсчета лайков и дизлайков
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

bot.onText(/\/history/, function showHistory(msg) {
  let resultHistoryArr = ''

  for (let i = 0; i < historyArr.length; i++) {
    resultHistoryArr += ("Пользователь " + historyArr[i].first_name + ' ' + historyArr[i].last_name + " оценил коментарий пользователя " + historyArr[i].reply_first_name + ':' + '` ' + historyArr[i].reply_message +
      ' ` ' + '\nоценкой: ' + historyArr[i].emotions + " в " + new Date(historyArr[i].date * 1000).getHours() + " часов " + new Date(historyArr[i].date * 1000).getMinutes() + " минут \n\n")
  }
  bot.sendMessage(msg.chat.id, resultHistoryArr)
})

bot.onText(/\/rating/, function showRating(msg) { // вывод полученных данных в телеграмме по команде /rating
      let object = countFunc(like, dislike)
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


bot.onText(/\/status/, function showRating(msg) {
let count = 0
  for (let i = 0; i<historyArr.length;i++){
    if(msg.from.id === historyArr[i].my_id){
      if (historyArr[i].emotions === 'Положительно') count++;
      else count --
    }
  }
  if(count < 0 ) bot.sendMessage(msg.chat.id , "Вас недооценивают милорд")
  else if(count == 0 ) bot.sendMessage(msg.chat.id , "Вы явно новичок")
  else bot.sendMessage(msg.chat.id , "Вы популярны милорд")
})

bot.onText(/http.+/, async (msg) => {
  let url = msg.text;
  let fileName = url.replace(/https?:\/\//, '')
  fileName = fileName.replace(/\//g, '.')

  var options = {
    directory: "/home/smedov/Work/Download",
    filename: fileName
  }
  //console.log("URL: ", url, options.directory, options.filename)
  download(url, options, async function(err) {
    if (err) throw err;
    else await bot.sendDocument(msg.chat.id, options.directory + '/' + fileName)
  })
})
