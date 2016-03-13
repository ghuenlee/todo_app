var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
  var requestedTodo = _.findWhere(todos, { id: paramId});
  if (requestedTodo){
    res.json(requestedTodo);
  }
  else if (!requestedTodo) {
    res.status(404).send('Requested TODO not found!');
  }


});

app.post('/todos', function(req,res){
  var body = req.body;
  body = _.pick(body, 'description', 'completed');
  body.description = body.description.trim();

  if(_.isString(body.description) && _.isBoolean(body.completed) && body.description.trim().length > 0){
    todoId ++;
    var aTodo = {
      id : todoId,
      description : body.description,
      completed : body.completed
    }
    todos.push(aTodo);
  }
  else {
    return res.status(400).send('Error 400: Data provided is inadequate.');
  }
  console.log('description: '+ req.body.description);
  res.send(req.body);
  console.log(todos);
})


app.listen(PORT, function(){
  console.log('Express started on port: '+ PORT);
})
