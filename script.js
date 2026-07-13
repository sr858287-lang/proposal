/* ══════════════════════════════════════════
   State & helpers
═════════════════════════════════════════════════ */

const responseData = {
  dessert: '',
  flower: '',
  colour: '',
  place: '',
  food: '',
  accepted: null,
  createdAt: ''
};

function goto(n) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('s' + n);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showFeedback(elId, msg, color) {
  const el = document.getElementById(elId);
  if (el) {
    el.textContent = msg;
    el.style.color = color || '#6b7280';
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DateProposalDB', 1);
    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('responses')) {
        db.createObjectStore('responses', { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function saveResponse(data) {
  return openDatabase().then(db => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('responses', 'readwrite');
      const store = transaction.objectStore('responses');
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  });
}

function handleDessert() {
  const dessertInput = document.getElementById('dessert-input');
  const value = dessertInput.value.trim();
  if (!value) {
    showFeedback('dessert-feedback', 'Please enter your favourite dessert 😊', '#e9618a');
    return;
  }
  responseData.dessert = value;
  showFeedback('dessert-feedback', 'Thats a nice choice, ' + value + '!', '#22c55e');
  setTimeout(() => goto(2), 700);
}

function handleFlower() {
  const flowerInput = document.getElementById('flower-input');
  const value = flowerInput.value.trim();
  if (!value) {
    showFeedback('flower-feedback', 'Please share your favourite flower 😊', '#e9618a');
    return;
  }
  responseData.flower = value;
  showFeedback('flower-feedback', 'Perfect, beautiful just like you!', '#22c55e');
  setTimeout(() => goto(3), 700);
}

function buildOptions(containerId, items) {
  const wrap = document.getElementById(containerId);
  wrap.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'opt-btn';
    btn.innerHTML = `<span class="icon">${item.icon}</span>${item.label}`;
    btn.onclick = () => item.handler(btn);
    wrap.appendChild(btn);
  });
}

function chooseColour(btn, colour) {
  responseData.colour = colour;
  document.querySelectorAll('#color-options button').forEach(b => b.classList.remove('correct'));
  btn.classList.add('correct');
  showFeedback('color-feedback', `Great choice — ${colour} is lovely!`, '#22c55e');
  setTimeout(() => goto(4), 700);
}

function choosePlace(btn, place) {
  responseData.place = place;
  document.querySelectorAll('#place-options button').forEach(b => b.classList.remove('correct'));
  btn.classList.add('correct');
  showFeedback('place-feedback', `That sounds wonderful — ${place}!`, '#22c55e');
  setTimeout(() => goto(5), 700);
}

function chooseFood(btn, food) {
  responseData.food = food;
  document.querySelectorAll('#food-options button').forEach(b => b.classList.remove('correct'));
  btn.classList.add('correct');
  showFeedback('food-feedback', `Yum! ${food} is a great choice.`, '#22c55e');
  setTimeout(() => {
    updateSummary();
    goto(6);
  }, 700);
}

function initColourOptions() {
  const colours = [
    { icon: '❤️', label: 'Red' },
    { icon: '💙', label: 'Blue' },
    { icon: '💚', label: 'Green' },
    { icon: '💜', label: 'Violet' },
    { icon: '🧡', label: 'Orange' },
    { icon: '🤍', label: 'White' },
    { icon: '🖤', label: 'Black' },
    { icon: '💛', label: 'Yellow' },
    { icon: '🩷', label: 'Pink' },
  ];
  buildOptions('color-options', colours.map(c => ({
    icon: c.icon,
    label: c.label,
    handler: (btn) => chooseColour(btn, c.label),
  })));
}

function initPlaceOptions() {
  const places = [
    { icon: '🌱', label: 'Maidan' },
    { icon: '🌲', label: 'Eco Park' },
    { icon: '☕️', label: 'Coffee House' },
    { icon: '🏛', label: 'Victoria Memorial' },
    { icon: '🛶', label: 'Princep Ghat' },
    { icon: '🏞', label: 'Millenium Park' },
  ];
  buildOptions('place-options', places.map(p => ({
    icon: p.icon,
    label: p.label,
    handler: (btn) => choosePlace(btn, p.label),
  })));
}

function initFoodOptions() {
  const foods = [
    { icon: '🌯', label: 'Roll' },
    { icon: '🍛', label: 'Biryani' },
    { icon: '🍝', label: 'Pasta' },
    { icon: '🥟', label: 'Momo' },
    { icon: '🍦', label: 'Ice Cream' },
    { icon: '🍜', label: 'Chowmin' },
  ];
  buildOptions('food-options', foods.map(f => ({
    icon: f.icon,
    label: f.label,
    handler: (btn) => chooseFood(btn, f.label),
  })));
}

function setDateInputMin() {
  const dateInput = document.getElementById('date-input');
  if (!dateInput) return;
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.min = `${yyyy}-${mm}-${dd}`;
}

function updateSummary() {
  const summaryText = document.getElementById('summary-text');
  summaryText.textContent = `Hi! You love ${responseData.dessert}, ${responseData.flower}, ${responseData.colour}, would love to visit ${responseData.place}, and want to enjoy ${responseData.food}. Can't wait! 💕`;
}

function formatDateToReadable(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date().toLocaleDateString('en-US', options);
}

function generateResponseTextFile(data) {
  const timestamp = new Date();
  const readableDate = timestamp.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  const isoDate = timestamp.toISOString();

  const content = `╔════════════════════════════════════════════════════════╗
║         PROPOSAL RESPONSE SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝

📋 TIMESTAMP
─────────────────────────────────────────────────────────────
Generated: ${readableDate}
ISO Format: ${isoDate}

👤 USER RESPONSES
─────────────────────────────────────────────────────────────
🍫 Favorite Dessert: ${data.dessert}
🌸 Favorite Flower: ${data.flower}
🎨 Favorite Color: ${data.colour}
📍 Favorite Place: ${data.place}
🍽️ Favorite Meal: ${data.food}

💌 PROPOSAL DETAILS
─────────────────────────────────────────────────────────────
📅 Proposed Date: ${data.date || 'Not set'}
✅ Response Status: PENDING

📊 METADATA
─────────────────────────────────────────────────────────────
Created At: ${data.createdAt || 'Not set'}
File Version: 1.0

╚════════════════════════════════════════════════════════════╝`;

  return content;
}

function downloadTextFile(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function generateAndDownloadResponseFile() {
  try {
    const content = generateResponseTextFile(responseData);
    const timestamp = new Date();
    const yyyy = timestamp.getFullYear();
    const mm = String(timestamp.getMonth() + 1).padStart(2, '0');
    const dd = String(timestamp.getDate()).padStart(2, '0');
    const hh = String(timestamp.getHours()).padStart(2, '0');
    const min = String(timestamp.getMinutes()).padStart(2, '0');
    const ss = String(timestamp.getSeconds()).padStart(2, '0');
    const filename = `proposal-response_${yyyy}-${mm}-${dd}_${hh}-${min}-${ss}.txt`;
    
    downloadTextFile(content, filename);
    showFeedback('date-feedback', '📥 Response file downloaded!', '#22c55e');
  } catch (error) {
    console.error('Error generating file:', error);
    showFeedback('date-feedback', '⚠️ Could not generate file', '#e9618a');
  }
}

function handleDateChange() {
  const dateInput = document.getElementById('date-input');
  const confirmBtn = document.getElementById('confirm-btn');
  if (!dateInput || !confirmBtn) return;
  responseData.date = dateInput.value;
  if (responseData.date) {
    confirmBtn.disabled = false;
    showFeedback('date-feedback', 'Great! Picked a date from today onward.', '#22c55e');
    generateAndDownloadResponseFile();
  } else {
    confirmBtn.disabled = true;
    showFeedback('date-feedback', '', '');
  }
}

async function handleProposal(accepted) {
  const dateInput = document.getElementById('date-input');
  if (accepted && dateInput) {
    responseData.date = dateInput.value;
  }

  if (accepted && !responseData.date) {
    showFeedback('date-feedback', 'Please choose a date from today onward before confirming.', '#e9618a');
    return;
  }

  responseData.accepted = accepted;
  responseData.createdAt = new Date().toISOString();
  const statusEl = document.getElementById('save-status');
  try {
    await saveResponse({
      dessert: responseData.dessert,
      flower: responseData.flower,
      colour: responseData.colour,
      place: responseData.place,
      food: responseData.food,
      date: responseData.date,
      accepted,
      createdAt: responseData.createdAt,
    });
    statusEl.textContent = '✅ Saved locally in the browser database.';
  } catch (error) {
    statusEl.textContent = '⚠️ Could not save locally. Please refresh and try again.';
    console.error(error);
  }

  if (accepted) {
    showConfetti();
    goto(7);
  } else {
    goto(8);
  }
}

function showConfetti() {
  const colors = ['#e9618a', '#facc15', '#7c3aed', '#22c55e', '#38bdf8', '#fb7185'];
  for (let i = 0; i < 30; i += 1) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-bit';
    confetti.style.background = colors[i % colors.length];
    confetti.style.left = `${Math.random() * 90 + 5}%`;
    confetti.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    confetti.style.opacity = '0.95';
    document.body.appendChild(confetti);
    confetti.addEventListener('animationend', () => confetti.remove());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initColourOptions();
  initPlaceOptions();
  initFoodOptions();
  setDateInputMin();
  const dateInput = document.getElementById('date-input');
  if (dateInput) {
    dateInput.addEventListener('change', handleDateChange);
  }
  const dessertInput = document.getElementById('dessert-input');
  if (dessertInput) {
    dessertInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleDessert();
    });
  }
  const flowerInput = document.getElementById('flower-input');
  if (flowerInput) {
    flowerInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleFlower();
    });
  }
});
