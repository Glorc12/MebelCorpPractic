// ═══════════════════════════════════════════════════════════════════
// КАЛЬКУЛЯТОР РАСЧЁТА СЫРЬЯ С УЧЁТОМ ПОТЕРЬ
// ═══════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    loadRawCalcData();
    const calcBtn = document.getElementById('rc-calc-btn');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateRawMaterial);
    }
});

async function loadRawCalcData() {
    try {
        if (window.productTypes && window.productTypes.length > 0) {
            populateProductSelect();
        } else {
            const response = await fetch('/api/product-types');
            if (response.ok) {
                window.productTypes = await response.json();
                populateProductSelect();
            }
        }

        if (window.materialTypes && window.materialTypes.length > 0) {
            populateMaterialSelect();
        } else {
            const response = await fetch('/api/material-types');
            if (response.ok) {
                window.materialTypes = await response.json();
                populateMaterialSelect();
            }
        }
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
    }
}

function populateProductSelect() {
    const select = document.getElementById('rc-product');
    if (!select || !window.productTypes) return;

    select.innerHTML = '<option value="">-- Выберите тип продукции --</option>';
    window.productTypes.forEach(type => {
        const option = document.createElement('option');
        option.value = type.product_type_id || type.id;
        option.textContent = type.product_type_name || type.name;
        select.appendChild(option);
    });
}

function populateMaterialSelect() {
    const select = document.getElementById('rc-material');
    if (!select || !window.materialTypes) return;

    select.innerHTML = '<option value="">-- Выберите тип материала --</option>';
    window.materialTypes.forEach(material => {
        const option = document.createElement('option');
        option.value = material.material_type_id || material.id;
        const lossPercent = material.loss_percentage || 0;
        option.textContent = `${material.material_type_name || material.name} (потери: ${lossPercent}%)`;
        select.appendChild(option);
    });
}

function updateMaterialLoss() {
    const materialSelect = document.getElementById('rc-material');
    const lossInput = document.getElementById('rc-loss');

    const selectedId = materialSelect.value;
    if (!selectedId || !window.materialTypes) {
        lossInput.value = '';
        return;
    }

    const selectedMaterial = window.materialTypes.find(
        m => (m.material_type_id || m.id) == selectedId
    );

    if (selectedMaterial) {
        let loss = selectedMaterial.loss_percentage || 0;
        if (typeof loss === 'string') {
            loss = parseFloat(loss);
        }
        lossInput.value = isNaN(loss) ? '0' : parseFloat(loss).toFixed(2);
    } else {
        lossInput.value = '';
    }
}

function calculateRawMaterial() {
    const productSelect = document.getElementById('rc-product');
    const materialSelect = document.getElementById('rc-material');
    const lossInput = document.getElementById('rc-loss');
    const qtyInput = document.getElementById('rc-qty');
    const param1Input = document.getElementById('rc-param1');
    const param2Input = document.getElementById('rc-param2');

    const productText = productSelect.options[productSelect.selectedIndex]?.text || '—';
    let materialText = materialSelect.options[materialSelect.selectedIndex]?.text || '—';
    materialText = materialText.replace(/\s*\(потери:.*?\)/, '');

    const qty = parseFloat(qtyInput.value);
    const param1 = parseFloat(param1Input.value);
    const param2 = parseFloat(param2Input.value);
    let lossPercent = parseFloat(lossInput.value);
    if (isNaN(lossPercent)) {
        lossPercent = 0;
    }

    // ВАЛИДАЦИЯ
    if (!productSelect.value || !materialSelect.value) {
        alert('⚠️ Пожалуйста, выберите тип продукции и материала');
        return;
    }

    if (!qty || qty <= 0) {
        alert('⚠️ Количество единиц должно быть больше 0');
        return;
    }

    if (!param1 || param1 <= 0 || !param2 || param2 <= 0) {
        alert('⚠️ Все параметры должны быть больше 0');
        return;
    }

    // РАСЧЁТЫ
    const baseVolume = qty * param1 * param2;
    const lossVolume = baseVolume * (lossPercent / 100);
    const totalRaw = baseVolume + lossVolume;

    // ВЫВОД РЕЗУЛЬТАТА
    const tbody = document.getElementById('raw_calc-result');
    tbody.innerHTML = `
        <tr style="background-color: #f0fdf4;">
            <td><strong>${productText}</strong></td>
            <td><strong>${materialText}</strong></td>
            <td>${qty}</td>
            <td>${param1.toFixed(2)}</td>
            <td>${param2.toFixed(2)}</td>
            <td>${baseVolume.toFixed(2)}</td>
            <td><strong style="color: #ea580c;">${lossPercent.toFixed(2)}%</strong></td>
            <td><strong style="color: #059669; font-size: 16px;">${totalRaw.toFixed(2)}</strong></td>
        </tr>
    `;

    console.log('✓ Расчёт выполнен:', {
        product: productText,
        material: materialText,
        quantity: qty,
        param1,
        param2,
        baseVolume: baseVolume.toFixed(2),
        lossPercent: `${lossPercent.toFixed(2)}%`,
        lossVolume: lossVolume.toFixed(2),
        totalRaw: totalRaw.toFixed(2)
    });
}
