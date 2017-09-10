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

// /help
bot.onText(/\/help/, function(msg) {
    var chatId = msg.chat.id;
    var helpCommand = [{
            Command: '/echo',
            Description: "重複講話(可用 HTML)",
        },
        {
            Command: '/addKeyboard',
            Description: "新增鍵盤",
        },
        {
            Command: '/removeKeyboard',
            Description: "移除鍵盤",
        },
    ];
    var resp = '';
    for (i = 0; i < helpCommand.length; i = i + 1) {
        var resp = resp + helpCommand[i].Command + '\n     ' + helpCommand[i].Description + '\n';
    }
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


bot.on('message', (msg) => {
    // 將所有傳給機器人的訊息轉到頻道
    var SendLog2Ch = "<code>[訊息]</code>"
    "<code>" +
    "\n 使用者　：" + msg.from.first_name + " @" + msg.from.username +
        "\n 聊天室　：" + msg.chat.title + " | " + msg.chat.id + " | " + msg.chat.type +
        "\n 訊息編號：" + msg.message_id +
        "\n 發送時間：" + msg.date +
        "\n 訊息文字：" + msg.text +
        "</code>"
    bot.sendMessage('-1001143743775', SendLog2Ch, { parse_mode: "HTML" })
        // 當有讀到文字時
    if (msg.text != undefined) {
        // 發 幹 的時候回復
        if (msg.text.toLowerCase().indexOf("幹") === 0) {
            bot.sendMessage(msg.chat.id, "<i>QQ</i>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        // 發 Ping 的時候回復
        if (msg.text.toLowerCase().indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("ㄈㄓ") === 0) {
            bot.sendMessage(msg.chat.id, "油", { reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("晚安") === 0) {
            bot.sendMessage(msg.chat.id, msg.from.first_name + "晚安❤️", { reply_to_message_id: msg.message_id });
        }
        if (msg.text.toLowerCase().indexOf("喵") === 0) {
            bot.sendMessage(msg.chat.id, "`HTTP /1.1 200 OK.`", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
    }
});