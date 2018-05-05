// 載入
const fs = require('fs'); //檔案系統
const jsonfile = require('jsonfile'); //讀 json 的咚咚
const botSecret = jsonfile.readFileSync('secret.json'); // bot 資訊
const TelegramBot = require('node-telegram-bot-api'); //api
const token = process.env.TOKEN || botSecret.botToken
const bot = new TelegramBot(token, { polling: true });
const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
botData = jsonfile.readFileSync('botData.owo'); // 我手賤賤的記數
groupID = process.env.GROUPID || "-1001127892867" || "-1001098976262"
jsonedit = false; //設定檔案是否被編輯
msgtodel = '';
if (!botData) {
    botData = {};
    console.log('已自動建立 botData')
}
if (!botData.bitchHand) {
    botData.bitchHand = {};
    console.log('已自動建立 botData.bitchHand')
}
if (!botData.stupid) {
    botData.stupid = {};
    console.log('已自動建立 botData.stupid')
}
if (!botData.bahaNoif) {
    botData.bahaNoif = {};
    console.log('已自動建立 botData.bahaNoif')
}
if (!botData.name) {
    botData.name = '';
    console.log('已自動建立 botData.name')
}
bahaNoif = botData.bahaNoif;
bitchHand = botData.bitchHand;
stupid = botData.stupid;
botname = botData.name;

