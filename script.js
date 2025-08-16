document.addEventListener('DOMContentLoaded', function() {
    // --- DATA ---
    const allProducts = [
        { canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana XL 10GB', stok: 5 },
        { canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', stok: 5 },
        { canvasser: 'Ali Akbar', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 5GB', stok: 15 },
        { canvasser: 'Ali Akbar', provider: 'axis', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana Axis Kosongan', stok: 5 },
        { canvasser: 'Ali Akbar', provider: 'smartfren', jenis: 'voucher', tipe: 'kosongan', nama: 'Voucher SF Kosongan', stok: 5 },
        
        { canvasser: 'Yanuar Efendi', provider: 'xl', jenis: 'voucher', tipe: 'paket', nama: 'Voucher XL Xtra Combo', stok: 10 },
        { canvasser: 'Yanuar Efendi', provider: 'axis', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana Axis 8GB', stok: 10 },
        { canvasser: 'Yanuar Efendi', provider: 'axis', jenis: 'voucher', tipe: 'kosongan', nama: 'Voucher Axis Kosongan', stok: 10 },
        { canvasser: 'Yanuar Efendi', provider: 'smartfren', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana SF Kosongan', stok: 5 },

        { canvasser: 'Yusril', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', stok: 10 },
        { canvasser: 'Yusril', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 12GB', stok: 20 },
        { canvasser: 'Yusril', provider: 'smartfren', jenis: 'voucher', tipe: 'paket', nama: 'Voucher SF Unlimited', stok: 5 },
    ];

    // --- STATE ---
    let activeFilters = {
        jenis: 'kartu-perdana',
        tipe: 'kosongan'
    };
    let productTotalsForModal = {}; // Untuk menyimpan data agregat modal

    // --- DOM ELEMENTS ---
    const mainContent = document.querySelector('.main-content');
    const gudangSummaryContainer = document.getElementById('gudang-summary');
    const canvasserGridContainer = document.getElementById('canvasser-grid');
    const detailModal = document.getElementById('detailModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeModalBtn = detailModal.querySelector('.close-btn');
    const seeAllGudangLink = document.getElementById('see-all-gudang');
    const modalSearchInput = document.getElementById('modalSearchInput');
    const modalSearchWrapper = detailModal.querySelector('.modal-search-wrapper');

    // --- FUNCTIONS ---

    function updateDisplay() {
        populateStokGudang();
        populateStokCanvasser();
    }

    function populateStokGudang() {
        if (!gudangSummaryContainer) return;
        const filteredProducts = allProducts.filter(p => (activeFilters.jenis ? p.jenis === activeFilters.jenis : true) && (activeFilters.tipe ? p.tipe === activeFilters.tipe : true));
        const totals = filteredProducts.reduce((acc, p) => {
            acc[p.provider] = (acc[p.provider] || 0) + p.stok;
            return acc;
        }, { xl: 0, axis: 0, smartfren: 0 });

        gudangSummaryContainer.innerHTML = '';
        const providers = { xl: 'XL', axis: 'Axis', smartfren: 'Smartfren' };
        for (const key in providers) {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `<h4>${providers[key]}</h4><p class="amount">${totals[key] || 0}</p>`;
            gudangSummaryContainer.appendChild(card);
        }
    }

    function populateStokCanvasser() {
        if (!canvasserGridContainer) return;
        const canvasserTotals = allProducts.reduce((acc, p) => {
            acc[p.canvasser] = (acc[p.canvasser] || 0) + p.stok;
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
    
    function renderModalList(searchTerm = '') {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        let contentHTML = '<ul>';
        const filteredProducts = Object.keys(productTotalsForModal).filter(name => name.toLowerCase().includes(lowerCaseSearchTerm));

        if (filteredProducts.length === 0) {
            contentHTML = '<p style="text-align: center; color: var(--color-text-secondary);">Produk tidak ditemukan.</p>';
        } else {
            filteredProducts.forEach(name => {
                const product = productTotalsForModal[name];
                contentHTML += `<li><span class="product-name">${name}</span><span class="product-stock">${product.stok} pcs</span></li>`;
            });
            contentHTML += '</ul>';
        }
        modalBody.innerHTML = contentHTML;
    }

    function openGudangDetailModal() {
        modalTitle.textContent = 'Rincian Stok Gudang';
        modalSearchWrapper.style.display = 'flex'; // Tampilkan pencarian

        if (Object.keys(productTotalsForModal).length === 0) {
            productTotalsForModal = allProducts.reduce((acc, product) => {
                const key = `${product.nama} (${product.provider.toUpperCase()})`;
                acc[key] = { stok: (acc[key]?.stok || 0) + product.stok };
                return acc;
            }, {});
        }
        
        modalSearchInput.value = '';
        renderModalList();
        detailModal.classList.add('show');
    }

    function openCanvasserModal(canvasserName) {
        modalTitle.textContent = `Rincian Stok: ${canvasserName}`;
        modalSearchWrapper.style.display = 'none'; // Sembunyikan pencarian

        const canvasserProducts = allProducts.filter(p => p.canvasser === canvasserName);
        const productTotals = canvasserProducts.reduce((acc, p) => {
            const key = `${p.nama} (${p.provider.toUpperCase()})`;
            acc[key] = { stok: (acc[key]?.stok || 0) + p.stok };
            return acc;
        }, {});

        let contentHTML = '<ul>';
        for (const name in productTotals) {
            contentHTML += `<li><span class="product-name">${name}</span><span class="product-stock">${productTotals[name].stok} pcs</span></li>`;
        }
        contentHTML += '</ul>';
        contentHTML += `<div class="modal-footer"><button class="expand-btn">Lihat Halaman Rinci <i class="fas fa-arrow-right"></i></button></div>`;
        
        modalBody.innerHTML = contentHTML;
        detailModal.classList.add('show');
    }

    function closeDetailModal() {
        detailModal.classList.remove('show');
    }

    // --- EVENT LISTENERS ---

    mainContent.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-item')) {
            const item = e.target;
            activeFilters[item.dataset.filterGroup] = item.dataset.filterValue;
            syncFilterButtons();
            populateStokGudang();
        } else if (e.target.classList.contains('detail-btn')) {
            const canvasserName = e.target.dataset.canvasser;
            openCanvasserModal(canvasserName);
        }
    });

    seeAllGudangLink.addEventListener('click', (e) => {
        e.preventDefault();
        openGudangDetailModal();
    });

    closeModalBtn.addEventListener('click', closeDetailModal);
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) closeDetailModal();
    });
    
    modalSearchInput.addEventListener('input', (e) => {
        renderModalList(e.target.value);
    });

    // --- INITIALIZATION ---
    syncFilterButtons();
    updateDisplay();
});
