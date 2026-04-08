console.log("teste widget framer");

const box = document.createElement("div");
box.innerText = "WIDGET TESTE";
box.style.position = "fixed";
box.style.top = "20px";
box.style.left = "20px";
box.style.zIndex = "2147483647";
box.style.background = "red";
box.style.color = "white";
box.style.padding = "20px";
box.style.border = "3px solid yellow";

document.body.appendChild(box);
