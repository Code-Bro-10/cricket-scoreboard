const jwt = require("jsonwebtoken");

// 1. Create the data (Payload)
const user = { id: 1, name: "Bro" };

// 2. Use a Secret Key
const mySecret = "super-secret-code-123";

// 3. GENERATE the token
const token = jwt.sign(user, mySecret);

// 4. SEE the token
console.log("HERE IS YOUR TOKEN:");
console.log(token);
