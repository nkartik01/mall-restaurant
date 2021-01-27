export default function AlertDiv(type, message) {
  var id = Math.random().toString(16).slice(2);
  var node = document.createElement("div");
  node.style.backgroundColor = type;
  node.innerHTML = message;
  node.id = id;
  document.getElementById("alertDiv").appendChild(node);
  setTimeout(() => {
    document.getElementById(id).hidden = true;
  }, 3000);
  return;
}
