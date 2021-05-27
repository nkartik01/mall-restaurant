var fs = require("fs");
var exec = require("child_process").exec;
var mongoose = require("mongoose");
const { join } = require("path");
var ftp = require("basic-ftp");

var backup = async (dbOptions) => {
  console.log("-".repeat(100));
  console.log("Backup DB : " + dbOptions.database);
  console.log("-".repeat(100));
  var date = new Date();
  var str =
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getDate() +
    "_" +
    date.getHours().toString().padStart(2, "0") +
    "-" +
    date.getMinutes().toString().padStart(2, "0");
  var backuppatch = dbOptions.backupfolder + str;
  if (!fs.existsSync(backuppatch)) {
    fs.mkdirSync(backuppatch);
  }
  await exportdb(backuppatch, dbOptions);
  var str1 =
    "tar.exe -a -c -f " +
    dbOptions.backupfolder +
    str +
    ".zip " +
    dbOptions.backupfolder +
    str;
  console.log(str1);
  exec(str1);
  return backuppatch;
};

var exportdb = async function (backuppatch, dbOptions) {
  db = dbOptions;
  var conn = await mongoose.createConnection(
    "mongodb://" +
      // db.user +
      // ":" +
      // db.pass +
      // "@" +
      db.host +
      ":" +
      db.port +
      "/" +
      db.database +
      ""
  );
  var names = await conn.db.listCollections().toArray();
  console.log("Get List Collections");
  for (let index = 0; index < names.length; index++) {
    const element = names[index];
    var str =
      "mongoexport mongodb://" +
      db.host +
      ":" +
      db.port +
      "/" +
      db.database +
      " --collection " +
      element.name +
      " -o " +
      backuppatch +
      "/" +
      element.name +
      ".json ";
    await exec(str, function (error, stdout, stderr) {
      if (error) console.log(error);
    });
  }
};

module.exports = backup;
