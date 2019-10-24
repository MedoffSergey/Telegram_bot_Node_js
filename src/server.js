// Подключение модулей
const telegramBot = require('node-telegram-bot-api'); // Модуль бота
const fs = require('fs-extra') // Улучшенный модуль fs для работы с файлами
const download = require('download-file') // Модуль для скачивания файлов по URL
const express = require('express')
const app = express()


//const token = '709253254:AAF2wXSv_gLq4Vch8cUrOugvp0wisuLqrsM'; // Токет dima
const token = '725276890:AAEYgA9L2BA68p_ki5L9HVfcGouxsfmbKio'; // Token Телеграм бота @ToTakeURL_bot

const bot = new telegramBot(token, { // Запишем бота в переменную для дальнейшего обращения к нему
  polling: true // Бот должен стараться не прекращать работу при возникновении каких-либо ошибок
});

function linkToChat() { // Функция cвязываем бота с чатом
  bot.sendMessage(-276583637, 'Работяга john вышел на работу'); // Отправим боту сообщение о начале работ
}
linkToChat();

// Глобальные переменные для хранения в них данных
let like = [];                // Массив для хранения лайков
let dislike = [];             // Массив для хранения дизлайков
let historyArr = [];          // Массив для хранения истории уведомлений
let ratingController = {};


function canUserVote(user, date) { // Функция проверки может ли пользователь проголосовать
  if (!ratingController[user]) { // Если пользователь еще не голосовал то пусть голосует
    console.log("Этот пользователь ещё не голосовал");
    return true
  } else if (ratingController[user].lastMessage + 1 <= date) { // Если с момента последнего голосования прошло n секунд то пусть голосует еще
    console.log("Вы смогли еще раз проголосовать");
    return true
  } else {
    console.log("Вы не можете ещё голосовать", ratingController[user].lastMessage + 1 - date, "секунд"); // Если с момента последнего
    return false // голосования не прошло n секунд пользователь не может голосовать
  }
}


function normalizeItem (msg ,answer, state){
  return {
    emotions: state,
    first_name: msg.from.first_name,
    last_name: msg.from.last_name,
    date: msg.date,
    reply_first_name: answer.from.first_name,
    reply_message: answer.text,
    msg_text: msg.text,
    answer_id: answer.from.id
  }
}

bot.onText(/.+/, function(msg, match) { // Отслеживаем все сообщения полученные в чате
  let answer = msg.reply_to_message
  let conditions1 = answer && msg.from.id != answer.from.id // (условие)Если ответ есть и ваш id != id ответа
  let textLowerCase = msg.text.toLowerCase()
  let userId = msg.from.id


  // const ratingMessageType = ;//
  //
  // if(ratingMessageType === null ) return;

  if (conditions1) {
    const pushParams = {
      first_name: msg.from.first_name,
      last_name: msg.from.last_name,
      date: msg.date,
      reply_first_name: answer.from.first_name,
      reply_message: answer.text,
      msg_text: msg.text,
      answer_id: answer.from.id
    }
    const ratingInfo = {answer_id : answer.from.id ,answer_name: answer.from.first_name}

      if ((msg.text === "+" || textLowerCase === "спасибо" || textLowerCase === "спс" || msg.text === "👍") && canUserVote(userId, msg.date)) {
        pushParams.emotions = 'Положительно',
        like.push(ratingInfo)
      }
      if ((msg.text === "-" || textLowerCase === "дизлайк" || textLowerCase === "нет" || msg.text === "👎") && canUserVote(userId, msg.date)) {
        pushParams.emotions = 'Отрицательно',
        dislike.push(ratingInfo)
      }

      if(pushParams.emotions){
        historyArr.push(pushParams)
        ratingController[userId] = { // переопределим свойства обьекта
          lastMessage: msg.date
        }

      }
  }
})


function countFunc(like, dislike) { //функция подсчета лайков и дизлайков
  let finalRating = {};

  for (let i = 0; i < like.length; i++) {
    if (finalRating[like[i].answer_id] === undefined) {
      finalRating[like[i].answer_name] = 1;
    } else {
      finalRating[like[i].answer_name]++;
    }
  }
  for (let i = 0; i < dislike.length; i++) {
    if (finalRating[dislike[i].answer_id] === undefined) {
      finalRating[dislike[i].answer_name] = -1;
    } else {
      finalRating[dislike[i].answer_name]--;
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
  if(resultHistoryArr.length == 0) {
    bot.sendMessage(msg.chat.id, "История уведомлений пуста")
    return;
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
    if(message.length==0) {
      bot.sendMessage(msg.chat.id, "Рейтинг пуст")
      return
    }
  bot.sendMessage(msg.chat.id, message)
})

let userStatus = [
  {
      gte:0,
      value: 'Никто'
  },
  {
      lte:5,
      value: 'Новичек'
  },
  {
      lte:10,
      value: 'Киллер'
  },
  {
      lte:15,
      value: 'Босс'
  },
  {
      lte:20,
      value: 'Боженька'
  },
  {
      eq:6,
      value: 'Вы достигли совершенства'
  }

]

function showUserStatus(statusCount) {
  for(let item of userStatus){
      if(item.hasOwnProperty('gte') && item.gte >= statusCount){
          return item.value
      }
      if(item.hasOwnProperty('lte') && statusCount <= item.lte){
          return item.value
      }
      if(item.hasOwnProperty('eq') && statusCount >= item.eq){
          return item.value
      }
  }
  return 'Неизвестно';
}


bot.onText(/\/status/, function showRating(msg) {
  let statusCount = 0;                                            //переменная для подсчета обшего рейтинга пользователя
  for (let i = 0; i < historyArr.length; i++) {
    if (msg.from.id === historyArr[i].answer_id) {
      if (historyArr[i].emotions === 'Положительно') statusCount++;
      else statusCount--
    }
  }
  let youStatus = showUserStatus(statusCount)
  bot.sendMessage(msg.chat.id , "Ваш текущий статус: "+youStatus)

})


bot.onText(/http.+/, async (msg) => {
  let url = msg.text;
  let fileName = url.replace(/https?:\/\//, '')
  fileName = fileName.replace(/\//g, '.')

  var options = {
    directory: "/home/smedov/Work/Download",
    filename: fileName
  }

  download(url, options, async function(err) {
    if (err) console.log("");
    else await bot.sendDocument(msg.chat.id, options.directory + '/' + fileName)
  })
})


// app.get('/', function (req, res) {
//   console.log("Главная страница")
// });
//
// app.listen(3000, function () {
//     console.log ('Отслеживаем порт: 3000!');
// });
