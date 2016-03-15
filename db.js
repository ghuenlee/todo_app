var sequelLib = require ('sequelize');
var sequelInst = new sequelLib(undefined, undefined, undefined, {
  'dialect': 'sqlite',
  'storage': __dirname + '/data/dev-todo-app.sqlite'
});

var db = {};

db.todo = sequelInst.import(__dirname + '/models/todo.js');
db.sequelInst = sequelInst;
db.sequelLib = sequelLib;

module.exports = db;
