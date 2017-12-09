$(function(){
  getList();
});

// Listを追加して再表示
$('#list-form').submit(function(){
  error();
  postList();
  return false;
});

/*
  入力されたList名のチェック
*/
function error() {
  var $error = $('.error');
  $error.children().remove();
  var listName = $('#list-name').val();
  listName = escapeText(listName);
  if(listName.length == 0) {
    $error.append('<p id="error">何か入力してください</p>');
  } else if (listName.length > 30) {
    $error.append('<p id="error">ToDo-Listの名称は30文字以内にして下さい</p>');
  }
}

// Listを取得して表示
function getList() {
  // すでに表示されている一覧を非表示にして削除
  var $list = $('.list-item');
  $list.fadeOut(function(){
    $list.children().remove();
    // listにGETアクセス
    $.get('list', function(lists) {
      $.get('tododate', function(todos) {
        var limit;
        $.each(lists, function(index, list) {
          var check = 0;
          for(var i = 0 ; i < todos.length ; i++) {
            // List内の完了済みToDoを数える
            if(todos[i].isCheck == true && (list._id == todos[i].list)) {
              check++;
            }
            // ToDoの期限取得
            if(list.todos[list.todos.length-1] == todos[i]._id) {
              limit = new Date(todos[i].limitDate);
            }
          }
          if(list.todos.length == 0) {
            $list.append('<div class="todo-item"><a id="list-title" href="/show?id='+list._id + '" value=' +  list._id+'>' + list.name +'</a><div class="list-sub"><p id="checks-text">ToDoがありません</p></div></div>');
          } else {
            var month = limit.getMonth() + 1
            $list.append('<div class="todo-item"><a id="list-title" href="/show?id='+list._id + '" value=' +  list._id+'>' + list.name +'</a><div class="list-sub"><p id="checks-text">'+ list.todos.length + '個中' + check + '個がチェック済み</p><p id="limit-text">~'+ limit.getFullYear()　+ '年' + month + '月' + limit.getDate() +  '日' + '</p></div></div>');
          }
          limit = new Date(1999, 1, 1);
        });
      });
      // 一覧を表示
      $list.fadeIn();
    });
  });
}


// フォームに入力されたToDoを追加
function postList() {
  var listName = $('#list-name').val();
  listName = escapeText(listName);
  $('#list-name').val('');

  if(listName.length <= 30 ) {
    $.get('list', function(lists) {
      if(lists.length == 0) {
        getList();
      } else {
        $.each(lists, function(index, list) {
          var check = true;
          if(list.name == listName) {
            var $error = $('.error');
            $error.children().remove();
            $error.append('<p id="error">そのリスト名は既に存在します</p>');
            check = false;
            getList();
            next();
          }
          if(lists.length-1 == index && check == true) {
            $.post('/list', {name: listName}, function(res){
              getList();
            });
          }
        });
      }
    });
  }
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
