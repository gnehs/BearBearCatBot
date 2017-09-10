var fs = require('fs'); 
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token, {polling: true});
fs.readfile(__dirname+'/file.txt',function(error, content){
    if(error){
        console.log(error);
    }
    else {
        var token = content.toString();
    }
});

bot.onText(/\/start/, function (msg) {
    var chatId = msg.chat.id; //用戶的ID
    var resp = '你好'; //括號裡面的為回應內容，可以隨意更改
    bot.sendMessage(chatId, resp); //發送訊息的function
});


bot.onText(/\/cal (.+)/, function (msg, match) {
    var fromId = msg.from.id; //用戶的ID
    var resp = match[1].replace(/[^-()\d/*+.]/g, '');
    // match[1]的意思是 /cal 後面的所有內容
    resp = '計算結果為: ' + eval(resp);
    // eval是用作執行計算的function
    bot.sendMessage(fromId, resp); //發送訊息的function
});