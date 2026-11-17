document.getElementById('year').textContent = new Date().getFullYear();

// Category-separated gallery. Images are displayed with natural proportions (no crop).
const galleryGrid = document.getElementById('galleryGrid');
const galleryFilters = document.getElementById('galleryFilters');
let activeGalleryFilter = 'All';
let galleryItems = [];

function addGalleryItem({src, name, category, alt}) {
  const card = document.createElement('figure');
  card.className = 'gallery-item';
  card.dataset.category = category || 'Other';
  const img = document.createElement('img');
  img.src = src;
  img.alt = alt || name || `${category || 'Studio Thapas'} photograph`;
  img.loading = 'lazy';
  img.decoding = 'async';
  const caption = document.createElement('figcaption');
  caption.className = 'gallery-caption';
  const title = document.createElement('span'); title.textContent = name || 'Studio Thapas';
  const tag = document.createElement('small'); tag.textContent = category || 'Other';
  caption.append(title, tag); card.append(img, caption); galleryGrid.append(card);
  galleryItems.push(card);
}
function applyGalleryFilter(category) {
  activeGalleryFilter = category;
  galleryItems.forEach(card => { card.hidden = category !== 'All' && card.dataset.category !== category; });
  galleryFilters.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === category));
  const visible = galleryItems.filter(card => !card.hidden).length;
  const empty = galleryGrid.querySelector('.gallery-empty');
  if (!visible && !empty) { const p=document.createElement('p'); p.className='gallery-empty'; p.textContent=`No ${category === 'All' ? '' : category + ' '}photos yet. Please check back soon.`; galleryGrid.append(p); }
  else if (visible && empty) empty.remove();
  else if (!visible && empty) empty.textContent=`No ${category === 'All' ? '' : category + ' '}photos yet. Please check back soon.`;
}
galleryFilters.addEventListener('click', e => { const btn=e.target.closest('button[data-filter]'); if(btn) applyGalleryFilter(btn.dataset.filter); });

// Public gallery: albums managed in the Photo Admin (/admin/) are stored in images/gallery/photos.json.
fetch('images/gallery/photos.json', {cache: 'no-cache'})
  .then(response => response.ok ? response.json() : [])
  .then(albums => albums.forEach(album => (album.photos || []).forEach(src =>
    addGalleryItem({src, name: album.title, category: album.category, alt: `${album.title} – ${album.category} photography by Studio Thapas`}))))
  .catch(error => console.warn('Gallery could not be loaded.', error))
  .finally(() => applyGalleryFilter(activeGalleryFilter));


