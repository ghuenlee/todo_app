var express = require('express');
var bodyParser = require('body-parser');

var app = express();
var PORT = process.env.PORT || 3000;

var todos = []
var todoId = 0;
app.use(bodyParser.json());

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

app.post('/todos', function(req,res){
  var body = req.body;
  if(body.description && typeof body.completed == "boolean"){
    todoId ++;
    var aTodo = {
      id : todoId,
      description : body.description,
      completed : body.completed
    }
    todos.push(aTodo);
  }
  console.log('description: '+ req.body.description);
  res.send(req.body);
  console.log(todos);
})


app.listen(PORT, function(){
  console.log('Express started on port: '+ PORT);
})
