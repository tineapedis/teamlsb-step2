var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require('url');

var index = require('./routes/index');
var users = require('./routes/users');
var search = require('./routes/search');
var show = require('./routes/show');

var app = express();

// MongoDBに接続
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/todo_list', {useMongoClient: true});

var Schema = mongoose.Schema;
// ToDoスキーマ定義する
var todoSchema = new Schema({
  isCheck     : {type: Boolean, default: false},
  text        : String,
  createdDate : {type: Date, default: Date.now},
  limitDate   : Date,
  list: { type: Schema.Types.ObjectId, ref: 'List' }
});
mongoose.model('Todo', todoSchema);
// Listスキーマ定義
var listSchema = new Schema({
  name : String,
  createdDate : {type: Date, default: Date.now},
  todos: [{ type: Schema.Types.ObjectId, ref: 'Todo' }]
});
mongoose.model('List', listSchema);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/search', search);
app.use('/show', show);


// listにGETアクセスしたとき、List一覧を取得するAPI
app.get('/list', function(req, res) {
  var List = mongoose.model('List');
  // すべてのListを取得して送る
  List.find({}, function(err, lists) {
    res.send(lists);
  });
});

// checkにPOSTアクセス
app.post('/check', function(req, res) {
  todo = mongoose.model('Todo');
  todo.findById(req.body.todoId, function(err, cTodo) {
    cTodo.isCheck = req.body.check;
    cTodo.save(function(err){});
  });
  res.send(true);
});

// listにPOSTアクセスしたとき、Listを追加するAPI
app.post('/list', function(req, res) {
  var list_name = req.body.name;
  // Listの名前があればMongoDBに保存
  if(list_name) {
    var List = mongoose.model('List');
    var list = new List();
    list.name = list_name;
    list.save();

    res.send(true);
  } else {
    res.send(false);
  }
});

// todoにGETアクセスしたとき、ToDo一覧を取得するAPI
app.get('/todo', function(req, res) {
  var Todo = mongoose.model('Todo');
  Todo.find({}, function(err, todos) {
    res.send(todos);
  }).sort({'createdDate': -1});
});

// tododateにGETアクセスした時、 期限でソートしたToDo一覧を取得するAPI
app.get('/tododate', function(req, res) {
  var Todo = mongoose.model('Todo');
  Todo.find({}, function(err, todos) {
    res.send(todos);
  }).sort({'limitDate': -1});
});

// /todoにPOSTアクセスしたとき、ToDoを追加するAPI
app.post('/todo', function(req, res) {
  var name = req.body.name;
  var limit = req.body.limit;
  var listId = req.body.list;

  // ToDoの名前と期限のパラーメタがあればMongoDBに保存
  if(name && listId) {
    var Todo = mongoose.model('Todo');
    var todo = new Todo();
    todo.text = name;
    todo.limitDate = limit;
    todo.list = listId;
    todo.save();
    res.send(true);

    var List = mongoose.model('List');
    List.findOne({ _id: listId }, function(err, post) {
      if (!err) {
        post.todos.push(todo._id);
        post.save();
      } else {
      }
    });
  } else {
    res.send(false);
  }
});

// showにGETアクセスしたときのAPI
app.get('/show', function(req, res) {
  var id = req.query.id;
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
