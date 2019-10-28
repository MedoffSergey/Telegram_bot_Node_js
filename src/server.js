// Подключение модулей
const express = require('express'); // Express main module
const telegramBot = require('node-telegram-bot-api'); // Telegram bot module
const download = require('download-file'); // Модуль для скачивания файлов по URL
const url = require('url'); // URL parse module
const fetch = require('node-fetch') // Модуль для скачивания файлов по URL && взять имя из заголовка
var cors = require('cors') // соеденить vue и node

const app = express() // Express init
app.use(cors())

const token = '725276890:AAEYgA9L2BA68p_ki5L9HVfcGouxsfmbKio'; // Token Телеграм бота @ToTakeURL_bot

const bot = new telegramBot(token, { // Запишем бота в переменную для дальнейшего обращения к нему
  polling: true // Бот должен стараться не прекращать работу при возникновении каких-либо ошибок
});

function linkToChat() { // Функция cвязываем бота с чатом
  bot.sendMessage(-276583637, 'Работяга john вышел на работу'); // Отправим боту сообщение о начале работ
}
linkToChat();

// Глобальные переменные для хранения в них данных
let userOption = [];                // Массив для хранения лайков

let historyArr = [];          // Массив для хранения истории уведомлений
let ratingController = {};
let rating = {};


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


bot.onText(/.+/, function(msg) { // Отслеживаем все сообщения полученные в чате
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
    let ratingInfo = {}
      if ((msg.text === "+" || textLowerCase === "спасибо" || textLowerCase === "спс" || msg.text === "👍") && canUserVote(userId, msg.date)) {
        pushParams.emotions = '1',
        ratingInfo = {answer_id : answer.from.id ,answer_name: answer.from.first_name , emotions:pushParams.emotions }
        userOption.push(ratingInfo )
      }
      if ((msg.text === "-" || textLowerCase === "дизлайк" || textLowerCase === "нет" || msg.text === "👎") && canUserVote(userId, msg.date)) {
        pushParams.emotions = '-1',
        ratingInfo = {answer_id : answer.from.id ,answer_name: answer.from.first_name , emotions:pushParams.emotions}
        userOption.push(ratingInfo )
      }

      if(pushParams.emotions){
        historyArr.push(pushParams)
        ratingController[userId] = { // переопределим свойства обьекта
          lastMessage: msg.date
        }

      }
  }
})


function countFunc (userOption) {
  userOption.reduce((summary, vote)=>{
      const {answer_name, emotions} = vote;
      if(!summary[answer_name]) summary[answer_name] = 0;
      summary[answer_name] += emotions == 1 ? 1 : -1;
      return summary;
  }, {})
}


bot.onText(/\/history/, function showHistory(msg) {
  let resultHistoryArr = ''

  for (let i = 0; i < historyArr.length; i++) {
    resultHistoryArr += ("Пользователь " + historyArr[i].first_name + ' ' + historyArr[i].last_name + " оценил коментарий пользователя " + historyArr[i].reply_first_name + ':' + '` ' + historyArr[i].reply_message +
      ' ` ' + '\nоценкой: ' + historyArr[i].emotions + " в " + new Date(historyArr[i].date * 1000).getHours() + " часов " + new Date(historyArr[i].date * 1000).getMinutes() + " минут \n\n")
  }
  if(resultHistoryArr.length == 0) {
    bot.sendMessage(msg.chat.id, "История уведомлений пуста",{
      reply_to_message_id: msg.message_id
    })
    return;
  }
  bot.sendMessage(msg.chat.id, resultHistoryArr,{
    reply_to_message_id: msg.message_id
  })
})


bot.onText(/\/rating/, function showRating(msg) { // вывод полученных данных в телеграмме по команде /rating
      let object = countFunc(userOption)

      let result = [];
      for (let name in object) {
        result.push([name, object[name]]);
      }
      result.sort(function(a, b) {
        return b[1] - a[1];
      });

      let message = "";
      let jsonMessage = [];


      for (let i = 0; i < result.length; i++) {
        message += i + 1 + ' место ' + result[i][0] + " : " + result[i][1] + " 💙 \n";
        jsonMessage.push(i + 1 + ' место ' + result[i][0] + " : " + result[i][1] ) ;
      }
      if (rating){
        rating = {}
        rating = jsonMessage
      }


    if(message.length==0) {
      bot.sendMessage(msg.chat.id, "Рейтинг пуст",{
        reply_to_message_id: msg.message_id
      })
      return
    }
  bot.sendMessage(msg.chat.id, message,{
    reply_to_message_id: msg.message_id
  })
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
  bot.sendMessage(msg.chat.id , "Ваш текущий статус: "+youStatus,{
    reply_to_message_id: msg.message_id
  })

})


bot.onText(/http\S+/, async (msg) => {
  let file_url = msg.text;
  let file_name = url.parse(file_url).pathname.split('/' || '?' || '=' || '#' || '~' || '%' || '&').pop();

  var options = {
    directory: "/home/smedov/Work/Download/",
    filename: file_name,
  }

  const res = await fetch(file_url)
  if (res.headers.get('content-disposition')) {
    const filename = res.headers.get('content-disposition').match(/filename="(.+)?"/)[1]
    options.filename = filename
  }

  download(file_url, options, async function(err) {
    if (err) {
      console.log("Ошибка при скачивании");
    } else await bot.sendDocument(msg.chat.id, options.directory + options.filename,{
      reply_to_message_id: msg.message_id
    })
  })
})




app.get('/rating', function (req, res) {
  if(rating.length!=0){
    res.json(rating)
  }
  else {
    res.send('200 OK')
  }
});

app.get('/history', function (req, res) {
  if(rating.length!=0){
    res.json(rating)
  }
  else {
    res.send('200 OK')
  }
});

app.listen(3000, function () {
    console.log ('Отслеживаем порт: 3000!');
});
