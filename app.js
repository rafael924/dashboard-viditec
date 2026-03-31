/* ================================================================
   app.js — Lógica del Dashboard Viditec
   ================================================================ */

// ── Mapeos de categorías solicitadas ────────────────────────

const CATS_IMP = [
  { martin: 'Accesorios Comprobación Eléctrica',           id: '132' },
  { martin: 'Cintas',                                      id: '129' },
  { martin: 'Multímetros Digitales',                       id: '85'  },
  { martin: 'Pinzas Amperométricas',                       id: '87'  },
  { martin: 'Comprobadores Eléctricos',                    id: '86'  },
  { martin: 'Rotuladoras',                                 id: '128' },
  { martin: 'Accesorios Medición de Temperatura',          id: '136' },
  { martin: 'Acc. Herram. y Comprob. Cableado Redes',      id: '137' },
  { martin: 'Herramientas Aisladas',                       id: '90'  },
  { martin: 'Herramientas de Mano',                        id: '123' },
  { martin: 'Microtools',                                  id: '125' },
  { martin: 'Termómetros de Contacto',                     id: '118' },
  { martin: 'Termómetros Infrarrojos',                     id: '119' },
  { martin: 'Accesorios Seguridad e Higiene',              id: '134' },
  { martin: 'Tacómetros',                                  id: '144' },
  { martin: 'Herramientas y Comprob. de cableado',         id: '122' },
  { martin: 'Herramientas de Energía Solar',               id: '95'  },
  { martin: 'Limpiadores de Fibra Óptica',                 id: '124' },
  { martin: 'Medidores Láser de Distancia',                id: '102' },
  { martin: 'Anemómetros',                                 id: '113' },
  { martin: 'Cámaras Termográficas',                       id: '121' },
  { martin: 'Microteléfono de prueba',                     id: '145' },
  { martin: 'Analizadores de Baterías',                    id: '92'  },
  { martin: 'Detector de Fuga de Gases Refrigerante',      id: '104' },
  { martin: 'Luxómetros',                                  id: '111' },
  { martin: 'Decibelímetros - Sonómetros',                 id: '112' },
  { martin: 'Medidores de espesor',                        id: '163' },
];

const CATS_AV = [
  { martin: 'Accesorios para Cámaras',                     id: '18'  },
  { martin: 'Cámaras de Cine y TV',                        id: '44'  },
  { martin: 'Conversores',                                 id: '10'  },
  { martin: 'Insumos para Grabación',                      id: '58'  },
  { martin: 'Captura y Reproducción',                      id: '8'   },
  { martin: 'Micrófonos',                                  id: '30'  },
  { martin: 'Encoders / Decoders / Receptores',            id: '47'  },
  { martin: 'Controladores de Audio',                      id: '40'  },
  { martin: 'Altoparlantes',                               id: '39'  },
  { martin: 'Transmisión y Codificación',                  id: '9'   },
  { martin: 'Procesadores',                                id: '29'  },
  { martin: 'Iluminación',                                 id: '68'  },
  { martin: 'Videoconferencia',                            id: '141' },
  { martin: 'Grabadores',                                  id: '11'  },
  { martin: 'Auriculares',                                 id: '50'  },
  { martin: 'PROYECTORS Y PANTALLAS',                      id: '167' },
  { martin: 'Cámaras PTZ y POV',                           id: '165' },
  { martin: 'Cables y Conectores',                         id: '164' },
  { martin: 'Monitores',                                   id: '166' },
  { martin: 'Switchers /Matrices p/Producción en Vivo',    id: '28'  },
];

// Nombres hardcoded para categorías huérfanas (no existen en JSONs de categorías)
const HUERFANAS = {
  '163': 'Medidores de espesor',
  '164': 'Cables y Conectores',
  '165': 'Cámaras PTZ y POV',
  '166': 'Monitores',
  '167': 'PROYECTORS Y PANTALLAS',
};

// ── Cache global de productos (se llena en iniciar()) ────────
var _todosLosProductos = [];

// ── Utilidades ──────────────────────────────────────────────

