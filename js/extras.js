// Resize responsive MicroSim iframes when an embedded simulation reports its height.
window.addEventListener('message', function (event) {
  if (!event.data || event.data.type !== 'microsim-resize') return;
  var iframes = document.querySelectorAll('iframe');
  for (var i = 0; i < iframes.length; i++) {
    if (iframes[i].contentWindow === event.source) {
      iframes[i].style.height = event.data.height + 'px';
      break;
    }
  }
});
