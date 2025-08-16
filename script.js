// Menunggu event 'dataReady' dari data-loader.js
document.addEventListener('dataReady', function() {
    const allProducts = window.processedData;
    const gudangSummary = window.gudangSummary || []; // Menggunakan data ringkasan gudang
    const stokCanvasser = allProducts.filter(p => p.lokasi === 'Canvasser');

    // --- DOM ELEMENTS ---
    const gudangSummaryContainer = document.getElementById('gudang-summary');
    const canvasserGridContainer = document.getElementById('canvasser-grid');
    const filterGroup = document.querySelector('.filter-group');
    
    // Modal Rincian Stok
    const detailModal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    const closeDetailBtn = document.getElementById('closeDetailBtn');
    
    // Modal QR Code
    const qrCodeModal = document.getElementById('qrCodeModal');
    const qrCodeModalTitle = document.getElementById('qrCodeModalTitle');
    const serialNumberHeader = document.getElementById('serialNumberHeader');
    const serialNumberTableBody = document.getElementById('serialNumberTableBody');
    const closeQrCodeBtn = document.getElementById('closeQrCodeBtn');
    const qrcodeValue = document.getElementById('qrcodeValue');
    const qrcodeContainer = document.getElementById('qrcode');

    // --- STATE ---
    let activeFilters = {
        jenis: 'kartu-perdana',
        tipe: 'kosongan'
    };
    let currentCanvasserProducts = [];

    // --- FUNCTIONS ---

    // [DIPERBARUI] Fungsi untuk format angka
    function formatNumber(num) {
        return Number(num).toLocaleString('id-ID');
    }

    // [DIPERBARUI] Menggunakan gudangSummary untuk data stok gudang
    function populateStokGudang() {
        if (!gudangSummaryContainer) return;

        const filteredProducts = gudangSummary.filter(p => 
            (activeFilters.jenis ? p.jenis === activeFilters.jenis : true) && 
            (activeFilters.tipe ? p.tipe === activeFilters.tipe : true)
        );

        const totals = filteredProducts.reduce((acc, p) => {
            acc[p.provider] = (acc[p.provider] || 0) + p.stok;
            return acc;
        }, { xl: 0, axis: 0, smartfren: 0 });

        gudangSummaryContainer.innerHTML = '';
        const providers = { xl: 'XL', axis: 'Axis', smartfren: 'Smartfren' };
        for (const key in providers) {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `<h4>${providers[key]}</h4><p class="amount">${formatNumber(totals[key] || 0)}</p>`;
            gudangSummaryContainer.appendChild(card);
        }
    }

    function populateStokCanvasser() {
        if (!canvasserGridContainer) return;

        const canvasserSummary = stokCanvasser.reduce((acc, p) => {
            if (!acc[p.canvasser]) {
                acc[p.canvasser] = { alokasi: 0, sellIn: 0 };
            }
            p.items.forEach(item => {
                if (item.status === 'Alokasi') {
                    acc[p.canvasser].alokasi++;
                } else if (item.status === 'Sell In') {
                    acc[p.canvasser].sellIn++;
                }
            });
            return acc;
        }, {});

        canvasserGridContainer.innerHTML = '';
        for (const name in canvasserSummary) {
            const card = document.createElement('div');
            card.className = 'canvasser-card';
            card.innerHTML = `
                <h4>${name}</h4>
                <div class="stock-info">
                    <div class="stock-alokasi">
                        Stok Alokasi: <span class="total-stock">${formatNumber(canvasserSummary[name].alokasi)}</span>
                    </div>
                    <div class="stock-sell-in">
                        Stok Sell In: <span class="sell-in-stock">${formatNumber(canvasserSummary[name].sellIn)}</span>
                    </div>
                </div>
                <button class="detail-btn" data-canvasser="${name}">Lihat Detail</button>
            `;
            canvasserGridContainer.appendChild(card);
        }
    }
    
    function syncFilterButtons() {
        document.querySelectorAll('.filter-item').forEach(item => {
            const group = item.dataset.filterGroup;
            const value = item.dataset.filterValue;
            item.classList.toggle('active', activeFilters[group] === value);
        });
    }

    function openCanvasserModal(canvasserName) {
        currentCanvasserProducts = stokCanvasser.filter(p => p.canvasser === canvasserName);
        modalTitle.textContent = `Rincian Stok: ${canvasserName}`;
        
        let tableHTML = `<div class="table-wrapper"><table class="detail-modal-table"><thead><tr><th>Nama Produk</th><th>Alokasi</th><th>Sell In</th><th>Operasi</th></tr></thead><tbody>`;
        
        currentCanvasserProducts.forEach(product => {
            const alokasiCount = product.items.filter(i => i.status === 'Alokasi').length;
            const sellInCount = product.items.filter(i => i.status === 'Sell In').length;
            tableHTML += `
                <tr>
                    <td>${product.nama}</td>
                    <td>${formatNumber(alokasiCount)}</td>
                    <td>${formatNumber(sellInCount)}</td>
                    <td>
                        ${alokasiCount > 0 ? `<button class="action-btn" data-product-name="${product.nama}"><i class="fas fa-qrcode"></i> Detail SN</button>` : '-'}
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></div>`;
        modalBody.innerHTML = tableHTML;
        modalFooter.innerHTML = `<button class="expand-btn" onclick="window.location.href='canvasser-detail.html?name=${encodeURIComponent(canvasserName)}'">Lihat Halaman Rinci <i class="fas fa-arrow-right"></i></button>`;
        detailModal.classList.add('show');
    }

    function generateQrCode(text) {
        qrcodeContainer.innerHTML = '';
        if (text) {
            new QRCode(qrcodeContainer, { text, width: 160, height: 160 });
            qrcodeValue.textContent = text;
        } else {
            qrcodeValue.textContent = 'Tidak ada data';
        }
    }

    function openQrCodeModal(product) {
        if (!product) return;
        qrCodeModalTitle.textContent = `Rincian SN (Alokasi): ${product.nama}`;
        serialNumberHeader.textContent = product.jenis === 'kartu-perdana' ? 'MSISDN' : 'Serial Number';
        
        serialNumberTableBody.innerHTML = '';
        const alokasiItems = product.items.filter(item => item.status === 'Alokasi');
        
        alokasiItems.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `<td>${index + 1}. ${item.id}</td>`;
            if (index === 0) row.classList.add('active');
            serialNumberTableBody.appendChild(row);
        });

        generateQrCode(alokasiItems[0]?.id);
        qrCodeModal.classList.add('show');
    }

    // --- EVENT LISTENERS ---
    if (filterGroup) {
        filterGroup.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-item')) {
                const group = e.target.dataset.filterGroup;
                const value = e.target.dataset.filterValue;
                activeFilters[group] = value;
                syncFilterButtons();
                populateStokGudang();
            }
        });
    }

    if (canvasserGridContainer) {
        canvasserGridContainer.addEventListener('click', (e) => {
            const detailBtn = e.target.closest('.detail-btn');
            if (detailBtn) openCanvasserModal(detailBtn.dataset.canvasser);
        });
    }
    
    if (modalBody) {
        modalBody.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.action-btn');
            if (actionBtn) {
                const productName = actionBtn.dataset.productName;
                const product = currentCanvasserProducts.find(p => p.nama === productName);
                openQrCodeModal(product);
            }
        });
    }

    if (serialNumberTableBody) {
        serialNumberTableBody.addEventListener('click', (e) => {
            const clickedRow = e.target.closest('tr');
            if (!clickedRow) return;
            serialNumberTableBody.querySelectorAll('tr').forEach(row => row.classList.remove('active'));
            clickedRow.classList.add('active');
            generateQrCode(clickedRow.dataset.id);
        });
    }

    if (closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => detailModal.classList.remove('show'));
    }
    if (closeQrCodeBtn) {
        closeQrCodeBtn.addEventListener('click', () => qrCodeModal.classList.remove('show'));
    }

    // --- INITIALIZATION ---
    populateStokGudang();
    populateStokCanvasser();
    syncFilterButtons();
});