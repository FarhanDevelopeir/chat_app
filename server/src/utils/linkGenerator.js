const { v4: uuidv4 } = require('uuid');

function generateUniqueLink() {
  return uuidv4();
}

module.exports = { generateUniqueLink };