export default function AlertDiv(type, message) {
  var id = Math.random().toString(16).slice(2);
  var node = document.createElement("div");
  node.style.backgroundColor = type;
  node.style.fontWeight = "bold";
  node.style.border = "2px solid black";
  node.style.borderRadius = "5px";
  if (type === "red") node.style.color = "yellow";
  node.innerHTML = "<h3>" + message + "</h3>";
  node.id = id;
  document.getElementById("alertDiv").appendChild(node);
  setTimeout(() => {
    document.getElementById(id).hidden = true;
  }, 5000);
  return;
}