/** Aplana un árbol de categorías recursivamente → Map(id → name) */
function aplanarCategorias(arbol, mapa) {
  mapa = mapa || new Map();
  (arbol || []).forEach(function (cat) {
    if (cat.categoryId) mapa.set(cat.categoryId, cat.name);
    if (cat.categories && cat.categories.length) aplanarCategorias(cat.categories, mapa);
  });
  return mapa;
}

/** Cuenta productos activos con web_qsltec="1" por categoryId */
function contarPorCategoria(productos) {
  var conteo = {};
  productos.forEach(function (p) {
    if (p.isActive === '1' && p.web_qsltec === '1') {
      conteo[p.categoryId] = (conteo[p.categoryId] || 0) + 1;
    }
  });
  return conteo;
}

/** Genera HTML de tabla (filas clickeables) */
function renderTabla(filas, titulo) {
  if (filas.length === 0) {
    return '<p class="loading-msg">No hay categorías para mostrar.</p>';
  }

  var total = 0;
  var html = '<table>' +
    '<thead><tr>' +
    '<th>Categoría SERVICIO (Martin)</th>' +
    '<th>Categoría ERP</th>' +
    '<th>category_Id CRM</th>' +
    '<th>Productos Activos</th>' +
    '</tr></thead><tbody>';

  filas.forEach(function (f) {
    total += f.count;
    html += '<tr class="fila-clickeable" data-cat-id="' + esc(f.id) + '" data-cat-nombre="' + esc(f.martin) + '" title="Ver productos de esta categoría">' +
      '<td>' + esc(f.martin) + '</td>' +
      '<td>' + esc(f.erp) + '</td>' +
      '<td>' + esc(f.id) + '</td>' +
      '<td>' + f.count + '</td>' +
      '</tr>';
  });

  html += '</tbody><tfoot><tr>' +
    '<td colspan="3">TOTAL</td>' +
    '<td>' + total + '</td>' +
    '</tr></tfoot></table>';

  return html;
}

function esc(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ── Popup de productos por categoría ───────────────────────

function abrirPopupCategoria(catId, catNombre) {
  var productos = _todosLosProductos.filter(function (p) {
    return p.categoryId === catId;
  });

  var popup = document.getElementById('popup-categoria');
  var titulo = document.getElementById('popup-titulo');
  var cuerpo = document.getElementById('popup-cuerpo');

  titulo.textContent = catNombre + '  (id: ' + catId + ')  — ' + productos.length + ' producto(s)';
  cuerpo.textContent = JSON.stringify(productos, null, 2);

  popup.classList.add('popup-visible');
  document.body.classList.add('popup-open');
}

function cerrarPopupCategoria() {
  var popup = document.getElementById('popup-categoria');
  popup.classList.remove('popup-visible');
  document.body.classList.remove('popup-open');
}

/** Delega el click en filas de cualquier tabla de categorías */
function bindFilasClickeables() {
  document.addEventListener('click', function (e) {
    var fila = e.target.closest('tr.fila-clickeable');
    if (!fila) return;
    abrirPopupCategoria(fila.dataset.catId, fila.dataset.catNombre);
  });

  // Cerrar con Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') cerrarPopupCategoria();
  });
}

// ── Lógica principal ────────────────────────────────────────

function setEstado(msg, tipo) {
  var el = document.getElementById('estado');
  el.textContent = msg;
  el.className = tipo || '';
}

