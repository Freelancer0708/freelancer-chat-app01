const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);

/**
 * "/"にアクセスがあったらindex.htmlを返却
 */
app.get("/", (req, res)=>{
  res.sendFile(__dirname + "/index.html");
});

app.get("/style.css", (req, res)=>{
  res.sendFile(__dirname + "/style.css");
});

/**
 * [イベント] ユーザーが接続
 */
io.on("connection", (socket)=>{
  console.log("ユーザーが接続しました");

  socket.on("post", (msg)=>{
    io.emit("member-post", msg);
  });
});

/**
 * 3000番でサーバを起動する
 */
 http.listen(process.env.PORT || 3000, ()=>{
  console.log("listening on *:3000");
});