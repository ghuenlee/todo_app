var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var bcrypt = require('bcrypt');
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
  var where = {
    id: paramId
  }
  db.todo.destroy({ where: where }).then(function(rowsDeleted){
    if(rowsDeleted > 0){
      res.send("Successfully deleted " + rowsDeleted + " todo!");
    }
    else {
      res.status(404).send("No row deleted. please check the provided id.");
    }
  }, function(e){
    res.status(500).send("Server Error");
  });
});

app.put('/todos/:id', function(req,res){
  var body =_.pick(req.body, 'description', 'completed');
  var attributes = {};
  var paramId = parseInt(req.params.id, 10);

  if( body.hasOwnProperty('completed')){
    attributes.completed = body.completed;
  }

  if( body.hasOwnProperty('description')) {
    attributes.description = body.description;
  }

  db.todo.findById(paramId)
  .then(function(todo){ // First Promise Chain
    if(todo){
      return todo.update(attributes, { typeValidation: true });
    }
    else{
      res.status(404).send("No todo corresponding to id");
    }
  }, function () {
    res.status(500).send("Server Error");
  })
  .then(function(todo) { // Second Promise Chain
    res.send(todo);
  }, function (e){
    res.status(400).json(e);
  });

});
app.get('/users', function(req,res){
  db.user.findAll().then(function(users){
    res.json(users);
  }, function(e){
    res.status(500).send("Server Error");
  })
})

app.post('/users', function(req,res){
  var body =_.pick(req.body, 'email', 'password');

  db.user.create(body).then(function(user){
    res.json(user.toPublicJSON());
  }, function(e){
    res.status(400).json(e);
  });
});

app.post('/users/login', function(req,res){
  var body = _.pick(req.body, 'email', 'password');
  if(typeof body.email == 'string' && body.email.length > 0 && typeof body.password == 'string' && body.password.length > 0) {
    body.email = body.email.toLowerCase();
    db.user.findOne({
      where: {
        email: body.email
      }
    })
    .then( function(user){
      if(!user || !bcrypt.compareSync(body.password, user.get('hashedPassword'))){
        res.status(401).send();
      }else {
        res.status(200).json(user.toPublicJSON());
      }


    }, function(e){
      res.status(500).send("Server Error");
    })

  }
});

db.sequelInst.sync(/*{force: true}*/).then(function(){
  app.listen(PORT, function(){
    console.log('Express started on port: '+ PORT);
  });
});
