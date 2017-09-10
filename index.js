var token = require('./token.js');
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token.botToken, {polling: true});

console.log('機器人啟動成功！')

bot.onText(/\/start/, function (msg) {
    var chatId = msg.chat.id;
    var resp = '你好';
    bot.sendMessage(chatId, resp);
});


bot.onText(/\/cal (.+)/, function (msg, match) {
    var fromId = msg.from.id; //用戶的ID
    var resp = match[1].replace(/[^-()\d/*+.]/g, '');
    // match[1]的意思是 /cal 後面的所有內容
    resp = '計算結果為: ' + eval(resp);
    // eval是用作執行計算的function
    bot.sendMessage(fromId, resp); //發送訊息的function
});