// Click any gallery photo to open a full-screen viewer with zoom controls.
const photoLightbox = document.getElementById('photoLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxStage = document.getElementById('lightboxStage');
const zoomResetButton = document.getElementById('zoomReset');
let currentZoom = 1;
let currentPhotoIndex = 0;
let pinchStartDistance = 0;
let pinchStartZoom = 1;
let swipeStartX = 0;
let swipeStartY = 0;
function getVisibleGalleryImages() {
  return [...galleryGrid.querySelectorAll('.gallery-item:not([hidden]) img')];
}
function showPhotoAt(index) {
  const photos = getVisibleGalleryImages();
  if (!photos.length) return;
  currentPhotoIndex = (index + photos.length) % photos.length;
  const img = photos[currentPhotoIndex];
  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt || 'Studio Thapas photograph';
  setPhotoZoom(1);
  document.getElementById('lightboxPrev').disabled = photos.length < 2;
  document.getElementById('lightboxNext').disabled = photos.length < 2;
}
function setPhotoZoom(value) {
  currentZoom = Math.min(4, Math.max(1, value));
  lightboxImage.style.transform = `scale(${currentZoom})`;
  zoomResetButton.textContent = `${Math.round(currentZoom * 100)}%`;
}
function openPhotoViewer(img) {
  const photos = getVisibleGalleryImages();
  currentPhotoIndex = Math.max(0, photos.indexOf(img));
  showPhotoAt(currentPhotoIndex);
  photoLightbox.classList.add('open');
  photoLightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightboxClose').focus();
}
function closePhotoViewer() {
  photoLightbox.classList.remove('open');
  photoLightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.removeAttribute('src');
  document.body.style.overflow = '';
}
galleryGrid.addEventListener('click', e => {
  const img = e.target.closest('.gallery-item img');
  if (img) openPhotoViewer(img);
});
document.getElementById('lightboxClose').addEventListener('click', closePhotoViewer);
document.getElementById('lightboxPrev').addEventListener('click', () => showPhotoAt(currentPhotoIndex - 1));
document.getElementById('lightboxNext').addEventListener('click', () => showPhotoAt(currentPhotoIndex + 1));
document.getElementById('zoomIn').addEventListener('click', () => setPhotoZoom(currentZoom + 0.25));
document.getElementById('zoomOut').addEventListener('click', () => setPhotoZoom(currentZoom - 0.25));
zoomResetButton.addEventListener('click', () => setPhotoZoom(1));
photoLightbox.addEventListener('click', e => { if (e.target === photoLightbox) closePhotoViewer(); });
lightboxStage.addEventListener('wheel', e => {
  e.preventDefault(); setPhotoZoom(currentZoom + (e.deltaY < 0 ? 0.15 : -0.15));
}, {passive:false});
lightboxStage.addEventListener('dblclick', () => setPhotoZoom(currentZoom === 1 ? 2 : 1));
lightboxStage.addEventListener('touchstart', e => {
  if (e.touches.length === 1) { swipeStartX = e.touches[0].clientX; swipeStartY = e.touches[0].clientY; }
  if (e.touches.length === 2) {
    pinchStartDistance = Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    pinchStartZoom = currentZoom;
  }
}, {passive:true});
lightboxStage.addEventListener('touchmove', e => {
  if (e.touches.length === 2 && pinchStartDistance) {
    e.preventDefault();
    const distance = Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
    setPhotoZoom(pinchStartZoom * distance / pinchStartDistance);
  }
}, {passive:false});
lightboxStage.addEventListener('touchend', e => {
  if (e.touches.length < 2) pinchStartDistance = 0;
  if (e.changedTouches.length && currentZoom === 1) {
    const dx = e.changedTouches[0].clientX - swipeStartX;
    const dy = e.changedTouches[0].clientY - swipeStartY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) showPhotoAt(currentPhotoIndex + (dx < 0 ? 1 : -1));
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && photoLightbox.classList.contains('open')) closePhotoViewer();
  if (photoLightbox.classList.contains('open') && e.key === 'ArrowRight') showPhotoAt(currentPhotoIndex + 1);
  if (photoLightbox.classList.contains('open') && e.key === 'ArrowLeft') showPhotoAt(currentPhotoIndex - 1);
  if (e.key === '+' || e.key === '=') { if (photoLightbox.classList.contains('open')) setPhotoZoom(currentZoom + 0.25); }
  if (e.key === '-') { if (photoLightbox.classList.contains('open')) setPhotoZoom(currentZoom - 0.25); }
});

document.querySelectorAll('.package-cta').forEach(link=>link.addEventListener('click',()=>{const select=document.querySelector('select[name="package"]');if(select){const name=link.dataset.package;select.value=[...select.options].find(o=>o.textContent.startsWith(name))?.value||'';}}));
document.getElementById('bookingForm').addEventListener('submit',function(e){e.preventDefault();const data=new FormData(this);const message=`Hello Studio Thapas,\nName: ${data.get('name')}\nPhone: ${data.get('phone')}\nService: ${data.get('service')}\nPackage: ${data.get('package')||'Not selected'}\nMessage: ${data.get('message')||''}`;window.open(`https://wa.me/9779841419161?text=${encodeURIComponent(message)}`,'_blank');});
