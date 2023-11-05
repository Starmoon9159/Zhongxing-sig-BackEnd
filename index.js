// backend
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const tokenBlacklist = [];
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { createComment, findCommentsByPostID, deleteComment } = require('./models/comment');
const { changeUserPassword, changeUserBio, getUserBioByID, checkUser, findUserIDByUsername, findUserIDBypasswordandName, findUserByID, changeUsername, updateUserAvatar, createUser, getUserAvatarByID } = require('./models/user');
const { findPostById, findPost, findPostByUN, findAllPosts, createPost, findPostByTag } = require('./models/posts');
const app = express();
const port = process.env.PORT || 9000;
const verifyJwt = require('./functions/verifyJwt');
const cors = require('cors');
app.use(bodyParser.urlencoded({ extended: true }), cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/logout', (req, res) => {
    // 從請求中取得 JWT，通常是從請求標頭或 cookie 中提取
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ message: '未提供 JWT，無法登出' });
    }

    // 檢查 JWT 是否在黑名單中
    if (tokenBlacklist.includes(token)) {
        return res.status(401).json({ message: 'JWT 已經無效，無法登出' });
    }

    // 將 JWT 加入黑名單，使其無效
    tokenBlacklist.push(token);

    // 登出成功
    res.status(200).json({ message: '登出成功' });
});
app.post('/api/changePassword', async (req, res) => {
    const { userID, password } = req.body;

    if (!userID || !password) {
        return res.status(400).json({ error: '缺少必要的參數' });
    }

    const success = await changeUserPassword(userID, password);

    if (success) {
        return res.json({ message: '密碼已成功更改' });
    } else {
        return res.status(500).json({ error: '無法更改密碼' });
    }
});


const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/img'); // 圖片保存的目錄，確保該目錄存在
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        const uniqueName = Date.now() + extname;
        cb(null, uniqueName); // 儲存檔案名為時間戳加檔案擴展名
    }
});
const imageUpload = multer({ storage: imageStorage });
app.get('/api/user/:UserID/bio', async (req, res) => {
    const userID = req.params.UserID;

    try {
        const bio = await getUserBioByID(userID);

        if (bio) {
            res.json({ bio });
        } else {
            res.status(404).json({ message: '找不到個人簡介' });
        }
    } catch (error) {
        console.error('查看個人簡介時出錯:', error);
        res.status(500).json({ message: '查看個人簡介時出錯' });
    }
});

// 新增更改個人簡介的 API
app.post('/api/update-bio', async (req, res) => {
    const { bio, userID } = req.body;
    console.log(userID + bio)
    if (!userID || !bio) {
        res.status(400).json({ message: '缺少使用者ID或個人簡介數據' });
        return;
    }

    try {
        const updated = await changeUserBio(userID, bio);

        if (updated) {
            res.json({ message: 'done' });
        } else {
            res.status(500).json({ message: '個人簡介更新失敗' });
        }
    } catch (error) {
        console.error('更新個人簡介時出錯:', error);
        res.status(500).json({ message: '更新個人簡介時出錯' });
    }
});
app.post('/api/change-username', async (req, res) => {
    const { userID, newUsername } = req.body; // 從請求體中獲取使用者ID和新使用者名

    try {
        const success = await changeUsername(userID, newUsername);
        if (success === true) {
            res.status(200).json({ message: 'done' });
        } else if (success === 'replace') {
            res.status(200).json({ message: 'replace' });
        } else {
            res.status(400).json({ error: '更改失敗' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/getUserAvatar', async (req, res) => {
    const ID = req.query.ID;

    // 使用getUserAvatarByID函數從您的使用者模組中獲取頭像
    const avatar = await getUserAvatarByID(ID);

    if (avatar) {
        res.json({ avatar: `http://localhost:9000/${avatar}` });
    } else {
        // 處理未找到頭像的情況，您可以發送默認頭像路徑或錯誤消息。
        res.json({ avatar: 'http://localhost:9000/uploads/avatars/default-avatar.png' });
    }
});

const thumbnailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/thumbnail'); // 圖片保存的目錄，確保該目錄存在
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        const uniqueName = Date.now() + extname;
        cb(null, uniqueName); // 儲存檔案名為時間戳加檔案擴展名
    }
});
const thumbnailUpload = multer({ storage: thumbnailStorage });

app.post('/api/img/upload/thumbnail', thumbnailUpload.array('file', 5), (req, res) => {
    if (req.files && req.files.length > 0) {
        // 處理上傳的圖片，將圖片信息存儲到數據庫或返回圖片URL等
        const imageUrls = req.files.map((file) => {
            // 構建圖片鏈接的完整URL，根據您的服務器部署情況修改主機名和端口號
            return `http://localhost:${port}/uploads/thumbnail/${file.filename}`;
        });
        res.json({ urls: imageUrls });
    } else {
        res.status(400).json({ message: '上傳失敗' });
    }
});

app.post('/api/img/upload', imageUpload.array('file', 5), (req, res) => {
    if (req.files && req.files.length > 0) {
        // 處理上傳的圖片，將圖片信息存儲到數據庫或返回圖片URL等
        const imageUrls = req.files.map((file) => {
            // 構建圖片鏈接的完整URL，根據您的服務器部署情況修改主機名和端口號
            return `http://localhost:${port}/uploads/img/${file.filename}`;
        });
        res.json({ urls: imageUrls });
    } else {
        res.status(400).json({ message: '上傳失敗' });
    }
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars'); // 檔案保存的目錄，確保該目錄存在
    },
    filename: (req, file, cb) => {
        const extname = path.extname(file.originalname);
        const userID = req.params.UserID;
        cb(null, userID + extname); // 儲存檔案的名稱為使用者ID
    }
});

