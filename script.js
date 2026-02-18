//要素の呼び出し
const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");

// 保存されたタスクを読み込み（一番下のスクリプトで保存している）
const savedRaw = JSON.parse(localStorage.getItem("tasks") || "[]"); // ← localStorageの"tasks"キーを取り出し、JSONを配列に復元。なければ"[]"を使う

//昔の保存形式(文字列配列) → 新形式({text, done})に変換してから使う
const saved = savedRaw.map((t) => {
    if (typeof t === "string") { //tが文字列なら...
        return { text: t, done: false}; //textはtでdoneはfalseで返す
    }
    return t;
});

// forEachでsavedに保存されているテキストをひとつずつaddTaskに渡す
saved.forEach(addTask); //保存済みの各タスク文字列をaddTask()に渡してWriteする（画面に復元）

addBtn.addEventListener("click", () => { //←追加ボタンが押されたら…
  if (!input.value.trim()) return;  //入力が空ならなにもしない（trim()によって空白だけの入力をはじいてる）
  addTask(input.value); //addTask関数の呼び出し
  saveTasks();
  input.value = ""; //入力欄を空に戻す
});

//エンターでもタスクが追加される処理
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addBtn.click();
  }
});

//↓ addTask関数開始
function addTask(task) {   //←タスクを１件リストに追加する関数(ここで初めてaddTask関数が登場)　taskにinput.valueが代入される※２２行を参照

  let text;
  let done; //←　ここでtextとdoneを作っている
  
//↓taskの中身が「文字列で来たとき／オブジェクトで来たとき」の両方に対応
if (typeof task === "string") { //addTaskで受け取った値が文字列なら...
    // 新規追加のとき
    // task は "買い物" のような「文字だけ」で来る
    text = task;  // → その文字をそのままタスク名にする
    done = false; // → 新しく追加したタスクは当然まだ未完了
} else {
    // 保存データを読み込むとき
    // task は { text: "買い物", done: true } の形で来る
    text = task.text; // → 保存していたタスク名を使う
    done = !!task.done; // → 保存していた完了状態(true/false)を使う
};

  const li = document.createElement("li");  //←<li>の要素を作成（タスクの容器）

  const checkbox = document.createElement("input"); //←完了用のチェックボックスを作成
  checkbox.type = "checkbox"; //←<input type="checkbox">にする


  checkbox.checked = done; //チェックボックスにチェックが入っている = done
  li.classList.toggle("completed", done); //checkboxにチェックが入っているなら＝ doneならcompletedのクラスを付ける

  //表示用のspan
  const span = document.createElement("span");
  span.textContent = text; //受け取った文字列をテキストとして設定

  li.appendChild(checkbox); //liにチェックボックスを追加
  li.appendChild(span); //liに表示用テキストを追加
  list.appendChild(li); //完成したliをlistに追加
  
  //編集用のinput(最初は非表示)
  const editInput = document.createElement("input"); //←インライン編集用の<input>
  editInput.type = "text"; //<input type="text">にする
  editInput.value = text; //inputの中身
  editInput.style.display = "none"; //←初期は隠しておく

  li.appendChild(editInput); //liに編集用入力欄を追加（位置はspanの後）

  checkbox.addEventListener("change", () => { //チェック状態が変わった時　
    li.classList.toggle("completed", checkbox.checked); //liに"completed"というクラスを付け外し
    saveTasks(); // チェック状態も保存されるように
  });

  //編集開始(spanをクリック)
  span.addEventListener('click', () => { //←タスク名の<span>をクリックしたら編集開始
    span.style.display = "none";  // ← 表示用テキストを隠す
    editInput.style.display = "inline-block"; // ← 編集用入力欄を表示
    editInput.focus(); // ← フォーカスを与えてすぐ入力できるように
  });

  //編集した内容を保存
  editInput.addEventListener("blur", () => { // ← 入力欄からフォーカスが外れたら(確定とみなす)
    span.textContent = editInput.value; // ← 表示用テキストを入力内容に更新
    editInput.style.display = "none"; // ← 編集欄は再び隠す
    span.style.display = "inline"; // ← 表示用テキストを再表示
    saveTasks(); // ← 保存内容をlocalStorageへ反映 
  });

  // 編集欄でもEnterで確定（blurを発火させる）
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editInput.blur();
    }
  });
}; // ← addTask関数の終わり

const deleteBtn = document.getElementById("deleteBtn"); // ← 「削除」ボタン要素を取得

deleteBtn.addEventListener("click", () => { // ← 削除ボタンクリック時
  const items = document.querySelectorAll("#taskList li"); // ← リスト内の全<li>を取得

  //チェック済みのリストのみを集める
  const targets = [...items].filter(li => { // ← 配列に変換し、チェックされているものだけ抽出
    const delcheckbox = li.querySelector("input[type='checkbox']"); // ← 各li内のチェックボックスを取得
    return delcheckbox && delcheckbox.checked;  // ← チェックが入っているものを対象にしてこの後のコードに引き継ぐ
  });

  //削除対象がない場合
  if (targets.length === 0) { // ← 1件もチェックされていなければ
    alert("削除するタスクを選択してください"); // ← アラート表示
    return; // ← 処理中断
  };

  const Ok = window.confirm(`${targets.length}件のタスクを削除しますか？`);// ← 確認ダイアログ
  if (!Ok) return; // ← キャンセルされたら中断

  //削除を実行
  targets.forEach(li => li.remove()); // ← 対象<li>をDOMから削除

  saveTasks(); // ← 変更後の状態をlocalStorageに保存
});

//追加されたタスクをページを閉じても消えないように保存する
function saveTasks() { // ← 現在のリスト状態を保存する関数
  const tasks = [...list.children].map(li => { // ← 全<li>を配列化し、各<li>から文字列を取り出す
    const span = li.querySelector("span");  // ← 表示用テキストの<span>
    const input = li.querySelector("input[type='text']"); // ← 編集用<input>
    const checkbox = li.querySelector("input[type='checkbox']"); // チェック状態も保存する

    if (input.style.display !== "none") { // ← もし編集中(= inputが表示中)なら
      text = input.value; // ← 入力欄の内容を保存（編集中の内容を優先）
    } else {
      text = span.textContent;  // ← 通常は表示テキストを保存
    };

    //「タスク名」と「完了状態」をセットで保存
    return { text: text, done: checkbox.checked };
  });

  //"tasks"という引き出しの中に、JSON.stringify(tasks)という中身を入れるイメージ
  localStorage.setItem("tasks", JSON.stringify(tasks)); // ← 配列をJSON文字列にして"tasks"キーに保存
};

//ドラッグアンドドロップの実行
new Sortable(list, {
  animation: 150,

  //チェックボックス押したときのドラッグ動作が重ならないように
  filter: "input, button", // ← これら要素上ではドラッグ開始しない(無視する)指定
  preventOnFilter: false,
  
  onEnd: () => saveTasks() // ← 並び替えが終わったら保存（順序を保持する）
});