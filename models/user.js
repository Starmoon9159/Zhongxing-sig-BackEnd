const Datastore = require('nedb-promises');
const path = require('path');
const fs = require('fs');
const userDb = Datastore.create({ filename: './database/user.db', autoload: true });
const generateRandomCode = require('../handler/functions/RandomCount');
const getRandmonBio = require('../handler/functions/bio');
const createUser = async (username, password, badge, avatarPath = 'uploads/avatars/default-avatar.png') => {
  const UserID = generateRandomCode(20);
  const bio = getRandmonBio();
  try {
    const user = {
      username: username,
      password: password,
      bio: bio,
      postsID: [],
      badgeID: badge,
      UserID: UserID,
      avatar: avatarPath, // 預設頭像路徑
    };
    const insertedUser = await userDb.insert(user);
    console.log(`已新增使用者: ${insertedUser.username}`);
  } catch (error) {
    console.error('新增使用者時發生錯誤:', error);
  }
};

const findUser = async (username, password) => {
  try {
    const user = await userDb.findOne({ username: username, password: password });
    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('查找使用者時發生錯誤:', error);
    return null;
  }
};

const checkUser = async (username, password) => {
  try {
    const user = await userDb.findOne({ username: username, password: password });
    if (user) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('檢查使用者時發生錯誤:', error);
    return false;
  }
};

const updatePosts = async (username, postID) => {
  try {
    const user = await userDb.findOne({ username: username });
    if (user) {
      user.postsID.push(postID);
      await userDb.update({ username: username }, user);
      console.log(`已更新使用者 ${username} 的帖子列表。`);
    } else {
      console.log(`找不到使用者 ${username}。`);
    }
  } catch (error) {
    console.error('更新使用者帖子列表時發生錯誤:', error);
  }
};

const findUserIDByUsername = async (username) => {
  try {
    const user = await userDb.findOne({ username: username });
    if (user) {
      return user.UserID;
    } else {
      return null;
    }
  } catch (error) {
    console.error('查找玩家ID時發生錯誤:', error);
    return null;
  }
};

const findUserIDBypasswordandName = async (username, password) => {
  try {
    const user = await userDb.findOne({ username: username, password: password });
    if (user) {
      return user.UserID;
    } else {
      return null;
    }
  } catch (error) {
    console.error('查找玩家ID時發生錯誤:', error);
    return null;
  }
};

