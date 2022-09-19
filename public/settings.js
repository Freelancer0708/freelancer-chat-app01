var main = document.getElementById("main"); 
var msglist = document.getElementById("msglist"); 
var height = window.innerHeight;
// console.log(main);
// console.log(height);
main.style.height = height + "px";

if(window.innerWidth <= 768) {
    msglistheight = height - 300;
    msglist.style.height = msglistheight + "px";
}