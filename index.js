// 載入
const fs = require('fs'); //檔案系統
const jsonfile = require('jsonfile'); //讀 json 的咚咚
const botSecret = jsonfile.readFileSync('secret.json'); // bot 資訊
const TelegramBot = require('node-telegram-bot-api'); //api
const token = process.env.TOKEN || botSecret.botToken
const bot = new TelegramBot(token, { polling: true });
const request = require("request"); // HTTP 客戶端輔助工具
const cheerio = require("cheerio"); // Server 端的 jQuery 實作
const nodejieba = require("nodejieba"); // 中文斷詞
nodejieba.load({
    dict: __dirname + '/data/jieba.utf8'
});
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
if (!botData.username) {
    botData.username = '';
    console.log('已自動建立 botData.username')
}
if (!botData.dayoff) {
    botData.dayoff = '';
    console.log('已自動建立 botData.dayoff')
}

bot.getMe().then(function(me) {
    // 啟動成功
    var start_time = new Date().getHours() + ":" + new Date().getMinutes() + ":" + new Date().getSeconds(); // 機器人啟動時間
    botData['name'] = me.first_name
    botData['username'] = me.username
    jsonfile.writeFileSync('botData.owo', botData);
    log("`[系統]`" + me.first_name + ' @' + me.username + " 在 " + start_time + " 時啟動成功");
});
// log
function log(message, parse_mode = "markdown") {
    console.log(message);
}
// 颱風資料

setInterval(cleanDayoff, 1000 * 60 * 10); //10min
function cleanDayoff() {
    botData.dayoff = ''; //十分鐘定時清除
};

async function getDayoff() {
    //看看資料是不是被清ㄌ
    if (botData.dayoff == '') {
        return await dayoffReq()
    } else {
        return botData.dayoff
    }
}
async function dayoffReq() {
    return new Promise(async(resolve, reject) => {
        request({
            url: "https://www.dgpa.gov.tw/typh/daily/nds.html",
            method: "GET",
            rejectUnauthorized: false
        }, function(error, res, body) {
            if (error || !body) {
                reject(body);
            }
            var $ = cheerio.load(body),
                city, status, time, city_status, city_name, data = { "typhoon": [], "update_time": "" };
            city = $('.Table_Body > tr > td:nth-child(1):not([colspan="3"])');
            status = $(".Table_Body > tr > td:nth-child(2)");
            for (var i = 0; i < city.length; i++) {
                city_name = $(city[i]).text()
                city_status = $(status[i]).text()
                if (city_status.match(/上午|下午|停止上班|停止上課/))
                    city_name = `❗️${city_name}`;
                data.typhoon.push({
                    "city_name": city_name,
                    "city_status": city_status
                })
            }
            //更新時間
            time = $("div.f_right > h4:nth-child(1)").text().match(/[0-9]+/g);
            data.update_time = `${time[3]}:${time[4]}`
            botData.dayoff = data
            resolve(data)
        })
    })
}
// ㄅㄏ更新通知
// 定時發送
var bahaUpdate = function() {
    bahaSend()
};

function bahaSend(force = false) {
    request({
        url: "https://ani.gamer.com.tw/",
        method: "GET"
    }, function(e, r, b) {
        /* e: 錯誤代碼 */
        /* b: 傳回的資料內容 */
        if (e || !b) { return; }
        var BahaQuarterlyUpdate = '# 本季新番\n' + getBahaQuarterlyUpdate(b)
        var BahaNewlyUpdate = '# 新上架舊番\n' + getBahaNewlyUpdate(b)
        var resp = '`~ㄅㄏ動畫瘋更新菌~`\n' + BahaQuarterlyUpdate + BahaNewlyUpdate;
        if (force) var resp = '❗️強制更新\n' + resp
        if (resp.indexOf("➕") > -1 || force)
            bot.sendMessage('-1001059842186', resp, { parse_mode: "markdown", disable_web_page_preview: true });
    });
}
setInterval(bahaUpdate, 1000 * 60 * 10); //10min
function getBahaQuarterlyUpdate(b) {
    var $ = cheerio.load(b);
    var resp = '';
    var titles = $(".newanime-title");
    var ep = $(".newanime .newanime-vol");
    var link = $(".newanime__content");
    for (var i = 0; i < link.length; i++) {
        var aniID = $(link[i]).attr('href').split('=')[1]
        var aniEp = $(ep[i]).text().match(/\d+/);
        if (!botData['bahaNoif'][aniID]) //新內容用菱形
            var aniEp = '➕ E' + (aniEp < 10 ? '0' + aniEp : aniEp),
            ntsend = true
        else
            var aniEp = '➖ E' + (aniEp < 10 ? '0' + aniEp : aniEp)
        if (i < 3 || !botData['bahaNoif'][aniID]) //如果更新數量超過 3 也會發出來
            var resp = resp + aniEp + '[' + ' ' + $(titles[i]).text() + '](' + $(link[i]).attr('href') + ")" + '\n';
        botData['bahaNoif'][aniID] = true
    }
    if (ntsend) {
        jsonedit = true;
    }
    return resp
}

