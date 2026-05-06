// ══════════════════════════════════════════
//   DATA STORE
// ══════════════════════════════════════════
const STORAGE_KEY = 'suitshop_data';
const IMG_STORAGE_KEY = 'suitshop_images';

const defaultSuits = [
  { id:'S001', name:'Classic Black Tuxedo',    category:'Formal',   color:'Black',    sizes:'M, L, XL',    price:299, stock:24, sold:88,  year:2022, status:'active',   desc:'Elegant all-occasion black tuxedo.', images:[null,null,null,null] },
  { id:'S002', name:'Navy Blue Business Suit', category:'Business', color:'Navy Blue',sizes:'S, M, L',     price:249, stock:18, sold:142, year:2023, status:'active',   desc:'Sharp business-ready navy suit.',    images:[null,null,null,null] },
  { id:'S003', name:'White Wedding Suit',       category:'Wedding',  color:'White',    sizes:'M, L',        price:399, stock:12, sold:65,  year:2023, status:'active',   desc:'Premium white wedding collection.',  images:[null,null,null,null] },
  { id:'S004', name:'Slim Fit Casual Blazer',   category:'Casual',   color:'Charcoal', sizes:'S, M, L, XL', price:179, stock:30, sold:210, year:2024, status:'active',   desc:'Modern slim fit for casual outings.',images:[null,null,null,null] },
  { id:'S005', name:'Vintage Pinstripe Suit',   category:'Vintage',  color:'Grey',     sizes:'M, L',        price:189, stock:5,  sold:34,  year:2020, status:'low',      desc:'Classic 1940s-inspired pinstripe.',  images:[null,null,null,null] },
  { id:'S006', name:'1980s Double-Breasted',    category:'Vintage',  color:'Brown',    sizes:'M',           price:99,  stock:3,  sold:12,  year:2019, status:'outdated', desc:'Retro double-breasted jacket.',      images:[null,null,null,null] },
  { id:'S007', name:'Ivory Slim Wedding Suit',  category:'Wedding',  color:'Ivory',    sizes:'S, M, L',     price:459, stock:8,  sold:45,  year:2024, status:'active',   desc:'Slim ivory wedding suit.',           images:[null,null,null,null] },
  { id:'S008', name:'Charcoal Executive Suit',  category:'Business', color:'Charcoal', sizes:'M, L, XL',    price:319, stock:15, sold:98,  year:2023, status:'active',   desc:'Top-tier executive charcoal suit.',  images:[null,null,null,null] },
  { id:'S009', name:'Sky Blue Casual Suit',     category:'Casual',   color:'Sky Blue', sizes:'S, M',        price:199, stock:20, sold:72,  year:2024, status:'active',   desc:'Breathable sky blue casual suit.',   images:[null,null,null,null] },
  { id:'S010', name:'70s Retro Suit',           category:'Vintage',  color:'Mustard',  sizes:'M, L',        price:89,  stock:2,  sold:8,   year:2018, status:'outdated', desc:'Funky mustard-colored 70s throwback.',images:[null,null,null,null] },
];

let suits = JSON.parse(localStorage.getItem(STORAGE_KEY)) || JSON.parse(JSON.stringify(defaultSuits));
// Ensure all suits have images array
suits.forEach(s => { if(!s.images) s.images = [null,null,null,null]; });

let editingId = null;
let deleteId = null;
let activeFilter = 'all';
let activeView = 'grid';

// Temp image slots while modal is open
let tempImages = [null, null, null, null];

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(suits)); }
function genId() { return 'S' + String(Date.now()).slice(-4).padStart(3,'0'); }

// ══════════════════════════════════════════
//   IMAGE UPLOAD HANDLING
// ══════════════════════════════════════════
function handleImgUpload(slotIndex, input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    tempImages[slotIndex] = e.target.result;
    renderImgSlot(slotIndex, e.target.result);
  };
  reader.readAsDataURL(file);
}

function renderImgSlot(slotIndex, dataUrl) {
  const slot = document.getElementById('slot' + slotIndex);
  if (!slot) return;
  // Remove existing preview if any
  const oldImg = slot.querySelector('img.preview');
  if (oldImg) oldImg.remove();
  const placeholder = slot.querySelector('.img-slot-placeholder');

  if (dataUrl) {
    const img = document.createElement('img');
    img.className = 'preview';
    img.src = dataUrl;
    slot.insertBefore(img, placeholder);
    placeholder.style.display = 'none';
    slot.classList.add('has-img');
  } else {
    placeholder.style.display = 'flex';
    slot.classList.remove('has-img');
  }
}

