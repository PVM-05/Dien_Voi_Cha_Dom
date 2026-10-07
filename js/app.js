// File điều khiển giao diện người dùng (UI Controller)
import { 
  calculateElectricityBill, 
  calculateDirectKwh, 
  formatCurrency, 
  formatNumber,
  DEFAULT_TIERS 
} from './calculator.js';
import { 
  getEnergySavingRecommendation, 
  compareWithPreviousMonth 
} from './recommendations.js';
import { 
  saveHistoryItem, 
  getHistory, 
  clearAllHistory, 
  removeHistoryItem 
} from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tabMeterBtn = document.getElementById('tabMeter');
  const tabDirectBtn = document.getElementById('tabDirect');
  const panelMeter = document.getElementById('panelMeter');
  const panelDirect = document.getElementById('panelDirect');

  // Input Fields
  const oldIdxInput = document.getElementById('oldIdx');
  const newIdxInput = document.getElementById('newIdx');
  const directKwhInput = document.getElementById('directKwhInput');
  const vatSelect = document.getElementById('vatSelect');
  const prevKwhInput = document.getElementById('prevKwhInput');

  // Feedback & Action Elements
  const inputHint = document.getElementById('inputHint');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Result Elements
  const resultCard = document.getElementById('resultCard');
  const heroKwh = document.getElementById('heroKwh');
  const heroTotal = document.getElementById('heroTotal');
  const rSub = document.getElementById('rSub');
  const rVat = document.getElementById('rVat');
  const rVatRate = document.getElementById('rVatRate');
  const rFinalTotal = document.getElementById('rFinalTotal');
  const tierBody = document.getElementById('tierBody');

  // Recommendation & Comparison Elements
  const savingCard = document.getElementById('savingCard');
  const savingAdvice = document.getElementById('savingAdvice');
  const savingPotential = document.getElementById('savingPotential');
  const comparisonResult = document.getElementById('comparisonResult');

  // Action Buttons
  const copyBtn = document.getElementById('copyBtn');
  const printBtn = document.getElementById('printBtn');

  // History Elements
  const historyList = document.getElementById('historyList');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historyEmpty = document.getElementById('historyEmpty');

  // Reference Table Container
  const refTierList = document.getElementById('refTierList');

  // State
  let currentMode = 'meter'; // 'meter' | 'direct'
  let latestResult = null;

  // --- Khởi tạo ban đầu ---
  renderReferenceTiers();
  renderHistory();

  // --- Sự kiện chuyển đổi Tab chế độ tính ---
  tabMeterBtn.addEventListener('click', () => switchMode('meter'));
  tabDirectBtn.addEventListener('click', () => switchMode('direct'));

  function switchMode(mode) {
    currentMode = mode;
    if (mode === 'meter') {
      tabMeterBtn.classList.add('active');
      tabDirectBtn.classList.remove('active');
      panelMeter.style.display = 'block';
      panelDirect.style.display = 'none';
      validateAndPreviewMeter();
    } else {
      tabDirectBtn.classList.add('active');
      tabMeterBtn.classList.remove('active');
      panelDirect.style.display = 'block';
      panelMeter.style.display = 'none';
      validateAndPreviewDirect();
    }
  }

  // --- Lắng nghe sự kiện người dùng nhập liệu (Live Feedback) ---
  oldIdxInput.addEventListener('input', validateAndPreviewMeter);
  newIdxInput.addEventListener('input', validateAndPreviewMeter);
  directKwhInput.addEventListener('input', validateAndPreviewDirect);
  vatSelect.addEventListener('change', () => {
    if (latestResult) handleCalculate(false);
  });
  prevKwhInput.addEventListener('input', handleCompare);

  [oldIdxInput, newIdxInput, directKwhInput].forEach(el => {
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCalculate(true);
    });
  });

  // --- Xử lý tính toán khi nhấn nút ---
  calcBtn.addEventListener('click', () => handleCalculate(true));

  // --- Xử lý làm mới ---
  resetBtn.addEventListener('click', () => {
    oldIdxInput.value = '';
    newIdxInput.value = '';
    directKwhInput.value = '';
    prevKwhInput.value = '';
    vatSelect.value = '0.08';
    latestResult = null;
    resultCard.style.display = 'none';
    savingCard.style.display = 'none';
    comparisonResult.textContent = '';
    setHint('neutral', 'Nhập chỉ số công tơ để bắt đầu tính.');
    if (currentMode === 'meter') oldIdxInput.focus();
    else directKwhInput.focus();
  });

  // --- Sao chép hóa đơn ---
  copyBtn.addEventListener('click', handleCopy);

  // --- In hóa đơn ---
  printBtn.addEventListener('click', () => window.print());

  // --- Xóa lịch sử ---
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử tính toán?')) {
      clearAllHistory();
      renderHistory();
    }
  });

  // =========================================================================
  // LOGIC XÁC THỰC VÀ TÍNH TOÁN REAL-TIME
  // =========================================================================

  function validateAndPreviewMeter() {
    const oldVal = oldIdxInput.value.trim();
    const newVal = newIdxInput.value.trim();

    // Trạng thái ban đầu
    if (!oldVal && !newVal) {
      setHint('neutral', 'Nhập chỉ số cũ và chỉ số mới của công tơ điện.');
      return;
    }

    if (!oldVal || !newVal) {
      setHint('neutral', 'Vui lòng nhập đủ cả hai chỉ số công tơ.');
      return;
    }

    const nOld = Number(oldVal);
    const nNew = Number(newVal);

    if (!Number.isFinite(nOld) || !Number.isFinite(nNew)) {
      setHint('error', 'Chỉ số công tơ phải là số hợp lệ.');
      return;
    }

    if (nOld < 0 || nNew < 0) {
      setHint('error', 'Chỉ số công tơ không được là số âm.');
      return;
    }

    if (!Number.isInteger(nOld) || !Number.isInteger(nNew)) {
      setHint('error', 'Chỉ số công tơ cần là số nguyên. Ví dụ: 1250, 1385.');
      return;
    }

    if (nNew < nOld) {
      setHint('error', 'Chỉ số mới đang nhỏ hơn chỉ số cũ. Vui lòng kiểm tra lại hai chỉ số công tơ.');
      return;
    }

    // Hợp lệ!
    const diff = nNew - nOld;
    setHint('success', `Sản lượng tiêu thụ: ${formatNumber(diff)} kWh (từ ${formatNumber(nOld)} đến ${formatNumber(nNew)}).`);
    
    // Tự động tính toán kết quả ngầm (không scroll)
    handleCalculate(false);
  }

  function validateAndPreviewDirect() {
    const val = directKwhInput.value.trim();
    if (!val) {
      setHint('neutral', 'Nhập số kWh điện dự kiến sử dụng trong kỳ.');
      return;
    }

    const num = Number(val);
    if (!Number.isFinite(num) || num < 0) {
      setHint('error', 'Số kWh phải là số dương hợp lệ.');
      return;
    }

    setHint('success', `Đang ước tính cho ${formatNumber(Math.round(num))} kWh điện tiêu thụ.`);
    handleCalculate(false);
  }

  function setHint(type, message) {
    inputHint.className = `input-hint hint-${type}`;
    inputHint.textContent = message;
  }

  function handleCalculate(shouldSaveAndScroll = false) {
    const vatRate = parseFloat(vatSelect.value) || 0;
    let res;

    if (currentMode === 'meter') {
      const oldVal = oldIdxInput.value.trim();
      const newVal = newIdxInput.value.trim();
      if (!oldVal || !newVal) {
        setHint('error', 'Vui lòng nhập đầy đủ chỉ số cũ và chỉ số mới.');
        return;
      }
      res = calculateElectricityBill(oldVal, newVal, vatRate);
    } else {
      const kwhVal = directKwhInput.value.trim();
      if (!kwhVal) {
        setHint('error', 'Vui lòng nhập số kWh điện dự kiến.');
        return;
      }
      res = calculateDirectKwh(kwhVal, vatRate);
    }

    if (!res.success) {
      setHint('error', res.error);
      resultCard.style.display = 'none';
      savingCard.style.display = 'none';
      return;
    }

    latestResult = res;
    renderResult(res);

    if (shouldSaveAndScroll) {
      saveHistoryItem(res);
      renderHistory();
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // =========================================================================
  // HIỂN THỊ KẾT QUẢ VÀ TƯ VẤN
  // =========================================================================

  function renderResult(res) {
    // 1. Hero Result
    heroKwh.textContent = `${formatNumber(res.kwh)} kWh`;
    heroTotal.textContent = formatCurrency(res.totalAmount);

    // 2. Tóm tắt số liệu
    rSub.textContent = formatCurrency(res.subtotal);
    rVatRate.textContent = `(${Math.round(res.vatRate * 100)}%)`;
    rVat.textContent = formatCurrency(res.vatAmount);
    rFinalTotal.textContent = formatCurrency(res.totalAmount);

    // 3. Bảng phân bổ 6 bậc
    tierBody.innerHTML = '';
    res.tierBreakdown.forEach((t) => {
      const tr = document.createElement('tr');
      if (t.used > 0) tr.classList.add('tier-active');
      tr.innerHTML = `
        <td><strong>${t.name}</strong></td>
        <td>${t.range}</td>
        <td><strong>${formatNumber(t.used)}</strong></td>
        <td>${formatCurrency(t.price)}</td>
        <td><strong>${formatCurrency(t.amount)}</strong></td>
      `;
      tierBody.appendChild(tr);
    });

    resultCard.style.display = 'block';

    // 4. Gợi ý tiết kiệm điện thông minh
    const rec = getEnergySavingRecommendation(res.kwh, res.totalAmount, res.vatRate, res.tierBreakdown);
    savingAdvice.textContent = rec.advice;
    if (rec.potentialSavingsText) {
      savingPotential.textContent = rec.potentialSavingsText;
      savingPotential.style.display = 'block';
    } else {
      savingPotential.style.display = 'none';
    }
    savingCard.style.display = 'block';

    // 5. So sánh tháng trước (nếu đã có dữ liệu)
    handleCompare();
  }

  function handleCompare() {
    if (!latestResult) return;
    const prevVal = prevKwhInput.value.trim();
    if (!prevVal) {
      comparisonResult.textContent = '';
      return;
    }

    const comp = compareWithPreviousMonth(latestResult.kwh, prevVal);
    if (!comp || !comp.isValid) {
      comparisonResult.textContent = comp ? comp.message : '';
      comparisonResult.className = 'comparison-text text-muted';
      return;
    }

    comparisonResult.textContent = comp.message;
    if (comp.isEqual) {
      comparisonResult.className = 'comparison-text text-neutral';
    } else if (comp.isHigher) {
      comparisonResult.className = 'comparison-text text-warning';
    } else {
      comparisonResult.className = 'comparison-text text-success';
    }
  }

  function handleCopy() {
    if (!latestResult) return;

    let text = `HOA DON TIEN DIEN SINH HOAT\n`;
    if (latestResult.calculationType === 'meter') {
      text += `Chi so cu: ${formatNumber(latestResult.oldIndex)} | Chi so moi: ${formatNumber(latestResult.newIndex)}\n`;
    }
    text += `San luong tieu thu: ${formatNumber(latestResult.kwh)} kWh\n`;
    text += `Tien dien (chua thue): ${formatCurrency(latestResult.subtotal)}\n`;
    text += `Thue VAT (${Math.round(latestResult.vatRate * 100)}%): ${formatCurrency(latestResult.vatAmount)}\n`;
    text += `TONG THANH TOAN: ${formatCurrency(latestResult.totalAmount)}`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.textContent;
      copyBtn.textContent = 'Đã sao chép!';
      setTimeout(() => copyBtn.textContent = origText, 2000);
    }).catch(() => {
      alert('Không thể sao chép vào bộ nhớ đệm.');
    });
  }

  // =========================================================================
  // LỊCH SỬ TÍNH TOÁN
  // =========================================================================

  function renderHistory() {
    const list = getHistory();
    historyList.innerHTML = '';

    if (list.length === 0) {
      historyEmpty.style.display = 'block';
      clearHistoryBtn.style.display = 'none';
      return;
    }

    historyEmpty.style.display = 'none';
    clearHistoryBtn.style.display = 'inline-block';

    list.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      
      const subInfo = item.calculationType === 'meter' && item.oldIndex !== null
        ? `${formatNumber(item.oldIndex)} -> ${formatNumber(item.newIndex)}`
        : 'Ước tính';

      card.innerHTML = `
        <div class="history-main">
          <div class="history-date">${item.dateFormatted} <span class="history-tag">${subInfo}</span></div>
          <div class="history-kwh">${formatNumber(item.kwh)} kWh</div>
        </div>
        <div class="history-action-area">
          <div class="history-amount">${formatCurrency(item.totalAmount)}</div>
          <button class="history-reload-btn" data-id="${item.id}">Xem lại</button>
        </div>
      `;

      card.querySelector('.history-reload-btn').addEventListener('click', () => {
        loadHistoryItem(item);
      });

      historyList.appendChild(card);
    });
  }

  function loadHistoryItem(item) {
    if (item.calculationType === 'meter' && item.oldIndex !== null) {
      switchMode('meter');
      oldIdxInput.value = item.oldIndex;
      newIdxInput.value = item.newIndex;
    } else {
      switchMode('direct');
      directKwhInput.value = item.kwh;
    }
    vatSelect.value = String(item.vatRate || 0.08);
    handleCalculate(false);
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // =========================================================================
  // BIỂU GIÁ THAM CHIẾU
  // =========================================================================

  function renderReferenceTiers() {
    if (!refTierList) return;
    refTierList.innerHTML = DEFAULT_TIERS.map(t => `
      <div class="ref-tier-item">
        <div class="ref-tier-meta">
          <strong>${t.name}</strong>
          <span>(${t.desc})</span>
        </div>
        <strong>${formatCurrency(t.price)}/kWh</strong>
      </div>
    `).join('');
  }
});
