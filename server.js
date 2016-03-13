var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = [
  {
    id: 0,
    description: 'Cocopops Test',
    completed: true
  },
  {
    id: 1,
    description: 'start NodeJS tutorial',
    completed: true
  },
  {
    id: 2,
    description: 'Complete the NodeJS tutorial',
    completed: false
  },
  {
    id: 3,
    description: 'Build small websites using NodeJS',
    completed: false
  }
]

app.get('/', function(req,res){
  res.send('TODO APP root');
});

app.get('/todos', function(req,res){
  res.json(todos);
})

app.get('/todos/:id', function(req,res){
  var paramId = parseInt(req.params.id, 10);
  var requestedTodo;
  todos.forEach(function(todo){
    if  (todo.id == paramId) {
      requestedTodo = todo;
    }
  });
  if (requestedTodo){
    res.json(requestedTodo);
    ;
  }
  else if (!requestedTodo) {
    res.status(404).send('Requested TODO not found!');
  }


});


app.listen(PORT, function(){
  console.log('Express started on port: '+ PORT);
})
