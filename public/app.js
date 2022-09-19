//自分自身の情報を入れる
const IAM = {
    token: null,  // トークン
    name: null,    // 名前
    is_join: false  // 入室中？
  };
  // メンバー一覧を入れる箱
const MEMBER = {
    0: "マスター"
  };
  
  //-------------------------------------
  // STEP1. Socket.ioサーバへ接続
  //-------------------------------------
  const socket = io();
  
  // 正常に接続したら
//   socket.on("connect", ()=>{
//     // 表示を切り替える
//     $("#nowconnecting").style.display = "none";   
//     $("#inputmyname").style.display = "block";    
//   });
  
  // トークンを発行されたら
  socket.on("token", (data)=>{
    IAM.token = data.token;

      // 表示を切り替える
  if( ! IAM.is_join ){
    $("#nowconnecting").style.display = "none";   // 「接続中」を非表示
    $("#inputmyname").style.display = "block";    // 名前入力を表示
    $("#txt-myname").focus();
  }
  });
  
  //-------------------------------------
  // STEP2. 名前の入力
  //-------------------------------------
  /**
   * [イベント] 名前入力フォームが送信された
   */
  $("#frm-myname").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();
  
    // 入力内容を取得する
    const myname = $("#txt-myname");
    if( myname.value === "" ){
      return(false);
    }
  
    // 名前をセット
    $("#myname").innerHTML = myname.value;

    // const log = $("#login-log");
    // const p = document.createElement("p");
    // p.innerHTML = `${myname.value}が入室しました。`;
    // log.insertBefore(p, log.firstChild);

    IAM.name = myname.value;

      // Socket.ioサーバへ送信
  socket.emit("join", {token:IAM.token, name:IAM.name});

  // ボタンを無効にする
  $("#frm-myname button").setAttribute("disabled", "disabled");

    // 表示を切り替える
    $("#inputmyname").style.display = "none";   // 名前入力を非表示
    $("#chat").style.display = "block";         // チャットを表示


  });


  /**
 * [イベント] 入室結果が返ってきた
 */
socket.on("join-result", (data)=>{
    //------------------------
    // 正常に入室できた
    //------------------------
    if( data.status ){
      // 入室フラグを立てる
      IAM.is_join = true;
  
      // すでにログイン中のメンバー一覧を反映
      for(let i=0; i<data.list.length; i++){
        const cur = data.list[i];
        if( ! (cur.token in MEMBER) ){
          addMemberList(cur.token, cur.name);
        }
      }
  
      // 表示を切り替える
      $("#inputmyname").style.display = "none";   // 名前入力を非表示
      $("#chat").style.display = "block";         // チャットを表示
      $("#msg").focus();
    }
    //------------------------
    // できなかった
    //------------------------
    else{
      alert("入室できませんでした");
    }
  
    // ボタンを有効に戻す
    $("#frm-myname button").removeAttribute("disabled");
  });
  
  
  
  //-------------------------------------
  // STEP3. チャット開始
  //-------------------------------------
  /**
   * [イベント] 発言フォームが送信された
   */
  $("#frm-post").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();
  
    // 入力内容を取得する
    const msg = $("#msg");
    if( msg.value === "" ){
      return(false);
    }
  
    // Socket.ioサーバへ送信
    socket.emit("post", {text: msg.value, token:IAM.token, name:IAM.name});
  
    // 発言フォームを空にする
    msg.value = "";
  });

  /**
 * [イベント] 退室ボタンが押された
 */
$("#frm-quit").addEventListener("submit", (e)=>{
    // 規定の送信処理をキャンセル(画面遷移しないなど)
    e.preventDefault();
  
    if( confirm("本当に退室しますか？") ){
      // Socket.ioサーバへ送信
      socket.emit("quit", {token:IAM.token});
  
      // ボタンを無効にする
      $("#frm-quit button").setAttribute("disabled", "disabled");
    }
  });
  
  /**
   * [イベント] 退室処理の結果が返ってきた
   */
  socket.on("quit-result", (data)=>{
    if( data.status ){
      gotoSTEP1();
    }
    else{
      alert("退室できませんでした");
    }
  
    // ボタンを有効に戻す
    $("#frm-quit button").removeAttribute("disabled");
  });
  
  /**
   * [イベント] 誰かが入室した
   */
  socket.on("member-join", (data)=>{
    if( IAM.is_join ){
      addMessageFromMaster(`${data.name}さんが入室しました`);
      addMemberList(data.token, data.name);
    }
  });
  
  /**
   * [イベント] 誰かが退室した
   */
  socket.on("member-quit", (data)=>{
    if( IAM.is_join ){
      const name = MEMBER[data.token];
      addMessageFromMaster(`${name}さんが退室しました`);
      removeMemberList(data.token);
    }
  });
  


  var container = document.getElementById('msglist');
  var containerscroll = container.scrollTop + container.offsetHeight
  
  /**
   * [イベント] 誰かが発言した
   */
  socket.on("member-post", (msg)=>{
    if( IAM.is_join ){
        const is_me = (msg.token === IAM.token);
        if(containerscroll == container.scrollHeight) {
            addMessage(msg, is_me);
            container.scrollTop = container.scrollHeight;
        } else {
            addMessage(msg, is_me);
        }
    }

  });

  /**
 * 最初の状態にもどす
 *
 * @return {void}
 */