const upload = multer({ storage: storage });
const avatarDirectory = path.join(__dirname, './uploads/avatars');
const markdownDirectory = path.join(__dirname, 'database/posts');
app.post('/api/create-post', async (req, res) => {
    const { title, tag, author, content, thumbnail } = req.body;

    if (!title || !tag || !author || !content || !thumbnail) {
        res.status(400).json({ message: '缺少必要信息' });
        return;
    }

    try {
        // 呼叫函數創建帖子
        createPost(title, tag, author, content, thumbnail);
        res.status(201).json({ message: '完成' });
    } catch (error) {
        console.error('創建帖子時出錯:', error);
        res.status(500).json({ message: '錯誤' });
    }
});
app.get('/api/posts', async (req, res) => {
    const tag = req.query.tag; // 使用 req.query.tag 獲取查詢參數
    const ID = req.query.ID;
    try {
        if (ID) {
            const posts = await findPostById(ID)
            res.json(posts)
        } else {
            if (tag) {
                const posts = await findPostByTag(tag);
                res.json(posts);
            } else {
                const posts = await findAllPosts();
                res.json(posts);
            }
        }
    } catch (error) {
        console.error('出錯了:', error);
        res.status(404).json({ error: '錯誤' });
    }
});
app.get('/api/postbyid/:postId', async (req, res) => {
    const postId = req.params.postId; // 從 URL 參數中獲取帖子 ID

    try {
        const post = await findPostById(postId); // 呼叫數據庫操作函數查找帖子

        if (post) {
            // 返回查找到的帖子
            res.json(post);
        } else {
            // 如果帖子不存在，返回適當的響應
            res.status(404).json({ message: '帖文不存在' });
        }
    } catch (error) {
        console.error('查找時出錯:', error);
        res.status(500).json({ message: '查找時出錯' });
    }
});
// 創建一個API端點，用於獲取指定Markdown文件的內容
app.get('/api/markdown-file/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(markdownDirectory, fileName);
    const marked = require('marked');
    // 讀取指定Markdown文件的內容
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('讀取MD時出錯：', err);
            res.status(500).json({ error: '無法讀取MD內容' });
        } else {
            // 將Markdown內容轉換為HTML
            //const htmlContent = marked(data);
            res.send(data);
        }
    });
});
app.post('/api/createUser', async (req, res) => {
    const { username, password, badgeID } = req.body;

    // 在這裡進行輸入驗證，確保輸入的數據有效
    console.log("從客戶端接收到的數據:", { username, password, badgeID });
    // 呼叫創建用戶的功能
    createUser(username, password, badgeID);

    res.status(201).json({ message: '帳號已成功創建' });
});
app.get('/api/user/:userID/avatar', (req, res) => {
    const userID = req.params.userID;

    // 基於`userID`創建文件路徑的數組，包括不同的圖片格式
    const avatarPaths = ['png', 'jpg', 'jpeg', 'gif'].map((format) =>
        path.join(avatarDirectory, `${userID}.${format}`)
    );

    // 檢查不同格式的文件是否存在，返回第一個找到的
    const existingPath = avatarPaths.find((avatarPath) => fs.existsSync(avatarPath));

    if (existingPath) {
        // 從找到的文件路徑讀取圖片並以適當的內容類型作為響應發送
        const format = path.extname(existingPath).substring(1);
        const contentType = `image/${format}`;
        res.contentType(contentType);
        res.sendFile(existingPath);
    } else {
        // 如果找不到頭像，你可以發送一個默認頭像或錯誤消息
        res.status(404).send('找不到頭像');
    }
});
// 新增路由處理頭像上傳
app.post('/api/user/:UserID/Cavatar', upload.single('avatar'), async (req, res) => {
    const userID = req.params.UserID;
    const avatar = req.file;

    if (!userID || !avatar) {
        res.status(400).json({ message: '缺少使用者ID或頭像資料' });
        return;
    }

    // 驗證檔案上傳是否成功
    if (req.file) {
        // 儲存頭像的路徑
        const avatarPath = req.file.path;

        // 呼叫更新頭像的功能（請確保你有這個功能的實現）
        const updated = await updateUserAvatar(userID, avatarPath);

        if (updated) {
            res.json({ message: '頭像上傳成功' });
        } else {
            res.status(500).json({ message: '頭像上傳失敗' });
        }
    } else {
        res.status(400).json({ message: '無效的檔案類型或檔案大小超過限制' });
    }
});