function getBahaNewlyUpdate(b) {
    var $ = cheerio.load(b);
    var resp = '';
    var NewlySection = $("section.old_list:nth-child(2)");
    var Ani = $("section.old_list:nth-child(2) > ul > li");
    var AniSN = $("section.old_list:nth-child(2) > ul > li a.animelook");
    var AniEP = $("section.old_list:nth-child(2) > ul > li b.new");
    var AniNa = $("section.old_list:nth-child(2) > ul > li b:first-child");
    for (var i = 0; i < Ani.length; i++) {
        var sn = ($(AniSN[i]).attr('href') + '').match(/\d+/);
        var link = 'https://ani.gamer.com.tw/' + $(AniSN[i]).attr('href')
        var ep = $(AniEP[i]).text().match(/\d+/);
        var AniName = $(AniNa[i]).text()
        if (!botData['bahaNoif'][sn]) //新內容用菱形
            var ep = '➕ E' + (ep < 10 ? '0' + ep : ep),
            ntsend = true
        else
            var ep = '➖ E' + (ep < 10 ? '0' + ep : ep)
        if (i < 3 || !botData['bahaNoif'][sn]) //如果更新數量超過 3 也會發出來
            var resp = resp + ep + '[' + ' ' + AniName + '](' + link + ")" + '\n';
        botData['bahaNoif'][sn] = true
    }
    if (ntsend) {
        jsonedit = true;
    }
    return resp
}

