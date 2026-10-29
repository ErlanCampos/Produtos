  // Bloqueia o clique com o botão direito (menu de contexto)
  document.addEventListener('contextmenu', event => event.preventDefault());

  // Impede que as imagens sejam arrastadas com o rato
  document.addEventListener('dragstart', event => {
    if (event.target.tagName.toLowerCase() === 'img') {
      event.preventDefault();
    }
  });

  // Tenta bloquear atalhos do teclado (F12, Ctrl+Shift+I, Ctrl+U)
  document.addEventListener('keydown', event => {
    if (event.key === 'F12' || 
       (event.ctrlKey && event.shiftKey && event.key === 'I') || 
       (event.ctrlKey && event.key === 'U')) {
      event.preventDefault();
    }
  });