const secretKey = process.env.token;

app.get('/api/post/:ID', async (req, res) => {
    const postId = req.params.ID;

    try {
        const post = await findPostById(postId);
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: '錯誤' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '錯誤' });
    }
});

app.get('/api/user/:UserID', async (req, res) => {
    const identifier = req.params.UserID;
    const admintoken = req.query.token;
    if (admintoken === process.env.admintoken) {
        if (identifier.match(/^@[\w\d]+$/)) {
            const UserID = identifier.substring(1);
            try {
                const user = await findUserByID(UserID);
                if (user) {
                    res.json(user);
                } else {
                    res.status(404).json({ message: '錯誤' });
                }
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: '錯誤' });
            }
        } else {
            res.status(400).json({ message: '格式無效' });
        }
    } else {
        res.status(400).json({ message: '未知的密碼，無法查看此內容' });
    }

});


app.get('/api/userpost/:UserID', async (req, res) => {
    const identifier = req.params.UserID;
    const length = parseInt(req.query.length) || 3; // 默認值為10

    if (identifier.match(/^@[\w\d]+$/)) {
        const UserID = identifier.substring(1);
        try {
            const user = await findUserByID(UserID);
            if (user) {
                const posts = await findPostByUN(user.username);

                if (posts && posts.length > 0) {
                    // 根據參數 `length` 截取帖子列表
                    const limitedPosts = posts.slice(0, length);
                    res.json(limitedPosts);
                } else {
                    res.status(404).json({ message: '該用戶沒有帖子' });
                }
            } else {
                res.status(404).json({ message: '用戶不存在' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: '發生錯誤' });
        }
    } else {
        res.status(400).json({ message: '無效的格式' });
    }
});



app.post('/api/verifyJWT', async (req, res) => {
    const requestData = req.body;
    const token = requestData.token;

    const reqToken = verifyJwt(token, process.env.token);

    if (reqToken && reqToken.UserID) {
        const user = await findUserByID(reqToken.UserID);
        const responseData = { message: '資料處理成功', data: 'success', user };
        res.json(responseData);

    } else {
        const responseData = { message: '資料處理失敗', data: 'error' };
        res.json(responseData);
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await checkUser(username, password);

    if (userExists) {
        const UserID = await findUserIDByUsername(username);

        const token = jwt.sign({ UserID }, secretKey, { expiresIn: '24h' });
        console.log(`${UserID}已成功登入`)
        res.status(200).json({ token });
    } else {
        res.status(401).json({ message: '使用者名稱或密碼不正確' });
    }
});





app.post('/api/comments', async (req, res) => {
    const { postID, username, text, userID } = req.body;

    if (!postID || !text || !username || !userID) {
        res.status(400).json({ message: '缺少必要信息' });
        return;
    }

    try {
        // 呼叫函數創建評論
        const comment = await createComment(postID, username, text, userID); // 替換為實際的用戶名和用戶ID
        if (comment) {
            res.status(201).json({ message: '評論成功創建' });
        } else {
            res.status(500).json({ message: '評論創建失敗' });
        }
    } catch (error) {
        console.error('創建評論時出錯:', error);
        res.status(500).json({ message: '評論創建失敗' });
    }
});

// 獲取帖子的所有評論
app.get('/api/comments', async (req, res) => {
    const postID = req.query.postID;

    try {
        const comments = await findCommentsByPostID(postID);
        if (comments) {
            res.json(comments);
        } else {
            res.status(404).json({ message: '未找到評論' });
        }
    } catch (error) {
        console.error('獲取評論失敗:', error);
        res.status(500).json({ message: '獲取評論失敗' });
    }
});

// 刪除評論
app.delete('/api/comments/:commentID', async (req, res) => {
    const commentID = req.params.commentID;

    if (!commentID) {
        res.status(400).json({ message: '缺少評論ID' });
        return;
    }

    try {
        const numRemoved = await deleteComment(commentID);
        if (numRemoved > 0) {
            res.json({ message: '評論刪除成功' });
        } else {
            res.status(404).json({ message: '未找到要刪除的評論' });
        }
    } catch (error) {
        console.error('刪除評論失敗:', error);
        res.status(500).json({ message: '刪除評論失敗' });
    }
});

app.listen(port, () => {
    console.log(`伺服器正在執行：http://localhost:${port}`);

});