bot.on('polling_error', (error) => {
    console.error(error.code); // => 'EFATAL'
});
bot.on('inline_query', async(msg) => {
    var msgID = msg.id;
    var msgQuery = msg.query
    var msgFrom = msg.from;

    var results = [];
    //=========== uid
    if (/^[0-9]+$/.test(msgQuery) && msgQuery.length < 10) {
        // 是數字
        var uid = {
            'type': 'article',
            'id': Math.random().toString(36).substr(2),
            'title': '輸入 userid',
            'description': msgQuery,
            'input_message_content': {
                'message_text': "<a href='tg://user?id=" + msgQuery + "'>" + msgQuery + "</a>",
                'parse_mode': 'html'
            }
        };
        results.push(uid);
    }
    //=========== 結巴分詞
    var cut = nodejieba.cut(msgQuery);
    //=========== jieba
    if (msgQuery) {
        var jieba_message_text = '/ ';
        //結巴分詞
        for (i in cut) {
            jieba_message_text += cut[i] + ' / ';
        }
        var jieba = {
            'type': 'article',
            'id': Math.random().toString(36).substr(2),
            'title': '結巴斷詞',
            'description': jieba_message_text,
            'input_message_content': {
                'message_text': jieba_message_text
            }
        };
        results.push(jieba);
    }
    //=========== hshshs
    var randomDirty = [
        '啊啊…',
        '…啊唔…',
        '…那裡…',
        '…不…不行！',
        '…那邊不…不…不可…以',
        '…不…不…要摸…那…那邊…',
        '…嗯…嗚…',
        '…好…害羞…',
        '啊！！',
        '嗯…啊…',
        '啊！啊…啊！',
        '啊…啊……裡面…啊………',
        '…不可以…啊、嗯…',
        '…啊！嗯！啊啊！！',
        '…唔、、、',
        '…不…不…要',
        '嗯、、……',
        '啊啊啊啊嗯嗯嗯嗯嗯嗯啊、、、'
    ];
    var hshshs_text = randomDirty[Math.floor(Math.random() * randomDirty.length)];
    if (msgQuery) {
        let dirtyCount = 0
        for (i in cut) {
            dirtyCount++;
            var random = Math.floor(Math.random() * 20)
            var randomPutin = ''
            if (random > 16 || (msgQuery.length < 30 && random > 14) || (random > 5 && dirtyCount < 10) || dirtyCount < 3)
                randomPutin += randomDirty[Math.floor(Math.random() * randomDirty.length)]
            hshshs_text += cut[i] + randomPutin
        }
    }
    var hshs = {
        'type': 'article',
        'id': Math.random().toString(36).substr(2),
        'title': '髒髒',
        'description': hshshs_text,
        'input_message_content': {
            'message_text': hshshs_text
        }
    };
    results.push(hshs);
    //=========== 運勢 
    var randomFortune = [
        '大吉',
        '中吉',
        '小吉',
        '吉',
        '末吉',
        '凶',
        '大凶'
    ];

    if (msgQuery) {
        var fortune_desp = '來看看「' + msgQuery + '」ㄉ運勢'
        var fortune_text = msgQuery + 'ㄉ運勢是「' + randomFortune[Math.floor(Math.random() * randomFortune.length)] + '」';
    } else {
        var fortune_desp = '來看看尼ㄉ運勢'
        var fortune_text = msgFrom.first_name + 'ㄉ運勢是「' + randomFortune[Math.floor(Math.random() * randomFortune.length)] + '」';
    }
    var fortune = {
        'type': 'article',
        'id': Math.random().toString(36).substr(2),
        'title': '運勢',
        'description': fortune_desp,
        'input_message_content': {
            'message_text': fortune_text
        }
    };
    results.push(fortune);
    //=========== 停班停課 
    if (msgQuery == "停班停課") {
        results = []
        var typhoon_data = await getDayoff(),
            city_name, city_status, typhoon = ''

        for (var i = 0; i < typhoon_data.typhoon.length; i++) {
            city_name = typhoon_data.typhoon[i].city_name
            city_status = typhoon_data.typhoon[i].city_status
            var typ_msg = `放假小幫手
${city_name}  ${city_status}
更新時間：${typhoon_data.update_time}`
            typhoon = {
                'type': 'article',
                'id': Math.random().toString(36).substr(2),
                'title': city_name + '停班停課資訊',
                'description': city_status,
                'input_message_content': {
                    'message_text': typ_msg
                }
            };
            results.push(typhoon);
        }
    }
    //===========
    //   send
    //===========
    bot.answerInlineQuery(msgID, results, { cache_time: 5 });
});
bot.on('message', async(msg) => {
    // 當有讀到文字時
    if (msg.text != undefined) {
        let msgText = msg.text.toLowerCase();
        //comm
        if (msgText.indexOf("/") === 0) { //辨識指令
            if (msg.chat.type != "private" && msg.text.indexOf('@' + botData.username) < 0) return //在群組內使用沒有 @
            else var isGroup = true

            if (msgText.indexOf("/start") > -1) {
                var chatId = msg.chat.id;
                var resp = '哈囉！這裡是' + botData['name'];
                bot.sendMessage(chatId, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
            }
            if (msgText.indexOf("/about") > -1) {
                var resp = `早安，` + botData['name'] + ` Desu` +
                    '\n---' +
                    '\nGitHub / git.io/BearBearCatBot' +
                    '\n開發者  / git.io/gnehs'
                bot.sendMessage(msg.chat.id, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });
            }
            if (msgText.indexOf("/echo") > -1) {
                var resp = msgText.split(' ')[1] ? msgText.split(' ')[1] : '靠北喔，你後面沒打東西是要 echo 三小'
                var msgReplyTo = msg.reply_to_message ? msg.reply_to_message.message_id : msg.message_id
                bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msgReplyTo }).then((msgr) => {
                    bot.deleteMessage(msg.chat.id, msg.message_id)
                })
            }
            if (msgText.indexOf("/getUser") > -1) {
                var resp = msgText.split(' ')[1] ? msgText.split(' ')[1] : '靠北喔，你後面沒打東西是要 echo 三小'
                var msgReplyTo = msg.reply_to_message ? msg.reply_to_message.message_id : msg.message_id
                bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msgReplyTo }).then((msgr) => {
                    bot.deleteMessage(msg.chat.id, msg.message_id)
                })
            }
            if (msgText.indexOf("/leave") > -1) {
                if (msg.from.username == 'gnehs_OwO') {
                    var resp = msgText.split(' ')[1]
                    if (!resp) var resp = '靠北喔，你後面沒打東西是要 leaveChat 三小'
                    else bot.leaveChat(resp)
                    bot.sendMessage(msg.chat.id, resp, { parse_mode: "HTML", reply_to_message_id: msg.message_id });
                }
            }
            if (msgText.indexOf("/bahaforceupdate") > -1) {
                if (msg.from.username == 'gnehs_OwO') {
                    bahaSend(true)
                }
            }
            if (msgText.indexOf("/help") > -1) {
                var chatId = msg.chat.id;
                var helpCommand = [{ Command: 'echo', Description: "[HTML] 重複講話", },
                    { Command: 'addkbd', Description: "新增鍵盤", },
                    { Command: 'removekbd', Description: "移除鍵盤", },
                    { Command: 'viewcombo', Description: "查看手賤賤及笨蛋的 Combo，回復別人訊息可取得該使用者的 Combo", },
                    { Command: 'cleancombo', Description: "清除手賤賤及笨蛋的 Combo(無法復原)", },
                    { Command: 'dayoff', Description: "查看行政院人事行政總處是否公布放假", },
                    { Command: 'about', Description: "關於" + botData['name'], },
                    { Command: 'leave', Description: "[Chat ID] 離開對話(Admin)", },
                    { Command: 'today', Description: "今日", },
                    { Command: 'start', Description: "開始", },
                    { Command: 'help', Description: "你在這裡", },
                ];
                var helpCommand = helpCommand.sort(function(a, b) { return a.Command > b.Command ? 1 : -1; });
                var resp = '';
                if (msgText.match('botfather'))
                    for (i in helpCommand)
                        var resp = resp + helpCommand[i].Command + ' - ' + helpCommand[i].Description + '\n';
                else
                    for (i in helpCommand)
                        var resp = resp + '/' + helpCommand[i].Command + ' ⭐️' + helpCommand[i].Description + '\n';
                if (msg.chat.type == 'private')
                    bot.sendMessage(chatId, resp, { reply_to_message_id: msg.message_id, disable_web_page_preview: true });
                else
                    bot.sendMessage(chatId, '請私訊使用', { reply_to_message_id: msg.message_id });
            }
            if (msgText.indexOf("/dayoff") > -1) {
                var data = await getDayoff(),
                    resp = ''
                for (var i = 0; i < data.typhoon.length; i++) {
                    city_name = data.typhoon[i].city_name
                    city_status = data.typhoon[i].city_status
                    resp += `${city_name} ${city_status}\n`;
                }
                //更新時間
                time = `更新時間 ${data.update_time} `;
                //送訊息囉
                resp += `---
\`詳細及最新情報以\` [行政院人事行政總處](goo.gl/GjmZnR) \`公告為主\`
${time}`;
                bot.sendMessage(msg.chat.id, resp, { parse_mode: "markdown", reply_to_message_id: msg.message_id });

            }
            if (msgText.indexOf("/today") > -1) {
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
            }
            if (msgText.indexOf("/viewcombo") > -1) {
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
            }
            if (msgText.indexOf("/cleancombo") > -1) {
                // 將數據設為0
                botData.bitchHand[msg.from.id] = 0;
                botData.stupid[msg.from.id] = 0;
                //輸出
                bot.sendMessage(msg.chat.id, '紀錄已清除', { reply_to_message_id: msg.message_id });
                //存檔偵測
                jsonedit = true;
            }
            if (msgText.indexOf("/removekbd") > -1) {
                let opts = {
                    reply_markup: JSON.stringify({
                        remove_keyboard: true
                    }),
                    reply_to_message_id: msg.message_id
                };
                bot.sendMessage(msg.chat.id, '鍵盤已移除', opts);
            }
            if (msgText.indexOf("/addkbd") > -1) {
                let opts = {
                    reply_markup: JSON.stringify({
                        keyboard: [
                            ['我是笨蛋', '我手賤賤']
                        ],
                        resize_keyboard: true
                    }),
                    reply_to_message_id: msg.message_id
                };
                bot.sendMessage(msg.chat.id, '鍵盤已新增', opts);
            }
            if (msgText.indexOf("/getgroupid") > -1) {
                bot.sendMessage(msg.chat.id, 'id=`' + msg.chat.id + '`', { parse_mode: "markdown", reply_to_message_id: msg.message_id });
            }
        }
        // 發 幹 的時候回復
        if (msgText.indexOf("幹") === 0) {
            bot.sendMessage(msg.chat.id, "<i>QQ</i>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        // 發 Ping 的時候回復
        if (msgText.indexOf("ping") === 0) {
            bot.sendMessage(msg.chat.id, "<b>PONG</b>", { parse_mode: "HTML", reply_to_message_id: msg.message_id });
        }
        if (msg.text == '怕') {
            bot.sendMessage(msg.chat.id, "嚇到吃手手", { parse_mode: "markdown", reply_to_message_id: msg.message_id });
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

        if (msgText == '我是笨蛋') {
            var combo = botData.stupid[msg.from.id]
            if (!combo) {
                combo = 1;
            } else {
                combo++;
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
        if (msgText == '我手賤賤') {
            var combo = botData.bitchHand[msg.from.id]
            if (!combo) {
                combo = 1;
            } else {
                combo++;
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
    }
});

//存檔
var writeFile = function() {
    if (jsonedit) {
        jsonfile.writeFileSync('botData.owo', botData);
        //存檔偵測
        jsonedit = false;
    }
};
setInterval(writeFile, 10000);