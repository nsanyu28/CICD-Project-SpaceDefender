const vehicles = [
  { id: 'silverside', name: 'Silverside', type: 'Premium sedan', code: 'V-01', arrival: 6, price: 899, rating: 4.9, capacity: '3 pax', luggage: '2 bags', range: '420 km', comfort: '4.9', tag: 'Most popular', color: 'silver' },
  { id: 'northstar', name: 'Northstar', type: 'Luxury SUV', code: 'V-02', arrival: 8, price: 1299, rating: 4.8, capacity: '5 pax', luggage: '4 bags', range: '510 km', comfort: '4.8', tag: 'More room', color: 'black' },
  { id: 'pulse', name: 'Pulse RS', type: 'Performance EV', code: 'V-03', arrival: 11, price: 1799, rating: 4.9, capacity: '2 pax', luggage: '2 bags', range: '390 km', comfort: '4.9', tag: 'Fast arrival', color: 'red' },
  { id: 'lumen', name: 'Lumen Mini', type: 'Eco compact', code: 'V-04', arrival: 4, price: 699, rating: 4.7, capacity: '2 pax', luggage: '1 bag', range: '360 km', comfort: '4.7', tag: 'City smart', color: 'blue' }
];

const state = { service: 'On-demand ride', filter: 'All vehicles', sort: 'recommended', search: false, selectedVehicle: null };
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const formatRupees = (value) => `₹ ${value.toLocaleString('en-IN')}`;
const toast = (message) => { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => el.classList.remove('show'), 3000); };

function renderVehicles() {
  const grid = $('#vehicle-grid');
  let visible = vehicles.filter((vehicle) => state.filter === 'All vehicles' || vehicle.type === state.filter);
  if (state.sort === 'price') visible.sort((a, b) => a.price - b.price);
  if (state.sort === 'arrival') visible.sort((a, b) => a.arrival - b.arrival);
  if (state.sort === 'rating') visible.sort((a, b) => b.rating - a.rating);
  $('#result-count').textContent = visible.length;
  if (!visible.length) { grid.innerHTML = '<div class="empty-state">No vehicles match this preference yet. Try another filter.</div>'; return; }
  grid.innerHTML = visible.map((vehicle) => `
    <article class="vehicle-card reveal is-visible">
      <div class="vehicle-visual ${vehicle.color}-visual"><span class="visual-tag"><span class="live-dot"></span>${vehicle.tag}</span><div class="mini-ride"></div><span class="visual-code">${vehicle.code}</span></div>
      <h3>${vehicle.name}</h3><p class="type">${vehicle.type}</p>
      <div class="vehicle-specs"><span>${vehicle.capacity}</span><span>${vehicle.luggage}</span><span>${vehicle.range}</span></div>
      <div class="vehicle-foot"><div class="vehicle-price"><span>From</span><strong>${formatRupees(vehicle.price)}</strong><small> · ${vehicle.arrival} min away</small></div><button class="select-vehicle" data-vehicle="${vehicle.id}" type="button">Select</button></div>
    </article>`).join('');
  $$('.select-vehicle', grid).forEach((button) => button.addEventListener('click', () => openBooking(button.dataset.vehicle)));
}

function updateEstimate() {
  const pickup = $('#pickup').value.trim(); const destination = $('#destination').value.trim();
  const hasRoute = pickup && destination;
  const base = state.service === 'Airport transfer' ? 1499 : state.service === 'Hourly rental' ? 1199 : state.service === 'Business ride' ? 1099 : 899;
  $('#estimate-fare').textContent = hasRoute ? formatRupees(base) : '₹ 0';
  $('#estimate-distance').textContent = hasRoute ? '18.6 km' : '—';
  $('#estimate-time').textContent = hasRoute ? '42 min' : '—';
  $('#estimate-saved').textContent = hasRoute ? '2.4 kg CO₂' : '—';
}

function validateRide() {
  const pickup = $('#pickup').value.trim(); const destination = $('#destination').value.trim(); const date = $('#ride-date').value; const passengers = $('#passengers').value; const error = $('#form-error');
  if (!pickup || !destination || !date || !passengers) { error.textContent = 'Add your route, date, and passenger count to find a ride.'; return false; }
  if (pickup.toLowerCase() === destination.toLowerCase()) { error.textContent = 'Pickup and destination need to be different places.'; return false; }
  error.textContent = ''; return true;
}

