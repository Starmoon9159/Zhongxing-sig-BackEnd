// posts.js
const Datastore = require('nedb-promises');
const postDB = Datastore.create({ filename: './database/posts.db', autoload: true });

const { updatePosts } = require('./user');


const createPost = async (title, tag, author, contnet, thumbnail) => {
    try {
        if (!thumbnail) {
            thumbnail = 'uploads/thumbnail/default-thumbnail.png';
        }
        const generateRandomCode = require('../handler/functions/RandomCount');
        const ID = generateRandomCode(20);
        updatePosts(author, ID);

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const formattedDate = `${year}/${month}/${day} ${hours}點:${minutes}分`;

        const post = { title: title, date: formattedDate, ID: ID, tag: tag, author: author, content: contnet, thumbnail: thumbnail };
        const insertedpost = await postDB.insert(post);
        console.log(`已新增貼文: ${insertedpost.title}`);
    } catch (error) {
        console.error('新增貼文時發生錯誤:', error);
    }
};

const findPostById = async (postId) => {
    try {
        const post = await postDB.findOne({ ID: postId });

        if (post) {
            return post;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};
const checkpostID = async (ID) => {
    try {
        const user = await postDB.findOne({ ID: ID });
        return user !== null;
    } catch (error) {
        console.error('檢查重複UserID時出錯:', error);
        return true;
    }
};
const findPost = async (postsID) => {
    const posts = await postDB.findOne({ ID: postsID });
    return posts;
};
const findPostByUN = async (un) => {
    try {
        const post = await postDB.find({ author: un });
        if (post) {
            return post;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error);
        return null;
    }
};
const findAllPosts = async () => {
    try {
        const posts = await postDB.find({}); // 通过空对象作为查询条件来获取所有帖子
        return posts;
    } catch (error) {
        console.error('', error);
        return [];
    }
}; const findPostByTag = async (tag) => {
    try {
        const posts = await postDB.find({ tag: tag });
        return posts;
    } catch (error) {
        console.error('根据标签查询帖子时出错:', error);
        return [];
    }
};

module.exports = {
    createPost,
    findPost,
    findPostById,
    checkpostID,
    findPostByUN,
    findAllPosts,
    findPostByTag, 
};

