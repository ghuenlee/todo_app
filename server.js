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
  var query = req.query;

  var where = {};

  if (query.hasOwnProperty('completed') && query.completed == 'true'){
  where.completed = true;
  }
  else if (query.hasOwnProperty('completed') && query.completed == 'false'){
  where.completed = false;
  }
  if (query.hasOwnProperty('q') && query.q.length > 0)
  {
    where.description = {
      $like: '%' + query.q + '%'
    }
  }

    console.log(where);

  db.todo.findAll({ where }).then(function(todos){
    res.send(todos);
  }, function(e){
    res.status(500).send("Server Error");
  });

});

app.get('/todos/:id', function(req,res){
  var paramId = parseInt(req.params.id, 10);
  db.todo.findById(paramId).then(function (todo){
    if (todo){
      res.json(todo);
    }
    else if (!todo){
      res.status(404).send("Todo not found!");
    }
  }, function(e){
    res.status(500).send("Server error.");
  });



});

app.post('/todos', function(req,res){
  var body = req.body;
  body = _.pick(body, 'description', 'completed');

  db.todo.create(body).then(function(todo){
    res.json(todo.toJSON());
  }, function(e){
    res.status(400).send('Cannot create todo');
  });

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

  _.extend(requestedTodo, validatedAttributes);
  res.json(requestedTodo);


});

db.sequelInst.sync().then(function(){
  app.listen(PORT, function(){
    console.log('Express started on port: '+ PORT);
  });
});
