// イベントの設定
window.addEventListener('beforeunload', this.onUnload);
// イベントの設定解除
window.removeEventListener('beforeunload', this.onUnload);
onUnload(e) {
    e.preventDefault();
    e.returnValue = '';
}

var main = document.getElementById("main"); 
var msglist = document.getElementById("msglist"); 
var height = window.innerHeight;
// console.log(main);
// console.log(height);
main.style.height = height + "px";

if(window.innerWidth <= 768) {
    msglistheight = height - 260;
    msglist.style.height = msglistheight + "px";
}