async function iniciar() {
  setEstado('Importando datos del ERP...');

  // 1. Importar
  try {
    var impRes = await fetch('/api/importar');
    var impData = await impRes.json();
    if (!impData.ok) throw new Error(impData.error || 'Error desconocido');
    setEstado('Importación OK (' + impData.productos + ' productos). Procesando...', 'ok');
  } catch (err) {
    setEstado('Importación falló: ' + err.message + '. Usando datos locales...', 'error');
  }

  // 2. Obtener datos
  try {
    var res = await fetch('/api/datos');
    if (!res.ok) throw new Error('No hay datos disponibles');
    var datos = await res.json();
  } catch (err) {
    setEstado('Error: ' + err.message, 'error');
    return;
  }

  var productos = datos.productos.items || datos.productos;
  _todosLosProductos = productos; // guardar para el popup

  var mapaImp   = aplanarCategorias(datos.categorias_imp);
  var mapaAv    = aplanarCategorias(datos.categorias);
  var conteo    = contarPorCategoria(productos);

  // IDs solicitados como Sets
  var idsImpSolicitados = new Set(CATS_IMP.map(function (c) { return c.id; }));
  var idsAvSolicitados  = new Set(CATS_AV.map(function (c) { return c.id; }));

  // ── Tabla 1: IMP solicitadas ──────────────────────────────
  var filasImpSol = CATS_IMP.map(function (c) {
    return {
      martin: c.martin,
      erp:    HUERFANAS[c.id] || mapaImp.get(c.id) || c.martin,
      id:     c.id,
      count:  conteo[c.id] || 0,
    };
  });

  // ── Tabla 2: IMP no solicitadas ───────────────────────────
  var filasImpNoSol = [];
  mapaImp.forEach(function (nombre, id) {
    if (!idsImpSolicitados.has(id) && conteo[id] > 0) {
      filasImpNoSol.push({ martin: nombre, erp: nombre, id: id, count: conteo[id] });
    }
  });
  // También incluir IDs huérfanos que pertenezcan a IMP pero no estén en el mapa
  Object.keys(conteo).forEach(function (id) {
    if (!idsImpSolicitados.has(id) && !mapaImp.has(id) && !mapaAv.has(id)) {
      // Producto en categoría que no existe en ningún JSON — ignorar (o podría ser huérfana no mapeada)
    }
  });
  filasImpNoSol.sort(function (a, b) { return b.count - a.count; });

  // ── Tabla 3: AV solicitadas ───────────────────────────────
  var filasAvSol = CATS_AV.map(function (c) {
    return {
      martin: c.martin,
      erp:    HUERFANAS[c.id] || mapaAv.get(c.id) || c.martin,
      id:     c.id,
      count:  conteo[c.id] || 0,
    };
  });

  // ── Tabla 4: AV no solicitadas ────────────────────────────
  var filasAvNoSol = [];
  mapaAv.forEach(function (nombre, id) {
    if (!idsAvSolicitados.has(id) && conteo[id] > 0) {
      filasAvNoSol.push({ martin: nombre, erp: nombre, id: id, count: conteo[id] });
    }
  });
  filasAvNoSol.sort(function (a, b) { return b.count - a.count; });

  // ── Render ────────────────────────────────────────────────
  document.getElementById('tabla-imp-solicitadas').innerHTML     = renderTabla(filasImpSol);
  document.getElementById('tabla-imp-no-solicitadas').innerHTML  = renderTabla(filasImpNoSol);
  document.getElementById('tabla-av-solicitadas').innerHTML      = renderTabla(filasAvSol);
  document.getElementById('tabla-av-no-solicitadas').innerHTML   = renderTabla(filasAvNoSol);

  var totalActivos = Object.keys(conteo).reduce(function (sum, k) { return sum + conteo[k]; }, 0);
  setEstado('Listo — ' + productos.length + ' productos totales, ' + totalActivos + ' activos con web_qsltec', 'ok');
}

// ── Arrancar ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  iniciar();
  bindFilasClickeables();
});

// ── Shopify: productos de "Instrumentos de Medición" ────────

var shopifyProductos = [];

async function cargarProductosShopify() {
  var btn = document.getElementById('btn-shopify');
  var contenedor = document.getElementById('tabla-shopify');
  btn.disabled = true;
  btn.textContent = '⏳ Cargando...';
  contenedor.innerHTML = '<p class="loading-msg">Obteniendo productos de Shopify…</p>';

  try {
    var res = await fetch('/api/shopify-products');
    var data = await res.json();
    if (!data.ok) throw new Error(data.error || 'Error desconocido');

    shopifyProductos = data.products;
    renderShopifyStats(data.stats);
    poblarFiltroVendor(data.products);
    filtrarYRenderShopify();
    btn.textContent = '🛍️ Recargar desde Shopify';
  } catch (err) {
    contenedor.innerHTML = '<p class="loading-msg" style="color:#f87171">❌ ' + esc(err.message) + '</p>';
    btn.textContent = '🛍️ Reintentar';
  }
  btn.disabled = false;
}

