// Script para remover tela de loading quando o React carregar
window.addEventListener('load', function() {
  setTimeout(function() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
      setTimeout(function() {
        loadingScreen.style.display = 'none';
      }, 500);
    }
  }, 1000);
});
