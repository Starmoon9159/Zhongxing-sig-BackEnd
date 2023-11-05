const jwt = require('jsonwebtoken');
require('dotenv').config();
const reqToken = jwt.verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VySUQiOiJlbXZ0Mm9HQ0xZMHZxRzBwRmkxZyIsImlhdCI6MTY5ODQwNDI1NCwiZXhwIjoxNjk4NDkwNjU0fQ.77vS7ThsoBr8D4ZyP7BpZnTxEbnwyKVx3Eo7pH2pP4w',process.env.token)
console.log(reqToken.UserID)