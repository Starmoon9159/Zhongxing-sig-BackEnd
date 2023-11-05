
const { checkUser, createUser, findUser, findUserPost, findUserIDByUsername, getUserBioByID,changeUserBio,checkUserID, changeUserID } = require('../models/user');
const { createPost, findPost, checkpostID } = require('../models/posts');
const FindUserPost = require('./functions/findPost');
const {
  createComment,
  findCommentsByPostID,
  deleteComment} = require('../models/comment')
async function ee(){
  const bio = await getUserBioByID('3wbd0TSSOr4PvZx2mQfc');
  console.log(bio)
}
ee()
//createUser('Admin','admin','owner')
//createPost('數學爛爆了', 'test', 'Admin')
//createComment('KSOHh0jZe8JHEy9rQlXL','Admin','哇!，真的','ZQYpDWt9SV7xePZE89VE')
/*
async function ewe() {
  const ewe = await findCommentsByPostID('KSOHh0jZe8JHEy9rQlXL')
  console.log(ewe.content)
}
ewe()

//FindUserPost("Starmoon","331887")
/*

async function getUserID() {
    const userID = await findUserIDByUsername('Admin');
    console.log(userID);
  }
*/

createComment('DbZWJNv2joDHHnj3hM2m','Starmoon','酷喔','3wbd0TSSOr4PvZx2mQfc')