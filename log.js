const fs = require('fs');

// Writing Log
function writeLog(log) {
  try {
    fs.mkdirSync('log');
  } catch (e) {
    // Do nothing
  }

  fs.appendFile('log/server.log', `${log}\n`, (err) => {
    if (err) {
      console.log('Unable to append to server.log');
    }
  });
}

module.exports = writeLog;
