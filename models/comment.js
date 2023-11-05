const Datastore = require('nedb-promises');
const commentDB = Datastore.create({ filename: './database/comment.db', autoload: true });
const generateRandomCode = require('../handler/functions/RandomCount');

// 創建評論
const createComment = async (postID, username, content, userID) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}/${month}/${day} ${hours}點:${minutes}分`;

    const RDcode = generateRandomCode(20); // 生成唯一的評論ID
    const comment = {
        postID: postID,
        username: username,
        date: formattedDate,
        content: content,
        userID: userID,
        commentID: RDcode,
    };

    try {
        const insertedComment = await commentDB.insert(comment);
        return insertedComment;
    } catch (error) {
        console.error('創建評論時發生錯誤:', error);
        return null;
    }
};

// 查找特定帖子的所有評論
const findCommentsByPostID = async (postID) => {
    try {
        const comments = await commentDB.find({ postID: postID });
        return comments;
    } catch (error) {
        console.error('查找評論時發生錯誤:', error);
        return null;
    }
};

// 刪除評論
const deleteComment = async (commentID) => {
    try {
        const numRemoved = await commentDB.remove({ commentID: commentID }, {});
        return numRemoved;
    } catch (error) {
        console.error('刪除評論時發生錯誤:', error);
        return 0;
    }
};


const checkCommentID = async (commentID) => {
    try {
        const comment = await commentDB.findOne({ commentID: commentID });
        return comment !== null;
    } catch (error) {
        console.error('檢查重複 commentID 時出錯:', error);
        return true;
    }
};

module.exports = {
    createComment,
    findCommentsByPostID,
    deleteComment,
};