function removeImg(slotIndex) {
  tempImages[slotIndex] = null;
  renderImgSlot(slotIndex, null);
  const slot = document.getElementById('slot' + slotIndex);
  if (slot) {
    const fileInput = slot.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  }
}

function loadImagesIntoSlots(images) {
  tempImages = images ? [...images] : [null,null,null,null];
  // Ensure 4 slots
  while(tempImages.length < 4) tempImages.push(null);
  for(let i=0; i<4; i++) {
    renderImgSlot(i, tempImages[i]);
  }
}

// ══════════════════════════════════════════
//   IMAGE VIEWER
// ══════════════════════════════════════════
function openImageViewer(suitId) {
  const s = suits.find(x => x.id === suitId);
  if (!s) return;
  const imgs = (s.images || []).filter(Boolean);
  if (!imgs.length) { toast('📷 No images uploaded for this suit yet.', 'info'); return; }

  document.getElementById('viewer-name').textContent = s.name;
  document.getElementById('viewer-meta').textContent = s.category + ' · ' + s.color + ' · $' + s.price;
  document.getElementById('viewer-main').src = imgs[0];

  const thumbsEl = document.getElementById('viewer-thumbs');
  thumbsEl.innerHTML = imgs.map((img, i) =>
    `<img class="viewer-thumb ${i===0?'active':''}" src="${img}" onclick="viewerSetMain(this,'${img}')" alt="Photo ${i+1}" />`
  ).join('');

  document.getElementById('imgViewerModal').classList.add('open');
}

function viewerSetMain(el, src) {
  document.getElementById('viewer-main').src = src;
  document.querySelectorAll('.viewer-thumb').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

// ══════════════════════════════════════════
//   NAVIGATION
// ══════════════════════════════════════════
const pages = { dashboard:'Dashboard', inventory:'Inventory', suits:'Suit Catalog', sales:'Sales Tracker', outdated:'Outdated Suits', categories:'Categories' };
const pageSubs = { dashboard:"Welcome back, Admin 👋", inventory:"Manage your suit stock", suits:"Browse all suit designs", sales:"Track revenue & sales", outdated:"Review old & discontinued suits", categories:"Manage suit categories" };

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const p = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.page').forEach(pg=>pg.classList.remove('active'));
    document.getElementById('page-'+p).classList.add('active');
    document.getElementById('pageTitle').textContent = pages[p];
    document.getElementById('pageSub').textContent = pageSubs[p];
    renderPage(p);
  });
});

function renderPage(p) {
  if(p==='dashboard') renderDashboard();
  if(p==='inventory') renderInventory();
  if(p==='suits') renderCatalog();
  if(p==='sales') renderSales();
  if(p==='outdated') renderOutdated();
  if(p==='categories') renderCategories();
}

// ══════════════════════════════════════════
//   THUMB STRIP HELPER
// ══════════════════════════════════════════
function thumbStrip(images, suitId) {
  const imgs = (images || []).filter(Boolean);
  if (!imgs.length) {
    return `<div class="thumb-strip"><div class="no-img" title="No images">📷</div></div>`;
  }
  const shown = imgs.slice(0,3);
  const extra = imgs.length - shown.length;
  return `<div class="thumb-strip" onclick="openImageViewer('${suitId}')" style="cursor:pointer" title="View photos">
    ${shown.map(img => `<img src="${img}" alt="suit" />`).join('')}
    ${extra > 0 ? `<div class="no-img" style="font-size:11px;font-weight:700;color:var(--accent)">+${extra}</div>` : ''}
  </div>`;
}

// ══════════════════════════════════════════
//   DASHBOARD
// ══════════════════════════════════════════
let salesChartInst, stockPieInst, salesLineInst;

