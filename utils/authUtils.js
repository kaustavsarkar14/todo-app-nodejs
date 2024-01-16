const validator = require('validator')

const cleanUpAndValidate = ({ name, email, username, password }) => {
  console.log(name, email, username, password);
  return new Promise((resolve, reject) => {
    if (!name || !email || !username || !password)
      reject("Missing credentials");
    if (
      typeof name != "string" ||
      typeof username != "string" ||
      typeof email != "string" ||
      typeof password != "string"
    )
    reject("Invalid data types")
        if(!validator.isEmail(email)) reject("Email is not valid")
      resolve("validated");
  });
};
module.exports = { cleanUpAndValidate };