const findUserByID = async (ID) => {
  try {
    const user = await userDb.findOne({ UserID: ID });
    if (user) {
      return user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('查找使用者時出錯:', error);
    return null;
  }
};

const checkUserID = async (UserID) => {
  try {
    const user = await userDb.findOne({ UserID: UserID });
    return user !== null;
  } catch (error) {
    console.error('檢查重複UserID時出錯:', error);
    return true;
  }
};

const checkUsername = async (UserID) => {
  try {
    const user = await userDb.findOne({ username: UserID });
    return user !== null;
  } catch (error) {
    console.error('檢查重複UserID時出錯:', error);
    return true;
  }
};

const changeUsername = async (userID, newUsername) => {
  try {
    if (!userID || !newUsername) {
      console.error('缺少必要的參數，更改使用者名稱失敗');
      return false; // 缺少參數，返回 false
    }

    const userToChange = await userDb.findOne({ UserID: userID });
    if (!userToChange) {
      console.error(`找不到要更改使用者名稱的使用者，UserID: ${userID}`);
      return false; // 使用者不存在，返回 false
    }

    // 檢查新的使用者名稱是否重複
    const isDuplicate = await checkUsername(newUsername);
    if (isDuplicate) {
      console.error(`新的使用者名稱已經存在，無法更改為 ${newUsername}`);
      return 'replace'; // 使用者名稱已存在，返回 'replace'
    }

    userToChange.username = newUsername;
    await userDb.update({ UserID: userID }, userToChange);
    console.log(`已更改使用者的名稱，UserID: ${userID} -> 新名稱: ${newUsername}`);
    return true;
  } catch (error) {
    console.error('更改使用者名稱時發生錯誤:', error);
    return false; // 其他錯誤，返回 false
  }
};

const changeUserID = async (oldUserID, newUserID) => {
  try {
    const userToChange = await userDb.findOne({ UserID: oldUserID });
    if (!userToChange) {
      console.error(`找不到要更改UserID的使用者，UserID: ${oldUserID}`);
      return false;
    }
    const isDuplicate = await checkUserID(newUserID);
    if (isDuplicate) {
      console.error(`新的UserID已經存在，無法更改為 ${newUserID}`);
      return false;
    }
    userToChange.UserID = newUserID;
    await userDb.update({ UserID: oldUserID }, userToChange);
    console.log(`已更改使用者 ${userToChange.username} 的UserID為 ${newUserID}`);
    return true;
  } catch (error) {
    console.error('更改UserID時發生錯誤:', error);
    return false;
  }
};

const updateUserAvatar = async (userID, avatarPath) => {
  try {
    const userToUpdate = await userDb.findOne({ UserID: userID });
    if (!userToUpdate) {
      console.error(`找不到要更新頭像的使用者，使用者ID: ${userID}`);
      return false;
    }

    // 儲存使用者頭像的相對路徑到資料庫
    userToUpdate.avatar = avatarPath;

    // 更新使用者資訊，包括頭像資訊
    await userDb.update({ UserID: userID }, userToUpdate);
    console.log(`已更新使用者 ${userToUpdate.username} 的頭像為 ${avatarPath}`);
    return true;
  } catch (error) {
    console.error('更新使用者頭像時發生錯誤:', error);
    return false;
  }
};

const getUserAvatarByID = async (UserID) => {
  try {
    const user = await userDb.findOne({ UserID: UserID });
    if (user) {
      return user.avatar;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const changeUserBio = async (userID, newBio) => {
  try {
    if (!userID || !newBio) {
      console.error('缺少必要的參數，更改使用者自我介紹失敗');
      return false; // 缺少參數，返回 false
    }

    const userToChange = await userDb.findOne({ UserID: userID });
    if (!userToChange) {
      console.error(`找不到要更改自我介紹的使用者，UserID: ${userID}`);
      return false; // 使用者不存在，返回 false
    }

    userToChange.bio = newBio;
    await userDb.update({ UserID: userID }, userToChange);
    console.log(`已更改使用者的自我介紹，UserID: ${userID}`);
    return true;
  } catch (error) {
    console.error('更改使用者自我介紹時發生錯誤:', error);
    return false;
  }
};

const getUserBioByID = async (UserID) => {
  try {
    const user = await userDb.findOne({ UserID: UserID });
    if (user) {
      return user.bio;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};
const changeUserPassword = async (userID, newPassword) => {
  try {
    if (!userID || !newPassword) {
      console.error('Missing required parameters to change user password');
      return false; // Missing parameters, return false
    }

    const userToChange = await userDb.findOne({ UserID: userID });
    if (!userToChange) {
      console.error(`User with UserID: ${userID} not found`);
      return false; // User doesn't exist, return false
    }

    // Update the user's password
    userToChange.password = newPassword;
    await userDb.update({ UserID: userID }, userToChange);
    console.log(`Password changed for user with UserID: ${userID}`);
    return true;
  } catch (error) {
    console.error('Error changing user password:', error);
    return false;
  }
};

module.exports = {
  createUser,
  findUser,
  checkUser,
  updatePosts,
  findUserIDByUsername,
  findUserByID,
  checkUserID,
  changeUserID,
  updateUserAvatar,
  findUserIDBypasswordandName,
  getUserAvatarByID,
  changeUsername,
  changeUserBio,
  getUserBioByID,
  changeUserPassword, // Add the new function to the exported module
};