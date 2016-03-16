var sequelLib = require ('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelInst;

if ( env == 'production'){
  sequelInst = new sequelLib(process.env.DATABASE_URL, {
    dialect: 'postgres'
  });
} else {
  sequelInst = new sequelLib(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/data/dev-todo-app.sqlite'
  });
}


var db = {};

db.todo = sequelInst.import(__dirname + '/models/todo.js');
db.sequelInst = sequelInst;
db.sequelLib = sequelLib;

module.exports = db;