function renderDashboard() {
  const stock = suits.reduce((a,s)=>a+s.stock,0);
  const sold = suits.reduce((a,s)=>a+s.sold,0);
  const outdated = suits.filter(s=>s.status==='outdated').length;
  document.getElementById('stat-stock').textContent = stock;
  document.getElementById('stat-sold').textContent = sold.toLocaleString();
  document.getElementById('stat-models').textContent = suits.length;
  document.getElementById('stat-outdated').textContent = outdated;
  document.getElementById('delta-stock').textContent = stock + ' units remaining';
  document.getElementById('delta-sold').textContent = sold + ' total sales';

  const cats = [...new Set(suits.map(s=>s.category))];
  const catSales = cats.map(c=>suits.filter(s=>s.category===c).reduce((a,s)=>a+s.sold,0));
  const colors = ['#7c6af7','#ec4899','#22d3ee','#f59e0b','#10b981','#ef4444','#a78bfa','#fb923c'];

  const ctx1 = document.getElementById('salesChart').getContext('2d');
  if(salesChartInst) salesChartInst.destroy();
  salesChartInst = new Chart(ctx1, {
    type:'bar',
    data:{ labels:cats, datasets:[{ data:catSales, backgroundColor:colors, borderRadius:8, borderSkipped:false }] },
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{ x:{ticks:{color:'#8884a8'},grid:{color:'#2e2e3e'}}, y:{ticks:{color:'#8884a8'},grid:{color:'#2e2e3e'}} } }
  });

  const catStocks = cats.map(c=>suits.filter(s=>s.category===c).reduce((a,s)=>a+s.stock,0));
  const ctx2 = document.getElementById('stockPieChart').getContext('2d');
  if(stockPieInst) stockPieInst.destroy();
  stockPieInst = new Chart(ctx2, {
    type:'doughnut',
    data:{ labels:cats, datasets:[{ data:catStocks, backgroundColor:colors, borderWidth:0, hoverOffset:8 }] },
    options:{ responsive:true, cutout:'65%', plugins:{ legend:{ position:'bottom', labels:{ color:'#8884a8', padding:12, font:{size:11} } } } }
  });

  const sorted = [...suits].sort((a,b)=>b.sold-a.sold).slice(0,5);
  const maxS = sorted[0]?.sold || 1;
  document.getElementById('topSellers').innerHTML = sorted.map((s,i)=>`
    <div class="progress-item">
      <div class="progress-label"><span>${s.name}</span><span style="color:var(--accent)">${s.sold} sold</span></div>
      <div class="prog-bar"><div class="prog-fill" style="width:${(s.sold/maxS)*100}%;background:${colors[i]}"></div></div>
    </div>`).join('');

  const catHealth = cats.map(c=>{
    const catSuits = suits.filter(s=>s.category===c);
    const totalStock = catSuits.reduce((a,s)=>a+s.stock,0);
    const totalSold = catSuits.reduce((a,s)=>a+s.sold,0);
    return { cat:c, pct: totalSold ? Math.round((totalStock/(totalStock+totalSold))*100) : 100 };
  });
  document.getElementById('stockHealth').innerHTML = catHealth.map((c,i)=>`
    <div class="progress-item">
      <div class="progress-label"><span>${c.cat}</span><span style="color:var(--muted)">${c.pct}% in stock</span></div>
      <div class="prog-bar"><div class="prog-fill" style="width:${c.pct}%;background:${colors[i]}"></div></div>
    </div>`).join('');
}

// ══════════════════════════════════════════
//   INVENTORY TABLE
// ══════════════════════════════════════════
function statusBadge(s) {
  if(s==='active') return `<span class="badge badge-active">✅ Active</span>`;
  if(s==='low') return `<span class="badge badge-low">⚠️ Low Stock</span>`;
  if(s==='outdated') return `<span class="badge badge-outdated">🔴 Outdated</span>`;
  return '';
}

function renderInventory() {
  let filtered = suits;
  if(activeFilter==='active') filtered = suits.filter(s=>s.status==='active');
  if(activeFilter==='low') filtered = suits.filter(s=>s.status==='low');
  if(activeFilter==='outdated') filtered = suits.filter(s=>s.status==='outdated');

  const search = document.getElementById('globalSearch').value.toLowerCase();
  if(search) filtered = filtered.filter(s=>s.name.toLowerCase().includes(search)||s.category.toLowerCase().includes(search));

  document.getElementById('inventoryTableBody').innerHTML = filtered.map(s=>`
    <tr>
      <td><span style="font-family:monospace;color:var(--muted)">${s.id}</span></td>
      <td>${thumbStrip(s.images, s.id)}</td>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge badge-cat">${s.category}</span></td>
      <td style="color:var(--muted)">${s.sizes}</td>
      <td><strong style="color:${s.stock<=5?'var(--red)':s.stock<=10?'var(--accent4)':'var(--green)'}">${s.stock}</strong></td>
      <td>${s.sold}</td>
      <td style="color:var(--accent4)"><strong>$${s.price}</strong></td>
      <td>${statusBadge(s.status)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openEdit('${s.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="askDelete('${s.id}')" style="margin-left:4px">🗑️</button>
      </td>
    </tr>`).join('');
}

