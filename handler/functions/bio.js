function getRandmonBio() {
    const 自我介紹陣列 = [
        "你好，我是一名新成員，來自台灣。",
        "嗨，初次見面，我是來自台灣的新用戶。",
        "大家好，我是一位新成員，來自台灣。",
        "你好，我來自台灣，是這個社區的新會員。",
        "嘿，初次見面！我是台灣的新成員。",
        "您好，我來自台灣，是這個社區的一部分。",
        "你好，我是一名新用戶，來自台灣。",
        "大家好，我是一位新成員，我來自台灣。",
        "嗨，初次見面，我是來自台灣的新用戶之一。",
        "你好，我來自台灣，歡迎與我互動。",
        "嘿，我是這個社區的新成員，來自台灣。",
        "您好，我是一名新用戶，台灣的居民。",
        "你好，我來自台灣，是這個社區的一員。",
        "大家好，我是一位新成員，來自台灣。",
        "嗨，初次見面！我是一名台灣的新用戶。",
        "你好，我來自台灣，歡迎與我交流。",
        "嘿，我是這個社區的新成員之一，來自台灣。",
        "您好，我是一名新用戶，台灣的國中生。"
    ];

    // 使用示例：隨機選擇一條自我介紹
    const randmonbio = 自我介紹陣列[Math.floor(Math.random() * 自我介紹陣列.length)];
    return randmonbio;
}


module.exports = getRandmonBio;

