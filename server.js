var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var PORT = process.env.PORT || 3000;

var todos = []
var todoId = 0;
app.use(bodyParser.json());

app.get('/', function(req,res){
  res.send('TODO APP root');
});

app.get('/todos', function(req,res){
  var queryParams = req.query;
  var filteredTodos = todos;

  if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'true'){
    filteredTodos = _.where(filteredTodos, { completed: true});
  }
  else if (queryParams.hasOwnProperty('completed') && queryParams.completed == 'false'){
    filteredTodos = _.where(filteredTodos, { completed: false});
  }
  if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0)
  {
    filteredTodos = _.filter(filteredTodos, function (todo){
      console.log(todo.description.toLowerCase());
      console.log(queryParams.q.toLowerCase());
      return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
    });

    res.json(filteredTodos);
  }


  res.json(filteredTodos);
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

  db.todo.create(body).then(function(todo){
    res.json(todo.toJSON());
  }, function(e){
    res.status(400).send('Cannot create todo');
  });

//   body.description = body.description.trim();
//
//   if(_.isString(body.description) && _.isBoolean(body.completed) && body.description.trim().length > 0){
//     todoId ++;
//     var aTodo = {
//       id : todoId,
//       description : body.description,
//       completed : body.completed
//     }
//     todos.push(aTodo);
//   }
//   else {
//     return res.status(400).send('Error 400: Data provided is inadequate.');
//   }
//   console.log('description: '+ req.body.description);
//   res.send(req.body);
//   console.log(todos);
});

app.delete('/todos/:id', function(req,res){
  var paramId = parseInt(req.params.id, 10);
  var requestedTodo = _.findWhere(todos, { id: paramId});
  if(requestedTodo){
    todos = _.without(todos, requestedTodo );
    console.log('Removed todo at id: '+paramId);
    res.json({ "result" : "Todo removed",
               "removed todo": requestedTodo});
  }
  else {
    res.status(404).send("Provided id not matching.");
  }
});

app.put('/todos/:id', function(req,res){
  var body =_.pick(req.body, 'description', 'completed');
  var validatedAttributes = {};
  var paramId = parseInt(req.params.id, 10);
  var requestedTodo = _.findWhere(todos, { id: paramId});

  if(!requestedTodo){
    return res.status(404).send("Todo unspecified/Not found.");
  }

  if( body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
    validatedAttributes.completed = body.completed;
  }
  else if (body.hasOwnProperty('completed')){
    return res.status(400).send("Bad request. Check the attributes");
  }

  if( body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length >0) {
    validatedAttributes.description = body.description.trim();
  }
  else if (body.hasOwnProperty('description')){
    return res.status(400).send("Bad request. Check the attributes");
  }

  // validatedAttributes.id = requestedTodo.id;
  _.extend(requestedTodo, validatedAttributes);
  res.json(requestedTodo);


});

db.sequelInst.sync().then(function(){
  app.listen(PORT, function(){
    console.log('Express started on port: '+ PORT);
  });
});