document.querySelectorAll('.filter-chip').forEach(chip=>{
  chip.addEventListener('click', ()=>{
    document.querySelectorAll('.filter-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    activeFilter = chip.dataset.filter;
    renderInventory();
  });
});

// ══════════════════════════════════════════
//   CATALOG
// ══════════════════════════════════════════
const catIcons = { Formal:'🤵', Business:'💼', Wedding:'💍', Casual:'👕', Vintage:'🎩', 'Slim Fit':'🪡', Sports:'⚽', Custom:'✨' };

function renderCatalog() {
  const search = document.getElementById('globalSearch').value.toLowerCase();
  let filtered = search ? suits.filter(s=>s.name.toLowerCase().includes(search)||s.category.toLowerCase().includes(search)) : suits;

  document.getElementById('suitCatalogGrid').innerHTML = filtered.map(s=>{
    const imgs = (s.images||[]).filter(Boolean);
    const imgCount = imgs.length;
    const mainImg = imgs[0];

    return `<div class="suit-card">
      <div class="suit-card-img-preview" onclick="openImageViewer('${s.id}')" style="cursor:${imgCount?'pointer':'default'}">
        ${mainImg
          ? `<img src="${mainImg}" alt="${s.name}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-sm);" />`
          : `<span style="font-size:44px">${catIcons[s.category]||'🧥'}</span>`
        }
        ${imgCount > 0 ? `<span class="suit-card-img-count">📷 ${imgCount}</span>` : ''}
      </div>
      <div class="suit-card-name">${s.name}</div>
      <div class="suit-card-cat">${s.category} · ${s.color}</div>
      <div style="margin-bottom:10px">${statusBadge(s.status)}</div>
      <div class="suit-card-stats">
        <div class="suit-mini-stat"><div class="suit-mini-val" style="color:var(--accent)">${s.stock}</div>Stock</div>
        <div class="suit-mini-stat"><div class="suit-mini-val" style="color:var(--accent2)">${s.sold}</div>Sold</div>
        <div class="suit-mini-stat"><div class="suit-mini-val" style="color:var(--accent4)">$${s.price}</div>Price</div>
      </div>
      <div style="display:flex;gap:6px;margin-top:12px;">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="openEdit('${s.id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="askDelete('${s.id}')">🗑️</button>
      </div>
    </div>`;
  }).join('');

  document.getElementById('catalogListBody').innerHTML = filtered.map(s=>`
    <tr>
      <td>${s.id}</td>
      <td>${thumbStrip(s.images, s.id)}</td>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge badge-cat">${s.category}</span></td>
      <td>${s.color}</td>
      <td style="color:var(--accent4)">$${s.price}</td>
      <td>${s.stock}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="openEdit('${s.id}')">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="askDelete('${s.id}')">🗑️</button>
      </td>
    </tr>`).join('');
}

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    activeView = btn.dataset.view;
    document.getElementById('suitCatalogGrid').style.display = activeView==='grid'?'grid':'none';
    document.getElementById('suitCatalogList').style.display = activeView==='list'?'block':'none';
  });
});

