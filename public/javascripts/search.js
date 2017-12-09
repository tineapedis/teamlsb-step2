// フォームを送信ボタンを押すと、Listを追加して再表示
$('#search-form').submit(function(){
  getTodo();
  getList();
  return false;
});

// ToDo一覧を取得して表示する
function getTodo() {
  var text = $('#search-text').val();
  var $count = $('.todo-count-block');
  $count.children().remove();
  // すでに表示されている一覧を非表示にして削除する
  var $list = $('.search-todo-block');
  $list.fadeOut(function(){
    $list.children().remove();
    var count = 0;
    $.get('todo', function(todos) {
      // 取得したToDoを追加していく
      $.each(todos, function(index, todo) {
        var limit = new Date(todo.limitDate);
        var create = new Date(todo.createdDate);
        $.get('list', function(lists) {
          for(var i = 0 ; i < lists.length ; i++) {
            if(text.length != 0) {
              if(todo.text.indexOf(text) > -1) {
                if(lists[i]._id == todo.list) {
                  var limitMonth = limit.getMonth() + 1
                  var createMonth = create.getMonth() + 1
                  $list.append('<div class="todo-block"><div class="left"><a id="todo-search-title" href="/show?id='+ todo.list + '"value=' + todo.list + '>' + todo.text + '</a><p id="todo-search-list-title">LIST:' + lists[i].name + '</p></div><div class="right"><p id="todo-search-limit"> 期限 : ' + limit.getFullYear() + '年' + limitMonth + '月' + limit.getDate() + '日</p><p id="todo-search-create">' + ' 作成日 : ' + create.getFullYear() + '年' + createMonth + '月' + create.getDate() + '日</p></div></div>');
                  count++;
                }
              }
            }
            /*
              ToDoがある場合完了済ToDo数表示
            */
            if(i == lists.length-1 && todos.length-1 == index) {
              if(count == 0) {
                $count.append('<p id="todo-count">対象のToDoは見つかりませんでした');
              } else $count.append('<p id="todo-count">ToDoが'+count+"件見つかりました</p>");
            }
          }
        });
      });
      $list.fadeIn();
    });
  });
}

function getList() {
  var text = $('#search-text').val();
  $('#search-text').val('');
  var $list = $('.search-list-block');
  var $count = $('.list-count-block');
  $count.children().remove();

  $list.fadeOut(function() {
    $list.children().remove();
    $.get('list', function(lists) {
      var count = 0;
      if(text.length != 0) {
        $.each(lists, function(index, list) {
          var create = new Date(list.createdDate);
          if(list.name.indexOf(text) > -1) {
            var creatMonth = create.getMonth() + 1;
            $list.append('<div class="list-search-block"><a id="search-list-title" href="/show?id=' +list._id + '" value=' +  list._id+'>' + list.name +'</a><div class="list_sub"><p id="list-search-limit">作成日 : ' + create.getFullYear() + '年' + creatMonth + '月' + create.getDate() + '日' + '</p></div></div>');
            count++;
          }
        });
      }
      if(count == 0) {
        $count.append('<p id="list-count">対象のListは見つかりませんでした</p>');
      } else $count.append('<p id="list-count">Listが' + count + '件見つかりました</p>');
      $list.fadeIn();
    });
  });
}
