// 載入
var fs = require('fs'); //檔案系統
var jsonfile = require('jsonfile'); //讀 json 的咚咚
var botSecret = jsonfile.readFileSync('./secret.json'); // bot 資訊
var TelegramBot = require('node-telegram-bot-api'); //api
var bot = new TelegramBot(botSecret.botToken, { polling: true });
var request = require("request"); // HTTP 客戶端輔助工具
var cheerio = require("cheerio"); // Server 端的 jQuery 實作
var stupid = jsonfile.readFileSync('stupid.owo'); // 我是笨蛋的記數
var bitchhand = jsonfile.readFileSync('bitchhand.owo'); // 我手賤賤的記數
jsonedit = false; //設定檔案是否被編輯

// log
function log(message, parse_mode = "markdown") {
    console.log(message);
    if (botSecret.logChannelId != undefined) {
        for (i in botSecret.logChannelId) {
            bot.sendMessage(botSecret.logChannelId[i], message, { parse_mode: parse_mode });
        }
    }
}

// 啟動成功
var start_time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(); // 機器人啟動時間
log("`[系統]`熊貓貓在 " + start_time + " 時啟動成功");

// /start
bot.onText(/\/start/, function(msg) {
    var chatId = msg.chat.id;
    var resp = '哈囉！這裡是熊貓貓';
    bot.sendMessage(chatId, resp);
});

// /about
bot.onText(/\/about/, function(msg) {
    var resp = `早安，熊貓貓 Desu
熊貓貓是測試用的，所以不定時開機喔！
---
GitHub / git.io/BearBearCatBot
開發者  / git.io/gnehs`;
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
});

// /help
bot.onText(/\/help/, function(msg) {
    var chatId = msg.chat.id;
    var helpCommand = [{
            Command: 'echo [幹話]',
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
            Description: "查看手賤賤及笨蛋的 Combo，回復別人訊息可取得該使用者的 Combo",
        },
        {
            Command: 'cleanCombo',
            Description: "清除手賤賤及笨蛋的 Combo(無法復原)",
        },
        {
            Command: 'dayoff',
            Description: "查看行政院人事行政總處是否公布放假",
        },
        {
            Command: 'about',
            Description: "關於熊貓貓",
        },
        {
            Command: 'clearDayoff',
            Description: "清除 /dayoff 的快取(Admin)",
        },
        {
            Command: 'leave [Chat ID]',
            Description: "離開對話(Admin)",
        },
        {
            Command: 'today',
            Description: "今日",
        },
    ];
    var resp = '';
    for (i in helpCommand) {
        var resp = resp + '/' + helpCommand[i].Command + '\n     ' + helpCommand[i].Description + '\n';
    }
    bot.sendMessage(chatId, resp);
});

// 重複講話(HTML)
bot.onText(/\/echo (.+)/, function(msg, match) {
    var resp = match[1];
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
});

// Leave
bot.onText(/\/leave (.+)/, function(msg, match) {
    if (msg.from.username == 'gnehs_OwO') {
        bot.leaveChat(match[1])
        var resp = '好了';
    } else {
        count_bitchhand(msg);
        var resp = '你也是很棒棒喔';
    }
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
});

// 放假
bot.onText(/\/dayoff/, function(msg) {
    request({
        url: "https://www.dgpa.gov.tw/typh/daily/nds.html",
        method: "GET",
        rejectUnauthorized: false
    }, function(e, r, b) {
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = '';
        var titles = $("body>table:nth-child(2)>tbody>tr>td:nth-child(1)>font:nth-child(1)");
        var status = $("body>table:nth-child(2)>tbody>tr>td:nth-child(2)>font:nth-child(1)");
        var time = $("td[headers=\"T_PA date\"]>p>font").text();
        for (var i = 0; i < titles.length; i++) {
            var resp = resp + '*' + $(titles[i]).text() + '*：' + $(status[i]).text() + '\n';
        }
        dayoff = resp + '---\n`詳細及最新情報以` [行政院人事行政總處](goo.gl/GjmZnR) `公告為主`\n' + time;
        bot.sendMessage(msg.chat.id, dayoff, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
    });
});

// 今日
bot.onText(/\/today/, function(msg) {
    request({
        url: "http://www.cwb.gov.tw/V7/knowledge/",
        method: "GET"
    }, function(e, r, b) {
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = '🔼今日月象\n';
        var titles = $(".BoxContent>.earthshockinfo>.BoxTable02>tbody>tr>td:nth-child(1)");
        var description = $(".BoxContent>.earthshockinfo>.BoxTable02>tbody>tr>td:nth-child(2)");
        var img = 'http://www.cwb.gov.tw' + $(".BoxContent>.earthshockinfo>.BoxTable02>tbody>tr:nth-child(6)>td:nth-child(2)>img").attr('src');
        for (var i = 0; i < titles.length; i++) {
            var description_i = $(description[i]).text()
            if (i != 5)
                if (description_i != '#') var resp = resp + $(titles[i]).text() + ' / ' + description_i + '\n';
        }
        today = resp + '資料來源 /  goo.gl/vS3LS3';
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        bot.sendPhoto(msg.chat.id, img, { caption: today, parse_mode: "markdown", reply_to_message_id: msg.message_id });
    });
});
// 清除颱風快取
bot.onText(/\/clearDayoff/, function(msg) {
    if (msg.from.username == 'gnehs_OwO') {
        dayoffTimeOut = false;
        var resp = '已清除快取';
    } else {
        count_bitchhand(msg);
        var resp = '你也是很棒棒喔';
    }
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
});

//鍵盤新增跟移除
bot.onText(/\/addKeyboard/, function(msg) {
    const opts = {
        reply_markup: JSON.stringify({
            keyboard: [
                ['我是笨蛋', '我手賤賤']
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
        /*if (msg.text.toLowerCase() == '/block') {
            jsonedit = true;
            bot.sendMessage(msg.chat.id, '已封鎖' + msg.from.first_name, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }*/
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

function count_stupid(msg) {
    var combo = stupid[msg.from.id]
    if (!combo) {
        combo = 1;
    } else {
        combo = combo + 1;
    }
    var resp = "笨笨"
    var combo_count = "\n[" + combo + " Combo]";
    if (combo > 4) { var resp = combo_count }
    if (combo > 20) { var resp = "笨蛋沒有極限" + combo_count }
    if (combo > 40) { var resp = "你這智障" + combo_count }
    if (combo > 60) { var resp = combo_count }
    if (combo > 100) { var resp = "幹你機掰人" + combo_count }
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
    // 寫入字串
    stupid[msg.from.id] = combo;
    //存檔偵測
    jsonedit = true;
}

function count_bitchhand(msg) {
    var combo = bitchhand[msg.from.id];
    if (!combo) {
        combo = 1;
    } else {
        combo = combo + 1;
    }
    var resp = "走開"
    var combo_count = "\n[" + combo + " Combo]";
    if (combo > 4) { var resp = combo_count }
    if (combo > 20) { var resp = "走開，你這賤人" + combo_count }
    if (combo > 40) { var resp = "你這臭 Bitch" + combo_count }
    if (combo > 60) { var resp = combo_count }
    if (combo > 100) { var resp = "幹你機掰人" + combo_count }
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
    // 寫入字串
    bitchhand[msg.from.id] = combo;
    //存檔偵測
    jsonedit = true;
}
//存檔
var writeFile = function() {
    if (jsonedit) {
        jsonfile.writeFileSync('bitchhand.owo', bitchhand);
        jsonfile.writeFileSync('stupid.owo', stupid);
        //存檔偵測
        jsonedit = false;
    }
};
setInterval(writeFile, 8000);