// ══════════════════════════════════════════
//   SALES
// ══════════════════════════════════════════
function renderSales() {
  const totalSold = suits.reduce((a,s)=>a+s.sold,0);
  const totalRev = suits.reduce((a,s)=>a+(s.sold*s.price),0);
  const avgPrice = suits.length ? Math.round(suits.reduce((a,s)=>a+s.price,0)/suits.length) : 0;
  document.getElementById('stat-revenue').textContent = '$'+totalRev.toLocaleString();
  document.getElementById('stat-units').textContent = totalSold.toLocaleString();
  document.getElementById('stat-avgprice').textContent = '$'+avgPrice;

  const months = ['Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  const base = Math.round(totalSold/10);
  const monthData = months.map((_,i)=>Math.max(5, base + Math.round((Math.random()-.3)*base*.6)));
  const ctx = document.getElementById('salesLineChart').getContext('2d');
  if(salesLineInst) salesLineInst.destroy();
  salesLineInst = new Chart(ctx, {
    type:'line',
    data:{ labels:months, datasets:[{ data:monthData, borderColor:'#7c6af7', backgroundColor:'#7c6af720', fill:true, tension:.4, pointBackgroundColor:'#7c6af7' }] },
    options:{ responsive:true, plugins:{legend:{display:false}}, scales:{ x:{ticks:{color:'#8884a8'},grid:{color:'#2e2e3e'}}, y:{ticks:{color:'#8884a8'},grid:{color:'#2e2e3e'}} } }
  });

  document.getElementById('salesTableBody').innerHTML = [...suits].sort((a,b)=>b.sold-a.sold).map(s=>{
    const rev = s.sold*s.price;
    const pct = totalRev ? ((rev/totalRev)*100).toFixed(1) : 0;
    return `<tr>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge badge-cat">${s.category}</span></td>
      <td>${s.sold}</td>
      <td>$${s.price}</td>
      <td style="color:var(--green)"><strong>$${rev.toLocaleString()}</strong></td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="prog-bar" style="width:80px"><div class="prog-fill" style="width:${pct}%;background:var(--accent)"></div></div>
          <span style="font-size:12px;color:var(--muted)">${pct}%</span>
        </div>
      </td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════
//   OUTDATED
// ══════════════════════════════════════════
function renderOutdated() {
  const outdated = suits.filter(s=>s.status==='outdated');
  document.getElementById('outdatedTableBody').innerHTML = outdated.length ? outdated.map(s=>`
    <tr>
      <td style="font-family:monospace;color:var(--muted)">${s.id}</td>
      <td>${thumbStrip(s.images, s.id)}</td>
      <td><strong>${s.name}</strong></td>
      <td><span class="badge badge-cat">${s.category}</span></td>
      <td>${s.year||'N/A'}</td>
      <td><strong style="color:var(--red)">${s.stock}</strong></td>
      <td style="color:var(--accent4)">$${s.price}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="reactivate('${s.id}')">♻️ Reactivate</button>
        <button class="btn btn-danger btn-sm" onclick="askDelete('${s.id}')" style="margin-left:4px">🗑️ Remove</button>
      </td>
    </tr>`).join('') :
    `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--muted)">✅ No outdated suits found!</td></tr>`;
}

function reactivate(id) {
  const suit = suits.find(s=>s.id===id);
  if(suit){ suit.status='active'; save(); renderOutdated(); toast('♻️ Suit reactivated successfully!','success'); }
}

// ══════════════════════════════════════════
//   CATEGORIES
// ══════════════════════════════════════════
function renderCategories() {
  const cats = [...new Set(suits.map(s=>s.category))];
  const colors2 = ['#7c6af7','#ec4899','#22d3ee','#f59e0b','#10b981','#ef4444','#a78bfa','#fb923c'];
  document.getElementById('categoryCards').innerHTML = cats.map((c,i)=>{
    const catSuits = suits.filter(s=>s.category===c);
    const totalStock = catSuits.reduce((a,s)=>a+s.stock,0);
    const totalSold = catSuits.reduce((a,s)=>a+s.sold,0);
    return `<div class="suit-card" style="border-top:3px solid ${colors2[i%colors2.length]}">
      <div class="suit-card-icon">${catIcons[c]||'🧥'}</div>
      <div class="suit-card-name">${c}</div>
      <div class="suit-card-cat">${catSuits.length} models</div>
      <div class="suit-card-stats">
        <div class="suit-mini-stat"><div class="suit-mini-val" style="color:${colors2[i%colors2.length]}">${catSuits.length}</div>Models</div>
        <div class="suit-mini-stat"><div class="suit-mini-val" style="color:var(--green)">${totalStock}</div>In Stock</div>
        <div class="suit-mini-stat"><div class="suit-mini-val" style="color:var(--accent2)">${totalSold}</div>Sold</div>
      </div>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════
//   MODAL — ADD / EDIT
// ══════════════════════════════════════════
function openAdd() {
  editingId = null;
  document.getElementById('modalTitle').textContent = '➕ Add New Suit';
  document.getElementById('modalSub').textContent = 'Fill in the details to add a suit to inventory';
  document.getElementById('suitForm').reset();
  loadImagesIntoSlots([null,null,null,null]);
  document.getElementById('suitModal').classList.add('open');
}

function openEdit(id) {
  editingId = id;
  const s = suits.find(s=>s.id===id);
  if(!s) return;
  document.getElementById('modalTitle').textContent = '✏️ Edit Suit';
  document.getElementById('modalSub').textContent = `Editing: ${s.name}`;
  document.getElementById('f-name').value = s.name;
  document.getElementById('f-category').value = s.category;
  document.getElementById('f-color').value = s.color;
  document.getElementById('f-sizes').value = s.sizes;
  document.getElementById('f-price').value = s.price;
  document.getElementById('f-stock').value = s.stock;
  document.getElementById('f-sold').value = s.sold;
  document.getElementById('f-year').value = s.year||'';
  document.getElementById('f-status').value = s.status;
  document.getElementById('f-desc').value = s.desc||'';
  loadImagesIntoSlots(s.images || [null,null,null,null]);
  document.getElementById('suitModal').classList.add('open');
}

document.getElementById('addSuitBtn').addEventListener('click', openAdd);
document.getElementById('addSuitBtnInv').addEventListener('click', openAdd);
document.getElementById('closeModal').addEventListener('click', ()=>document.getElementById('suitModal').classList.remove('open'));

// Close image viewer
document.getElementById('imgViewerModal').addEventListener('click', function(e){
  if(e.target === this) this.classList.remove('open');
});
document.getElementById('suitModal').addEventListener('click', function(e){
  if(e.target === this) this.classList.remove('open');
});

document.getElementById('suitForm').addEventListener('submit', e=>{
  e.preventDefault();
  const data = {
    name: document.getElementById('f-name').value,
    category: document.getElementById('f-category').value,
    color: document.getElementById('f-color').value,
    sizes: document.getElementById('f-sizes').value,
    price: +document.getElementById('f-price').value,
    stock: +document.getElementById('f-stock').value,
    sold: +document.getElementById('f-sold').value || 0,
    year: +document.getElementById('f-year').value || new Date().getFullYear(),
    status: document.getElementById('f-status').value,
    desc: document.getElementById('f-desc').value,
    images: [...tempImages],
  };
  if(editingId) {
    const idx = suits.findIndex(s=>s.id===editingId);
    suits[idx] = { ...suits[idx], ...data };
    toast('✅ Suit updated successfully!', 'success');
  } else {
    suits.push({ id:genId(), ...data });
    toast('✅ New suit added!', 'success');
  }
  save();
  document.getElementById('suitModal').classList.remove('open');
  const activePage = document.querySelector('.nav-item.active')?.dataset.page;
  renderPage(activePage || 'dashboard');
});

// ══════════════════════════════════════════
//   DELETE
// ══════════════════════════════════════════
function askDelete(id) {
  deleteId = id;
  document.getElementById('confirmModal').classList.add('open');
}
document.getElementById('cancelDelete').addEventListener('click',()=>document.getElementById('confirmModal').classList.remove('open'));
document.getElementById('confirmDelete').addEventListener('click',()=>{
  suits = suits.filter(s=>s.id!==deleteId);
  save();
  document.getElementById('confirmModal').classList.remove('open');
  toast('🗑️ Suit deleted.','info');
  const activePage = document.querySelector('.nav-item.active')?.dataset.page;
  renderPage(activePage || 'dashboard');
});

// ══════════════════════════════════════════
//   SEARCH
// ══════════════════════════════════════════
document.getElementById('globalSearch').addEventListener('input', ()=>{
  const activePage = document.querySelector('.nav-item.active')?.dataset.page;
  if(activePage==='inventory') renderInventory();
  if(activePage==='suits') renderCatalog();
});

// ══════════════════════════════════════════
//   TOAST
// ══════════════════════════════════════════
function toast(msg, type='info') {
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(()=>el.remove(), 3200);
}

// ══════════════════════════════════════════
//   CHART.JS LOADER + INIT
// ══════════════════════════════════════════
function loadChartJS() {
  return new Promise(resolve=>{
    if(window.Chart){resolve();return;}
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.2/dist/chart.umd.min.js';
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

loadChartJS().then(()=>{
  Chart.defaults.color = '#8884a8';
  Chart.defaults.borderColor = '#2e2e3e';
  renderDashboard();
});