bot.getMe().then(function(me) {
    // 啟動成功
    // 建立現在時間的物件
    d = new Date();
    // 取得 UTC time
    utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    // 取得台北時間
    nd = new Date(utc + (3600000 * 8));
    var start_time = nd.getFullYear() + '/' + (nd.getMonth() + 1) + '/' + nd.getDate() + ' ' +
        (nd.getHours() < 10 ? '0' + nd.getHours() : nd.getHours()) + ':' + (nd.getMinutes() < 10 ? '0' + nd.getMinutes() : nd.getMinutes()) + ':' + nd.getSeconds(); // 機器人啟動時間
    console.log("[系統]" + me.first_name + ' @' + me.username + " 在 " + start_time + " 時啟動成功");
    botData['name'] = me.first_name
    jsonfile.writeFileSync('botData.owo', botData);
    log("`[系統]`" + me.first_name + ' @' + me.username + " 在 " + start_time + " 時啟動成功");
});
// log
function log(message, parse_mode = "markdown") {
    console.log(message);
    if (botSecret.logChannelId != undefined) {
        bot.sendMessage(botSecret.logChannelId, message, { parse_mode: parse_mode });
        bot.sendMessage(groupID, message, { parse_mode: parse_mode });
    }
}
// /start
bot.onText(/\/start/, function(msg) {
    var chatId = msg.chat.id;
    var resp = '哈囉！這裡是' + botData['name'];
    bot.sendMessage(chatId, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
});
// /about
bot.onText(/\/about/, function(msg) {
    var resp = `早安，` + botData['name'] + ` Desu
---
GitHub / git.io/BearBearCatBot
開發者  / git.io/gnehs`;
    bot.sendMessage(msg.chat.id, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
});


// ㄅㄏ更新通知
// 定時發送
var bulletin_send = function() {
    request({
        url: "https://ani.gamer.com.tw/",
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = '';
        var titles = $(".newanime-title");
        var ep = $(".newanime .newanime-vol");
        var link = $(".newanime__content");
        var firstLink = $(link[0]).attr('href').split('=')[1]
        if (!botData['bahaNoif'][firstLink]) { //有更新才發
            for (var i = 0; i < link.length; i++) {
                var aniID = $(link[i]).attr('href').split('=')[1]
                var aniEp = $(ep[i]).text().match(/\d+/);
                if (!botData['bahaNoif'][$(link[i]).attr('href')]) //新內容用菱形
                    var aniEp = (aniEp < 10 ? '🔶 E0' + aniEp : '🔶 E' + aniEp)
                else
                    var aniEp = (aniEp < 10 ? '▫️ E0' + aniEp : '▫️ E' + aniEp)
                if (i < 3 || !botData['bahaNoif'][aniID]) //如果更新數量超過 3 也會發出來
                    var resp = resp + aniEp + '[' + ' ' + $(titles[i]).text() + '](' + $(link[i]).attr('href') + ")" + '\n';
                botData['bahaNoif'][aniID] = true
            }
            bot.sendMessage(groupID, '`~ㄅㄏ動畫瘋更新菌~`\n' + resp, { parse_mode: "markdown", disable_web_page_preview: true });
            jsonfile.writeFileSync('botData.owo', botData);
        }
    });
};
setInterval(bulletin_send, 1000 * 60 * 1); //15min
// /help
bot.onText(/\/help/, function(msg) {
    var chatId = msg.chat.id;
    var helpCommand = [{
            Command: 'echo [幹話]',
            Description: "重複講話(可用 HTML)",
        },
        {
            Command: 'addkbd',
            Description: "新增鍵盤",
        },
        {
            Command: 'removekbd',
            Description: "移除鍵盤",
        },
        {
            Command: 'viewcombo',
            Description: "查看手賤賤及笨蛋的 Combo，回復別人訊息可取得該使用者的 Combo",
        },
        {
            Command: 'cleancombo',
            Description: "清除手賤賤及笨蛋的 Combo(無法復原)",
        },
        {
            Command: 'dayoff',
            Description: "查看行政院人事行政總處是否公布放假",
        },
        {
            Command: 'about',
            Description: "關於" + botData['name'],
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
        var resp = resp + '/' + helpCommand[i].Command + '\n⭐️' + helpCommand[i].Description + '\n';
    }
    if (msg.chat.type == 'private') {
        bot.sendMessage(chatId, resp, {
            reply_to_message_id: msg.message_id,
            disable_web_page_preview: true
        });
    } else {
        bot.sendMessage(chatId, '請私訊使用', {
            reply_to_message_id: msg.message_id
        });
    }
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
        bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
    } else {
        msgBitchHand(msg)
    }
});

// 放假
bot.onText(/\/dayoff/, function(msg) {
    bot.sendMessage(msg.chat.id, '聽說改版ㄌ，有放到再敲ㄅㄅㄕ更新', { parse_mode: "markdown", reply_to_message_id: msg.message_id });
    /*request({
        url: "https://www.dgpa.gov.tw/typh/daily/nds.html",
        method: "GET",
        rejectUnauthorized: false
    }, function(e, r, b) {
        // e: 錯誤代碼 
        // b: 傳回的資料內容 
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = '';
        var titles = $("body>table:nth-child(2)>tbody>tr>td:nth-child(1)>font:nth-child(1)");
        var status = $("body>table:nth-child(2)>tbody>tr>td:nth-child(2)>font:nth-child(1)");
        var time = $("td[headers=\"T_PA date\"]>p>font").text();
        for (var i = 0; i < titles.length; i++) {
            var resp = resp + '*' + $(titles[i]).text() + '*：' + $(status[i]).text() + '\n';
        }
        var dayoff = resp + '---\n`詳細及最新情報以` [行政院人事行政總處](goo.gl/GjmZnR) `公告為主`\n' + time;
        bot.sendMessage(msg.chat.id, dayoff, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
    });*/
});

// 今日
bot.onText(/\/today/, function(msg) {
    request({
        url: "http://www.cwb.gov.tw/V7/knowledge/",
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = '';
        var titles = $(".BoxContent>.earthshockinfo>.BoxTable02>tbody>tr>td:nth-child(1)");
        var description = $(".BoxContent>.earthshockinfo>.BoxTable02>tbody>tr>td:nth-child(2)");
        var img = 'http://www.cwb.gov.tw' + $(".BoxContent>.earthshockinfo>.BoxTable02>tbody>tr:nth-child(6)>td:nth-child(2)>img").attr('src');
        for (var i = 0; i < titles.length; i++) {
            var description_i = $(description[i]).text()
            if (i != 5)
                if (description_i != '#') var resp = resp + $(titles[i]).text() + ' / ' + description_i + '\n';
        }
        today = resp + '資料來源 /  goo.gl/vS3LS3';
        bot.sendPhoto(msg.chat.id, img, { caption: today, parse_mode: "markdown", reply_to_message_id: msg.message_id });
    });
});

// 今日
bot.onText(/\/baha/, function(msg) {
    request({
        url: "https://ani.gamer.com.tw/",
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var $ = cheerio.load(b);
        var resp = '';
        var titles = $(".newanime-title");
        var ep = $(".newanime .newanime-vol");
        var link = $(".newanime__content");
        for (var i = 0; i < 5; i++) {
            var aniEp = $(ep[i]).text().match(/\d+/);
            var aniEp = (aniEp < 10 ? '⭐️E0' + aniEp : '⭐️E' + aniEp)
            var resp = resp + aniEp + '[' + ' ' + $(titles[i]).text() + '](' + $(link[i]).attr('href') + ")" + '\n';
        }
        var baha = resp;
        bot.sendMessage(msg.chat.id, '`~ㄅㄏ動畫瘋更新菌~`\n' + baha, { parse_mode: "markdown", reply_to_message_id: msg.message_id, disable_web_page_preview: true });

    });
});

//getgroupid
bot.onText(/\/getgroupid/, function(msg) {
    bot.sendMessage(msg.chat.id, 'id=`' + msg.chat.id + '`', { parse_mode: "markdown", reply_to_message_id: msg.message_id });
});

//鍵盤新增跟移除
bot.onText(/\/addkbd/, function(msg) {
    const opts = {
        reply_markup: JSON.stringify({
            keyboard: [
                ['我是笨蛋', '我手賤賤']
            ],
            resize_keyboard: true
        }),
        reply_to_message_id: msg.message_id
    };
    bot.sendMessage(msg.chat.id, '鍵盤已新增', opts);
});

bot.onText(/\/removekbd/, function(msg) {
    const opts = {
        reply_markup: JSON.stringify({
            remove_keyboard: true
        }),
        reply_to_message_id: msg.message_id
    };
    bot.sendMessage(msg.chat.id, '鍵盤已移除', opts);
});

bot.onText(/\/cleancombo/, function(msg) {
    // 將數據設為0
    botData.bitchHand[msg.from.id] = 0;
    botData.stupid[msg.from.id] = 0;
    //輸出
    bot.sendMessage(msg.chat.id, '紀錄已清除', { reply_to_message_id: msg.message_id });
    //存檔偵測
    jsonedit = true;
});
bot.onText(/\/viewcombo/, function(msg) {
    if (!msg.reply_to_message) {
        var userID = msg.from.id;
        var userNAME = msg.from.first_name;
    } else {
        var userID = msg.reply_to_message.from.id;
        var userNAME = msg.reply_to_message.from.first_name;
    }
    // 若使用者沒有數據，將數據設為0
    if (!botData.bitchHand[userID]) { botData.bitchHand[userID] = 0; }
    if (!botData.stupid[userID]) { botData.stupid[userID] = 0; }
    //輸出
    resp = userNAME + " 的 Combo 數\n⭐️ 手賤賤：" + botData.bitchHand[userID] + " 次\n⭐️ 你笨笨：" + botData.stupid[userID] + " 次"
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
    //存檔偵測
    jsonedit = true;
});

bot.on('polling_error', (error) => {
    console.error(error.code); // => 'EFATAL'
});
bot.on('message', (msg) => {
    // 當有讀到文字時
    if (msg.text != undefined) {
        let msgText = msg.text.toLowerCase()
            // 發 幹 的時候回復
        if (msgText.indexOf("幹") === 0) {
            bot.sendMessage(msg.chat.id, "<i>QQ</i>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        /*if (msgText == '/block') {
            jsonedit = true;
            bot.sendMessage(msg.chat.id, '已封鎖' + msg.from.first_name, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }*/
        // 發 Ping 的時候回復
        if (msgText.indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        if (msgText.indexOf("貼圖") > -1) {
            if (msgText.indexOf("請問") > -1 || msgText.indexOf("求") > -1 || msgText.indexOf("有") > -1) {
                bot.sendMessage(msg.chat.id, "詢問或發佈貼圖時請使用標籤，這樣才能被正確索引\n像是 `#詢問 #妖嬌美麗的恐龍 #會飛的`\n*＊本功能測試中，誤報請私* [@gnehs_OwO](https://t.me/gnehs_OwO) ＊", { parse_mode: "markdown", reply_to_message_id: msg.message_id, disable_web_page_preview: true });
            }
        }
        if (msgText.indexOf("ㄈㄓ") === 0) {
            bot.sendMessage(msg.chat.id, "油", { reply_to_message_id: msg.message_id });
        }
        if (msgText.indexOf("晚安") === 0) {
            bot.sendMessage(msg.chat.id, msg.from.first_name + "晚安❤️", { reply_to_message_id: msg.message_id });
        }
        if (msgText.indexOf("喵") === 0) {
            bot.sendMessage(msg.chat.id, "`HTTP /1.1 200 OK.`", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
        if (msgText == '我是笨蛋' && msg.reply_to_message.from.first_name == botname) {
            msgStupid(msg)
        }
        if (msgText == '我手賤賤' && msg.reply_to_message.from.first_name == botname) {
            msgBitchHand(msg)
        }
        if (msg.text == '怕') {
            bot.sendMessage(msg.chat.id, "嚇到吃手手", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
        }
        // 辨識是否 Tag 正確
        if (msgText.indexOf("#询问") === 0) {
            var text = chineseConv.tify(msg.text);
            bot.sendMessage(msg.chat.id, text, { reply_to_message_id: msg.message_id });
        }
        if (msgText.indexOf("#詢問#") > -1) {
            var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                "\n<a href='http://telegra.ph/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A2%BA%E7%9A%84-Tag-07-25'>查看正確的 #Tag 方式</a>";
            bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id });
        }
        if (msg.text.indexOf("＃詢問") > -1) {
            var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                "\n您的輸入設定似乎被設為全形，請換成半形後再試試";
            bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id });
        }
        if (msg.text.indexOf("#") > -1) {
            if (msg.text.match(/#/ig).length !== msg.entities.reduce((n, i) => (i.type === 'hashtag') ? n + 1 : n, 0)) {
                var send = "<b>錯誤 - Tag 無法被正常偵測</b>" +
                    "\n<a href='http://telegra.ph/%E5%A6%82%E4%BD%95%E6%AD%A3%E7%A2%BA%E7%9A%84-Tag-07-25'>查看正確的 #Tag 方式</a>";
                if (msg.entities.reduce((n, i) => (i.type === 'bold') ? n + 1 : n, 0) > 0) {
                    var send = "<b>錯誤 - Tag 因為粗體而無法被正常偵測</b>" +
                        "\n若您是 iOS 使用者，可能是粗體尚未關閉導致的" +
                        "\n<a href='https://blog.gnehs.net/telegram-ios-tag'>查看如何解決 iOS Tag 失敗的問題</a>";
                }
                bot.sendMessage(msg.chat.id, send, { parse_mode: "html", reply_to_message_id: msg.message_id })
            }
        }
    }
    // 將所有傳給機器人的訊息轉到頻道
    var msgtext = msg.text
    if (msg.text == undefined)
        var msgtext = "❓無法辨識之訊息"
    if (msg.sticker)
        var msgtext = msg.sticker.emoji + "️貼圖 " + msg.sticker.set_name
    if (msg.document)
        var msgtext = "📄檔案 " + msg.document.file_name
    if (msg.photo)
        var msgtext = "🖼圖片"
    if (msg.audio)
        var msgtext = "🎵音訊"
    if (msg.new_chat_members)
        var msgtext = "➕新成員"

    var opt = { parse_mode: "HTML", disable_web_page_preview: true }

    var SendLog2Ch = "<code>[訊息]</code>" +
        "<code>" +
        "\n 用戶：" + msg.from.first_name + " @" + msg.from.username +
        "\n 聊天：" + msg.chat.title + " | " + msg.chat.id + " | " + msg.chat.type +
        "\n 編號：" + msg.message_id +
        "\n 時間：" + msg.date +
        "\n 訊息：" + msgtext + "</code>" +
        "\n<a href='tg://user?id=" + msg.from.id + "'>#UserName_" + msg.from.username + "</a> #Name_" + msg.from.first_name + " #UserID_" + msg.from.id
    bot.sendMessage(botSecret.logChannelId, SendLog2Ch, opt).then((returnmsg) => {
        if (msg.sticker)
            bot.sendSticker(botSecret.logChannelId, msg.sticker.file_id, { reply_to_message_id: returnmsg.message_id })
        if (msg.document)
            bot.sendSticker(botSecret.logChannelId, msg.document.file_id, { reply_to_message_id: returnmsg.message_id })
        if (msg.photo)
            bot.sendPhoto(botSecret.logChannelId, msg.photo.file_id, { reply_to_message_id: returnmsg.message_id })
        if (msg.audio)
            bot.sendAudio(botSecret.logChannelId, msg.audio.file_id, { reply_to_message_id: returnmsg.message_id })
        if (msgtext == "❓無法辨識之訊息")
            bot.forwardMessage(botSecret.logChannelId, msg.chat.id, msg.message_id)

    });
});

function msgStupid(msg) {

    var combo = botData.stupid[msg.from.id]
    if (!combo) {
        var combo = 1;
    } else {
        var combo = combo + 1;
    }
    var resp = "笨笨"
    var combo_count = "\n⭐️ " + combo + " Combo";
    if (combo > 4) { var resp = combo_count }
    if (combo > 20) { var resp = "笨蛋沒有極限" + combo_count }
    if (combo > 40) { var resp = "你這智障" + combo_count }
    if (combo > 60) { var resp = combo_count }
    if (combo > 100) { var resp = "幹你機掰人" + combo_count }
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
    // 寫入字串
    botData.stupid[msg.from.id] = combo;
    //存檔偵測
    jsonedit = true;
}

function msgBitchHand(msg) {
    var combo = botData.bitchHand[msg.from.id]
    if (!combo) {
        var combo = 1;
    } else {
        var combo = combo + 1;
    }
    var resp = "走開"
    var combo_count = "\n⭐️ " + combo + " Combo";
    if (combo > 4) { var resp = combo_count }
    if (combo > 20) { var resp = "走開，你這賤人" + combo_count }
    if (combo > 40) { var resp = "你這臭 Bitch" + combo_count }
    if (combo > 60) { var resp = combo_count }
    if (combo > 100) { var resp = "幹你機掰人" + combo_count }
    bot.sendMessage(msg.chat.id, resp, { reply_to_message_id: msg.message_id });
    // 寫入字串
    botData.bitchHand[msg.from.id] = combo;
    //存檔偵測
    jsonedit = true;
}
//存檔
var writeFile = function() {
    if (jsonedit) {
        jsonfile.writeFileSync('botData.owo', botData);
        //存檔偵測
        jsonedit = false;
    }
};
setInterval(writeFile, 10000);