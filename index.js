// 載入
var token = require('./token.js');
var TelegramBot = require('node-telegram-bot-api');
var bot = new TelegramBot(token.botToken, { polling: true });

// 啟動成功
var start_time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(); // 機器人啟動時間
console.log("[系統]熊貓貓在 " + start_time + " 時啟動成功");
bot.sendMessage('-1001127892867', "`[系統]`熊貓貓在 " + start_time + " 時啟動成功", { parse_mode: "markdown" });
bot.sendMessage('-1001143743775', "`[系統]`熊貓貓在 " + start_time + " 時啟動成功", { parse_mode: "markdown" });

// /start
bot.onText(/\/start/, function(msg) {
    var chatId = msg.chat.id;
    var resp = '哈囉！這裡是熊貓貓';
    bot.sendMessage(chatId, resp);
});

// 重複講話(HTML)
bot.onText(/\/echo (.+)/, function(msg, match) {
    var resp = match[1];
    if (!match[1]) { var resp = "你沒傳訊息"; }
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
});


//鍵盤新增跟移除
bot.onText(/\/addKeyboard/, function(msg) {
    const opts = {
        reply_markup: JSON.stringify({
            keyboard: [
                ['歡迎光臨貼圖群']
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
            reply_to_message_id: msg.message_id
        })
    };
    bot.sendMessage(msg.chat.id, '鍵盤已新增', opts);
});

bot.onText(/\/removeKeyboard/, function(msg) {
    const opts = {
        reply_markup: JSON.stringify({
            remove_keyboard: true,
            reply_to_message_id: msg.message_id
        })
    };
    bot.sendMessage(msg.chat.id, '鍵盤已移除', opts);
});