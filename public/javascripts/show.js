$(function(){
  var listObject = getListObject();
  setName(listObject);
  getList(listObject);
});

// リスト名追加
function setName(name) {
  var $name = $('.list-head-block');
  $name.fadeOut(function(){
    $.get('list', function(lists){
      $.each(lists, function(index, list){
        if(name.id==list._id) {
          $name.append('<p id="list-head">'+list.name+'</p>');
        }
      });
      $name.fadeIn();
    });
  });
}

// リストID取得
function getListObject(){
  var arg = new Object;
  var pair=location.search.substring(1).split('&');
  for(var i=0;pair[i];i++) {
    var kv = pair[i].split('=');
    arg[kv[0]]=kv[1];
  }
  return arg;
}

// フォーム送信ボタンを押して、ToDoを追加して再表示
$('#todo-form').submit(function(){
  var listObject = getListObject();
  postList(listObject);
  return false;
});

/*
  完了/未完了ボタン
*/
$('.list').on('click', '.list-right', function(){
  var $error = $('.error');
  $error.children().remove();
  var id =  $(this).attr("id");
  $.get('todo', function(todos){
    $.each(todos, function(index, todo){
      if(id == todo._id) {
        var check;
        if(todo.isCheck == false) {
          todo.isCheck = true;
          check = true;
        } else {
          todo.isCheck = false;
          check = false;
        }
        $.post('/check', {todoId: id, check: check}, function(res){
          var listObject = getListObject();
          getList(listObject);
        });
      }
    });
  });
});

// ToDo一覧を表示
function getList(listObject) {
  var $list = $('.list');
  $list.children().remove();
  $list.fadeOut(function(){
    // todoにGETアクセス
    $.get('todo', function(arr) {
      var check = 0;
      $.each(arr, function(index, todo) {
          // リストに登録されたToDoのみ表示
          if(listObject.id == todo.list) {
              var limit = new Date(todo.limitDate);
              var create = new Date(todo.createdDate);
              $list.append('<div class="box js-box"></div><div class="todo-block"><div class="left"><p class="todo-contents">' + todo.text + '</p> <p class="todo-contents">期限 : ' + limit.toLocaleString() + '</p><p class="todo-contents">作成日 : '+ create.toLocaleString() +'</p></div><div class="list-right" id="' + todo._id + '"><p id="check-text">' + (todo.isCheck ? '完了' : '未完了') + '</p></div></div>');
              check++;
              if(todo.isCheck == true) {
                $("#"+todo._id).css({
                  'background': '#dc143c'
                });
              }
          }
      });
      if(check == 0) {
        var $error = $('.error');
        $error.append('<p id="error">登録されたToDoはありません</p>');
      }
      $list.fadeIn();
    });
  });
}

// フォームに入力されたToDoを追加
function postList(listObject) {
  $.get('todo', function(arr) {
    // フォームに入力された値を取得
    var name = $('#todo-name-input').val();
    var limitDate = new Date($('#limit-input').val());
    $('#todo-name-input').val('');
    $('#limit-input').val('');

    var list = listObject;
    var check = true;

    var $error = $('.error');
    $error.children().remove();

    name = escapeText(name);

    /*
      ToDo名のチェック
    */
    if(name.length == 0) {
      $error.append('<p id="error">何か入力して下さい</p>');
      check = false;
    } else if(name.length >= 31) {
      $error.append('<p id="error">ToDoの名称は30文字以内にして下さい</p>');
      check = false;
    }
    $.each(arr, function(index, todo) {
        if(listObject.id == todo.list) {
          if(todo.text == name) {
            $error.append('<p id="error">このToDo名は既に存在します</p>');
            check = false;
            next();
          }
        }
    });

    /*
      ToDo名が不正じゃなければPOST
    */
    if(check == true) {
      $.post('/todo', {name: name, limit: limitDate, list: list.id}, function(res) {
        var listObject = getListObject();
        getList(listObject);
      });
    }
  });
}

// 文字をエスケープする
function escapeText(text) {
  var TABLE_FOR_ESCAPE_HTML = {
    "&": "&amp;",
    "\"": "&quot;",
    "<": "&lt;",
    ">": "&gt;"
  };
  return text.replace(/[&"<>]/g, function(match) {
    return TABLE_FOR_ESCAPE_HTML[match];
  });
}
