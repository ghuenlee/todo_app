var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
  "dialect": "sqlite",
  "storage": "sqlite-basics.sqlite"
});

var todo = sequelize.define('todo', {
  description: {
    type: Sequelize.STRING
  },
  completed: {
    type: Sequelize.BOOLEAN
  }
});
// sync({force: true}) Clears the database, use it to recreate the tables
sequelize.sync().then( function(){
  console.log('Everything is synced.');
  todo.create({
    description: "The third Todo",
    completed: false
  }).then( function(todo){
    console.log('done!');
    console.log(todo);
  })
})