function renderShopifyStats(stats) {
  document.getElementById('shopify-stats').innerHTML =
    '<div class="stats-bar">' +
    '<span class="stat-chip">Total: <b>' + stats.total + '</b></span>' +
    '<span class="stat-chip stat-active">Active: <b>' + stats.active + '</b></span>' +
    '<span class="stat-chip stat-draft">Draft: <b>' + stats.draft + '</b></span>' +
    '</div>';
}

function poblarFiltroVendor(products) {
  var vendors = {};
  products.forEach(function (p) { if (p.vendor) vendors[p.vendor] = true; });
  var sel = document.getElementById('shopify-filtro-vendor');
  sel.innerHTML = '<option value="">Todos los vendors</option>';
  Object.keys(vendors).sort().forEach(function (v) {
    sel.innerHTML += '<option value="' + esc(v) + '">' + esc(v) + '</option>';
  });
}

function filtrarYRenderShopify() {
  var texto  = (document.getElementById('shopify-buscar').value || '').toLowerCase();
  var status = document.getElementById('shopify-filtro-status').value;
  var vendor = document.getElementById('shopify-filtro-vendor').value;

  var filtrados = shopifyProductos.filter(function (p) {
    if (status && p.status !== status) return false;
    if (vendor && p.vendor !== vendor) return false;
    if (texto) {
      var sku = (p.variants && p.variants[0] && p.variants[0].sku) || '';
      var hayTexto = (p.title || '').toLowerCase().indexOf(texto) !== -1 ||
                     (p.vendor || '').toLowerCase().indexOf(texto) !== -1 ||
                     sku.toLowerCase().indexOf(texto) !== -1 ||
                     (p.tags || '').toLowerCase().indexOf(texto) !== -1;
      if (!hayTexto) return false;
    }
    return true;
  });

  renderTablaShopify(filtrados);
}

function renderTablaShopify(products) {
  var contenedor = document.getElementById('tabla-shopify');
  if (products.length === 0) {
    contenedor.innerHTML = '<p class="loading-msg">No hay productos que coincidan.</p>';
    return;
  }

  var html = '<table class="shopify-table">' +
    '<thead><tr>' +
    '<th>#</th>' +
    '<th>Título</th>' +
    '<th>Vendor</th>' +
    '<th>Tipo</th>' +
    '<th>Status</th>' +
    '<th>SKU</th>' +
    '<th>Precio</th>' +
    '<th>Tags</th>' +
    '</tr></thead><tbody>';

  products.forEach(function (p, i) {
    var variant = (p.variants && p.variants[0]) || {};
    var statusClass = p.status === 'active' ? 'badge-active' :
                      p.status === 'draft'  ? 'badge-draft' : 'badge-archived';
    html += '<tr>' +
      '<td>' + (i + 1) + '</td>' +
      '<td>' + esc(p.title || '') + '</td>' +
      '<td>' + esc(p.vendor || '') + '</td>' +
      '<td>' + esc(p.product_type || '') + '</td>' +
      '<td><span class="badge ' + statusClass + '">' + esc(p.status || '') + '</span></td>' +
      '<td>' + esc(variant.sku || '') + '</td>' +
      '<td>' + esc(variant.price || '0.00') + '</td>' +
      '<td class="tags-cell">' + esc(p.tags || '') + '</td>' +
      '</tr>';
  });

  html += '</tbody><tfoot><tr><td colspan="8">Total: ' + products.length + ' productos</td></tr></tfoot></table>';
  contenedor.innerHTML = html;
}

// Bind filtros
document.addEventListener('DOMContentLoaded', function () {
  var buscar = document.getElementById('shopify-buscar');
  var filtroStatus = document.getElementById('shopify-filtro-status');
  var filtroVendor = document.getElementById('shopify-filtro-vendor');
  if (buscar) buscar.addEventListener('input', filtrarYRenderShopify);
  if (filtroStatus) filtroStatus.addEventListener('change', filtrarYRenderShopify);
  if (filtroVendor) filtroVendor.addEventListener('change', filtrarYRenderShopify);
});