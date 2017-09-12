# BearBearCatBot
熊貓貓，靈魂永生不死

## 如何啟動熊貓貓
新增 `secret.json` 文件並裡面填入底下資訊
```js
{
    "botToken": "YOUR_BOT_TOKEN_HERE",
    "logChannelId": ["CHAT_ID_ONE", "CHAT_ID_TWO"]
} 
```

`logChannelId` 是一個陣列，可自行刪減擴充，或是你直接幹掉也可以

輸入 `node index.js` 完成啟動
