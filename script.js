document.addEventListener('DOMContentLoaded', function() {
    // --- DATA ---
    const allProducts = [
        // Data untuk Ali Akbar
        { canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana XL 10GB', items: [{id: '896001'}, {id: '896002'}, {id: '896003'}, {id: '896004'}, {id: '896005'}] },
        { canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', items: [{id: '897001'}, {id: '897002'}, {id: '897003'}] },
        { canvasser: 'Ali Akbar', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 5GB', items: [{id: 'AX5001'}, {id: 'AX5002'}, {id: 'AX5003'}] },
        
        // Data untuk Yanuar Efendi
        { canvasser: 'Yanuar Efendi', provider: 'xl', jenis: 'voucher', tipe: 'paket', nama: 'Voucher XL Xtra Combo', items: [{id: 'XLX01'}, {id: 'XLX02'}] },
        { canvasser: 'Yanuar Efendi', provider: 'axis', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana Axis 8GB', items: [{id: '85901'}, {id: '85902'}, {id: '85903'}] },
        
        // Data untuk Yusril
        { canvasser: 'Yusril', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', items: [{id: '897004'}] },
        { canvasser: 'Yusril', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 12GB', items: [{id: 'AX1201'}, {id: 'AX1202'}] },
    ];

    // --- STATE ---
    let activeFilters = {
        jenis: 'kartu-perdana',
        tipe: 'kosongan'
    };
    let currentCanvasserProducts = [];

    // --- DOM ELEMENTS ---
    const mainContent = document.querySelector('.main-content');
    const gudangSummaryContainer = document.getElementById('gudang-summary');
    const canvasserGridContainer = document.getElementById('canvasser-grid');
    
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

    // --- FUNCTIONS ---

    function updateDisplay() {
        populateStokGudang();
        populateStokCanvasser();
    }

    function populateStokGudang() {
        if (!gudangSummaryContainer) return;
        gudangSummaryContainer.innerHTML = `
            <div class="summary-card"><h4>XL</h4><p class="amount">15</p></div>
            <div class="summary-card"><h4>Axis</h4><p class="amount">25</p></div>
            <div class="summary-card"><h4>Smartfren</h4><p class="amount">5</p></div>
        `;
    }

    function populateStokCanvasser() {
        if (!canvasserGridContainer) return;
        const canvasserTotals = allProducts.reduce((acc, p) => {
            acc[p.canvasser] = (acc[p.canvasser] || 0) + p.items.length;
            return acc;
        }, {});

        canvasserGridContainer.innerHTML = '';
        for (const name in canvasserTotals) {
            const card = document.createElement('div');
            card.className = 'canvasser-card';
            card.innerHTML = `<h4>${name}</h4><div class="stock-info">Total Stok: <span class="total-stock">${canvasserTotals[name]}</span></div><button class="detail-btn" data-canvasser="${name}">Lihat Detail</button>`;
            canvasserGridContainer.appendChild(card);
        }
    }

    function syncFilterButtons() {
        document.querySelectorAll('.filter-item').forEach(item => {
            item.classList.toggle('active', activeFilters[item.dataset.filterGroup] === item.dataset.filterValue);
        });
    }

    function openCanvasserModal(canvasserName) {
        currentCanvasserProducts = allProducts.filter(p => p.canvasser === canvasserName);
        modalTitle.textContent = `Rincian Stok: ${canvasserName}`;
        
        let tableHTML = `
            <div class="table-wrapper">
                <table class="detail-modal-table">
                    <thead>
                        <tr>
                            <th>Nama Produk</th>
                            <th>Stok</th>
                            <th>Operasi</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        currentCanvasserProducts.forEach(product => {
            tableHTML += `
                <tr>
                    <td>${product.nama}</td>
                    <td>${product.items.length}</td>
                    <td>
                        <button class="action-btn" data-product-name="${product.nama}">
                            <i class="fas fa-qrcode"></i> Detail SN
                        </button>
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
            new QRCode(qrcodeContainer, {
                text: text,
                width: 160,
                height: 160,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
            qrcodeValue.textContent = text;
        } else {
             qrcodeValue.textContent = 'Tidak ada data';
        }
    }

    function openQrCodeModal(product) {
        if (!product) return;

        qrCodeModalTitle.textContent = `Rincian: ${product.nama}`;
        const headerText = product.jenis === 'kartu-perdana' ? 'MSISDN' : 'Serial Number';
        serialNumberHeader.textContent = headerText;

        serialNumberTableBody.innerHTML = '';
        product.items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.innerHTML = `<td>${item.id}</td>`;
            if (index === 0) {
                row.classList.add('active');
            }
            serialNumberTableBody.appendChild(row);
        });

        const firstId = product.items[0]?.id;
        generateQrCode(firstId);

        qrCodeModal.classList.add('show');
    }

    function closeDetailModal() {
        detailModal.classList.remove('show');
    }

    function closeQrCodeModal() {
        qrCodeModal.classList.remove('show');
    }

    // --- EVENT LISTENERS ---
    mainContent.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-item')) {
            const item = e.target;
            activeFilters[item.dataset.filterGroup] = item.dataset.filterValue;
            syncFilterButtons();
        } else if (e.target.classList.contains('detail-btn')) {
            const canvasserName = e.target.dataset.canvasser;
            openCanvasserModal(canvasserName);
        }
    });

    modalBody.addEventListener('click', (e) => {
        const detailButton = e.target.closest('.action-btn');
        if (detailButton) {
            const productName = detailButton.dataset.productName;
            const product = currentCanvasserProducts.find(p => p.nama === productName);
            openQrCodeModal(product);
        }
    });

    serialNumberTableBody.addEventListener('click', (e) => {
        const clickedRow = e.target.closest('tr');
        if (!clickedRow) return;

        serialNumberTableBody.querySelectorAll('tr').forEach(row => row.classList.remove('active'));
        clickedRow.classList.add('active');
        
        generateQrCode(clickedRow.dataset.id);
    });

    closeDetailBtn.addEventListener('click', closeDetailModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetailModal();
    });

    closeQrCodeBtn.addEventListener('click', closeQrCodeModal);
    qrCodeModal.addEventListener('click', (e) => {
        if (e.target === qrCodeModal) closeQrCodeModal();
    });

    // --- INITIALIZATION ---
    syncFilterButtons();
    updateDisplay();
});
