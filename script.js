let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Charge le JSON et affiche les cartes
async function loadData() {
  try {
    const response = await fetch('data.json');
    const data = await response.json();
    displayCards(data.sources);
    renderWishlist();
  } catch (error) {
    console.error("Erreur de chargement du JSON :", error);
  }
}

// Affiche toutes les cartes
function displayCards(sources) {
  const container = document.getElementById('cards');
  container.innerHTML = '';

  sources.forEach(source => {
    source.calls.forEach(call => {
      const card = createCard(call, source);
      container.appendChild(card);
    });
  });
}

// Crée une carte
function createCard(call, source) {
  const card = document.createElement('div');
  card.className = 'card';

  card.innerHTML = `
    <h2>${call.title}</h2>
    <p><strong>Structure :</strong> ${source.name}</p>
    <p>${call.note}</p>
    <p>📅 Date limite : ${call.deadline}</p>
    <a href="${call.url}" target="_blank">Voir le projet</a>
  `;

  const tagContainer = document.createElement('div');
  (source.tags.concat(call.tags || [])).forEach(tag => {
    const span = document.createElement('span');
    span.className='tag'; span.textContent=tag;
    tagContainer.appendChild(span);
  });
  card.appendChild(tagContainer);

  const wishlistBtn = document.createElement('button');
  wishlistBtn.className='wishlist-btn';
  wishlistBtn.textContent = wishlist.some(item => item.id === source.name+'::'+call.title) ? '⭐ Retirer' : '⭐ Ajouter';

  wishlistBtn.addEventListener('click', () => {
    toggleWishlist(call, source.name, wishlistBtn);
  });
  card.appendChild(wishlistBtn);

  return card;
}

// Ajouter/retirer de la wishlist et mettre à jour le bouton + encart
function toggleWishlist(call, sourceName, button){
  const id = sourceName+'::'+call.title;
  const index = wishlist.findIndex(item=>item.id===id);

  if(index === -1){
    wishlist.push({...call, source:sourceName, id});
    button.textContent = '⭐ Retirer';
  } else {
    wishlist.splice(index,1);
    button.textContent = '⭐ Ajouter';
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  renderWishlist();
}

// Met à jour la wishlist affichée dans l'encart
function renderWishlist(){
  const list = document.getElementById('wishlist-list');
  list.innerHTML = '';
  wishlist.forEach(item=>{
    const li = document.createElement('li');
    li.textContent = `${item.title} (${item.source})`;
    list.appendChild(li);
  });
}

// Télécharger PDF depuis la wishlist
function downloadWishlistPDF(){
  if(wishlist.length===0) return alert("Ta sélection est vide !");
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  wishlist.forEach((item, idx)=>{
    doc.setFontSize(12); doc.text(`${idx+1}. ${item.title}`,10,y); y+=6;
    doc.setFontSize(10); doc.text(`Structure : ${item.source}`,10,y); y+=5;
    doc.text(`Date limite : ${item.deadline}`,10,y); y+=5;
    doc.text(`Tags : ${(item.tags||[]).join(', ')}`,10,y); y+=5;
    doc.text(`Note : ${item.note}`,10,y); y+=10;
    if(y>270){ doc.addPage(); y=10; }
  });

  doc.save('wishlist.pdf');
}

document.getElementById('download-wishlist').addEventListener('click', downloadWishlistPDF);

loadData();
