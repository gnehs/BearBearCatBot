// 載入
var fs = require('fs'); //檔案系統
var token = require('./token.js'); //token
var TelegramBot = require('node-telegram-bot-api'); //api
var jsonfile = require('jsonfile')
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
            Command: 'echo',
            Description: "重複講話(可用 HTML)",
        },
        {
            Command: 'addKeyboard',
            Description: "新增鍵盤",
        },
        {
            Command: 'removeKeyboard',
            Description: "移除鍵盤",
        },
        {
            Command: 'viewCombo',
            Description: "查看手賤賤及笨蛋的 Combo",
        },
        {
            Command: 'cleanCombo',
            Description: "清除手賤賤及笨蛋的 Combo(無法復原)",
        },
    ];
    var resp = '';
    for (i = 0; i < helpCommand.length; i = i + 1) {
        var resp = resp + '/' + helpCommand[i].Command + '\n     ' + helpCommand[i].Description + '\n';
    }
    bot.sendMessage(chatId, resp);
});

// 重複講話(HTML)
bot.onText(/\/echo (.+)/, function(msg, match) {
    var resp = match[1];
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
});


//鍵盤新增跟移除
bot.onText(/\/addKeyboard/, function(msg) {
    const opts = {
        reply_markup: JSON.stringify({
            keyboard: [
                ['我是笨蛋'],
                ['我手賤賤']
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

bot.onText(/\/cleanCombo/, function(msg) {
    // 將數據設為0
    bitchhand[msg.from.id] = 0;
    stupid[msg.from.id] = 0;
    //輸出
    bot.sendMessage(msg.chat.id, '紀錄已清除', { reply_to_message_id: msg.message_id });
});
bot.onText(/\/viewCombo/, function(msg) {
    if (!msg.reply_to_message) {
        var userID = msg.from.id;
        var userNAME = msg.from.first_name;
    } else {
        var userID = msg.reply_to_message.from.id;
        var userNAME = msg.reply_to_message.from.first_name;
    }
    // 若使用者沒有數據，將數據設為0
    if (!bitchhand[userID]) { bitchhand[userID] = 0; }
    if (!stupid[userID]) { stupid[userID] = 0; }
    //輸出
    resp = userNAME + " 的 Combo 數\n手賤賤：" + bitchhand[userID] + "次\n你笨笨：" + stupid[userID] + "次"
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
});



bot.on('message', (msg) => {
    // 將所有傳給機器人的訊息轉到頻道
    var SendLog2Ch = "<code>[訊息]</code>" +
        "<code>" +
        "\n 使用者　：" + msg.from.first_name + " @" + msg.from.username +
        "\n 聊天室　：" + msg.chat.title + " | " + msg.chat.id + " | " + msg.chat.type +
        "\n 訊息編號：" + msg.message_id +
        "\n 發送時間：" + msg.date +
        "\n 訊息文字：" + msg.text +
        "</code>"
    bot.sendMessage('-1001143743775', SendLog2Ch, { parse_mode: "HTML" });
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
        if (msg.text.toLowerCase().indexOf('我是笨蛋') === 0) {
            count_stupid(msg);
        }
        if (msg.text.toLowerCase().indexOf('我手賤賤') === 0) {
            count_bitchhand(msg);
        }
        if (msg.text == '怕') {
            bot.sendMessage(msg.chat.id, "嚇到吃手手", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
    }
});
// 我是笨蛋集我手賤賤的記數
var stupid = jsonfile.readFileSync('stupid.owo')
var bitchhand = jsonfile.readFileSync('bitchhand.owo')

function count_stupid(msg) {
    var combo = stupid[msg.from.id]
    if (!combo) {
        combo = 1;
    } else {
        combo = combo + 1;
    }
    var resp = "笨笨"
    if (combo > 4) { var resp = "[" + combo + " Combo]" }
    if (combo > 20) { var resp = "笨蛋沒有極限" + "\n[" + combo + " Combo]" }
    if (combo > 40) { var resp = "你這智障" + "\n[" + combo + " Combo]" }
    if (combo > 60) { var resp = "[" + combo + " Combo]" }
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });

    //存檔
    stupid[msg.from.id] = combo;
    jsonfile.writeFileSync('stupid.owo', stupid)
}

function count_bitchhand(msg) {
    var combo = bitchhand[msg.from.id];
    if (!combo) {
        combo = 1;
    } else {
        combo = combo + 1;
    }
    var resp = "走開"
    if (combo > 4) { var resp = "[" + combo + " Combo]" }
    if (combo > 20) { var resp = "走開，你這賤人" + "\n[" + combo + " Combo]" }
    if (combo > 40) { var resp = "你這臭 Bitch" + "\n[" + combo + " Combo]" }
    if (combo > 60) { var resp = "[" + combo + " Combo]" }
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });

    //存檔
    bitchhand[msg.from.id] = combo;
    jsonfile.writeFileSync('bitchhand.owo', bitchhand)
}