function gotoSTEP1(){
    // NowLoadingから開始
    $("#nowconnecting").style.display = "block";  // NowLoadingを表示
    $("#inputmyname").style.display = "none";     // 名前入力を非表示
    $("#chat").style.display = "none";            // チャットを非表示
  
    // 自分の情報を初期化
    IAM.token = null;
    IAM.name  = null;
    IAM.is_join = false;
  
    // メンバー一覧を初期化
    for( let key in MEMBER ){
      if( key !== "0" ){
        delete MEMBER[key];
      }
    }
  
    // チャット内容を全て消す
    $("#txt-myname").value = "";     // 名前入力欄 STEP2
    $("#myname").innerHTML = "";     // 名前表示欄 STEP3
    $("#msg").value = "";            // 発言入力欄 STEP3
    $("#msglist").innerHTML = "";    // 発言リスト STEP3
    $("#memberlist").innerHTML = ""; // メンバーリスト STEP3
  
    // Socket.ioサーバへ再接続
    socket.close().open();
  }
  

  
  /**
   * 発言を表示する
   *
   * @param {object}  msg
   * @param {boolean} [is_me=false]
   * @return {void}
   */
  function addMessage(msg, is_me=false){
    const list = $("#msglist");
    const li = document.createElement("li");

    // マスターの発言
  if( msg.token === 0 ){
    li.className = "master"
    li.innerHTML = `<div class="msg-master msg-inner"><p class="text">${msg.text}</p></div>`;
  }


  
    //------------------------
    // 自分の発言
    //------------------------
    else if( is_me ){
      li.className = "me"
      if(msg.name == null) {
        li.innerHTML = `<div class="msg-me msg-inner"><p class="text">${msg.text}</p></div>`;
      } else {
        li.innerHTML = `<div class="msg-me msg-inner"><p class="name">@${msg.name}</p><p class="text">${msg.text}</p></div>`;
      }

      container.scrollTop = container.scrollHeight;
    }
    //------------------------
    // 自分以外の発言
    //------------------------
    else{
      li.className = "member"
      if(msg.name == null) {
        li.innerHTML = `<div class="msg-member msg-inner"><p class="text">${msg.text}</p></div>`;
      } else {
        li.innerHTML = `<div class="msg-member msg-inner"><p class="name">@${msg.name}</p><p class="text">${msg.text}</p></div>`;
      }
    }
  
    // リストの最初に追加
    list.insertBefore(li, list.firstChild);
  }



  /**
 * チャットマスターの発言
 *
 * @param {string} msg
 * @return {void}
 */
function addMessageFromMaster(msg){
    addMessage({token: 0, text: msg});
  }
  
  
  /**
   * メンバーリストに追加
   *
   * @param {string} token
   * @param {string} name
   * @return {void}
   */
  function addMemberList(token, name){
    const list = $("#memberlist");
    const li = document.createElement("li");
    li.setAttribute("id", `member-${token}`);
    if( token == IAM.token ){
      li.innerHTML = `<span class="member-me">@${name}</span>`;
    }
    else{
      li.innerHTML = `<span class="member-other">@${name}</span>`;
    }
  
    // リストの最後に追加
    list.appendChild(li);
  
    // 内部変数に保存
    MEMBER[token] = name;
  }
  
  /**
   * メンバーリストから削除
   *
   * @param {string} token
   * @return {void}
   */
  function removeMemberList(token){
    const id = `#member-${token}`;
    if( $(id) !== null ){
      $(id).parentNode.removeChild( $(id) );
    }
  
    // 内部変数から削除
    delete MEMBER[token];
  }