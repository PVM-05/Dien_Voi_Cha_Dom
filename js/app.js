// File điều khiển giao diện người dùng (UI Controller)
import { calculateElectricityBill, formatCurrency, DEFAULT_TIERS } from './calculator.js';

document.addEventListener('DOMContentLoaded', () => {
  const oldIdxInput = document.getElementById('oldIdx');
  const newIdxInput = document.getElementById('newIdx');
  const vatSelect = document.getElementById('vatSelect');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const printBtn = document.getElementById('printBtn');
  const copyBtn = document.getElementById('copyBtn');
  const errMsg = document.getElementById('errMsg');
  const resultCard = document.getElementById('resultCard');

  // Render bảng biểu giá tham chiếu
  renderReferenceTiers();

  // Sự kiện tính toán
  calcBtn.addEventListener('click', handleCalculate);

  // Nhấn Enter trong ô input để tính
  [oldIdxInput, newIdxInput].forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleCalculate();
    });
  });

  // Sự kiện xóa / reset
  resetBtn.addEventListener('click', () => {
    oldIdxInput.value = '';
    newIdxInput.value = '';
    vatSelect.value = '0.08';
    hideError();
    resultCard.style.display = 'none';
    oldIdxInput.focus();
  });

  // Sự kiện In hóa đơn
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Sự kiện Sao chép kết quả
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyResult);
  }

  // Sự kiện chọn dữ liệu mẫu (Quick Presets)
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      oldIdxInput.value = btn.dataset.old;
      newIdxInput.value = btn.dataset.new;
      handleCalculate();
    });
  });

  function showError(msg) {
    errMsg.textContent = msg;
    errMsg.style.display = 'flex';
  }

  function hideError() {
    errMsg.textContent = '';
    errMsg.style.display = 'none';
  }

  function handleCalculate() {
    hideError();

    const oldVal = oldIdxInput.value;
    const newVal = newIdxInput.value;
    const vatRate = parseFloat(vatSelect.value) || 0;

    const result = calculateElectricityBill(oldVal, newVal, vatRate);

    if (!result.success) {
      showError(`⚠️ ${result.error}`);
      resultCard.style.display = 'none';
      return;
    }

    // Hiển thị kết quả
    document.getElementById('rKwh').textContent = `${result.kwh.toLocaleString('vi-VN')} kWh`;
    document.getElementById('rSub').textContent = formatCurrency(result.subtotal);
    document.getElementById('rVatRate').textContent = `(${result.vatRate * 100}%)`;
    document.getElementById('rVat').textContent = formatCurrency(result.vatAmount);
    document.getElementById('rTotal').textContent = formatCurrency(result.totalAmount);

    // Render bảng chi tiết từng bậc
    const tbody = document.getElementById('tierBody');
    tbody.innerHTML = '';

    result.tierBreakdown.forEach((r, idx) => {
      const tr = document.createElement('tr');
      if (r.used > 0) tr.classList.add('tier-active');
      tr.innerHTML = `
        <td><strong>${r.name}</strong></td>
        <td>${r.range}</td>
        <td><strong>${r.used.toLocaleString('vi-VN')}</strong></td>
        <td>${formatCurrency(r.price)}</td>
        <td><strong>${formatCurrency(r.amount)}</strong></td>
      `;
      tbody.appendChild(tr);
    });

    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleCopyResult() {
    const kwh = document.getElementById('rKwh').textContent;
    const sub = document.getElementById('rSub').textContent;
    const vat = document.getElementById('rVat').textContent;
    const total = document.getElementById('rTotal').textContent;

    const text = `--- HÓA ĐƠN TIỀN ĐIỆN ---\nChỉ số cũ: ${oldIdxInput.value} | Chỉ số mới: ${newIdxInput.value}\nSản lượng: ${kwh}\nTiền điện: ${sub}\nVAT: ${vat}\nTổng thanh toán: ${total}`;

    navigator.clipboard.writeText(text).then(() => {
      const origText = copyBtn.textContent;
      copyBtn.textContent = '✓ Đã sao chép!';
      setTimeout(() => copyBtn.textContent = origText, 2000);
    }).catch(() => {
      alert('Không thể sao chép văn bản.');
    });
  }

  function renderReferenceTiers() {
    const refContainer = document.getElementById('refTierList');
    if (!refContainer) return;
    refContainer.innerHTML = DEFAULT_TIERS.map(t => `
      <div class="ref-tier-item">
        <span>${t.name} (${t.desc})</span>
        <strong>${formatCurrency(t.price)}/kWh</strong>
      </div>
    `).join('');
  }
});
