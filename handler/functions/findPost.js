const { createUser, findUser, findUserPost } = require('../../models/user');
const { createPost, findPost } = require('../../models/posts');

const FindUserPost = async (username, password) => {
  const user = await findUser(username, password);

  if (user) {

    for (const postID of user.postsID) {
      const post = await findPost(postID);
      if (post) {
        console.log(`找到匹配的帖子標題: ${post.title}`);
      }
    }
  } else {
    console.log('找不到使用者或使用者沒有帖子。');
  }
};

module.exports = FindUserPost;