function openBooking(vehicleId) {
  const vehicle = vehicles.find((item) => item.id === vehicleId); if (!vehicle) return;
  state.selectedVehicle = vehicle;
  $('#modal-pickup').textContent = $('#pickup').value || 'Bandra Kurla Complex';
  $('#modal-destination').textContent = $('#destination').value || 'Mumbai Airport · T2';
  $('#modal-vehicle').textContent = `${vehicle.name} · ${vehicle.type}`;
  const date = $('#ride-date').value ? new Date(`${$('#ride-date').value}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today';
  $('#modal-when').textContent = `${date} · ${$('#ride-time').value || '09:30'}`;
  $('#modal-fare').textContent = formatRupees(vehicle.price);
  $('#booking-modal').classList.add('open'); $('#booking-modal').setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
}

function closeBooking() { $('#booking-modal').classList.remove('open'); $('#booking-modal').setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); }

function showConfirmation() {
  const id = `VR-${Math.floor(1000 + Math.random() * 8999)}`; $('#booking-id').textContent = id; $('#confirmation').classList.add('show'); $('.booking-modal').classList.add('confirmed');
}

function setupEvents() {
  const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset()); $('#ride-date').min = today.toISOString().split('T')[0]; $('#ride-date').value = today.toISOString().split('T')[0];
  $$('.service-tab').forEach((tab) => tab.addEventListener('click', () => { $$('.service-tab').forEach((item) => item.classList.remove('active')); tab.classList.add('active'); state.service = tab.dataset.service; updateEstimate(); }));
  $$('.filter-pill').forEach((pill) => pill.addEventListener('click', () => { $$('.filter-pill').forEach((item) => item.classList.remove('active')); pill.classList.add('active'); state.filter = pill.dataset.filter; renderVehicles(); }));
  $('#sort-select').addEventListener('change', (event) => { state.sort = event.target.value; renderVehicles(); });
  $('#ride-form').addEventListener('submit', (event) => { event.preventDefault(); if (!validateRide()) return; state.search = true; updateEstimate(); renderVehicles(); $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }); toast(`Route locked. ${state.service} estimates are ready.`); });
  ['#pickup', '#destination'].forEach((selector) => $(selector).addEventListener('input', updateEstimate));
  $('.swap-button').addEventListener('click', () => { const oldPickup = $('#pickup').value; $('#pickup').value = $('#destination').value; $('#destination').value = oldPickup; updateEstimate(); });
  $('.locate').addEventListener('click', () => { $('#pickup').value = 'Bandra Kurla Complex'; updateEstimate(); toast('Pickup set to Bandra Kurla Complex.'); });
  $$('.modal-close, #close-confirmation').forEach((button) => button.addEventListener('click', () => { closeBooking(); $('.booking-modal').classList.remove('confirmed'); $('#confirmation').classList.remove('show'); }));
  $('#booking-modal').addEventListener('click', (event) => { if (event.target.id === 'booking-modal') closeBooking(); });
  $('#confirm-booking').addEventListener('click', () => { showConfirmation(); toast('Ride confirmed. See you soon.'); });
  $('.theme-toggle').addEventListener('click', () => { const light = document.documentElement.dataset.theme === 'light'; document.documentElement.dataset.theme = light ? 'dark' : 'light'; $('.theme-toggle .sun').style.display = light ? 'inline' : 'none'; $('.theme-toggle .moon').style.display = light ? 'none' : 'inline'; });
  $$('[data-toast]').forEach((button) => button.addEventListener('click', () => toast(button.dataset.toast)));
  $('#newsletter-form').addEventListener('submit', (event) => { event.preventDefault(); event.currentTarget.reset(); toast('You’re on the list.'); });
}

function setupReveal() { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); }), { threshold: .12 }); $$('.reveal').forEach((element) => observer.observe(element)); }

renderVehicles(); setupEvents(); setupReveal(); updateEstimate();
