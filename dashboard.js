document.addEventListener('DOMContentLoaded', function() {
    // --- DATA ---
    // Di aplikasi nyata, data ini akan datang dari database atau API.
    // Menambahkan lokasi 'gudang' atau nama canvasser.
    const allStock = [
        // Stok Gudang
        { location: 'gudang', canvasser: null, provider: 'xl', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana XL 10GB', stok: 150 },
        { location: 'gudang', canvasser: null, provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 5GB', stok: 200 },
        { location: 'gudang', canvasser: null, provider: 'smartfren', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana SF Kosongan', stok: 300 },
        { location: 'gudang', canvasser: null, provider: 'xl', jenis: 'voucher', tipe: 'paket', nama: 'Voucher XL Xtra Combo', stok: 120 },

        // Stok Canvasser
        { location: 'canvasser', canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana XL 10GB', stok: 5 },
        { location: 'canvasser', canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', stok: 5 },
        { location: 'canvasser', canvasser: 'Ali Akbar', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 5GB', stok: 15 },
        
        { location: 'canvasser', canvasser: 'Yanuar Efendi', provider: 'xl', jenis: 'voucher', tipe: 'paket', nama: 'Voucher XL Xtra Combo', stok: 10 },
        { location: 'canvasser', canvasser: 'Yanuar Efendi', provider: 'axis', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana Axis 8GB', stok: 10 },
        { location: 'canvasser', canvasser: 'Yanuar Efendi', provider: 'smartfren', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana SF Kosongan', stok: 5 },

        { location: 'canvasser', canvasser: 'Yusril', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', stok: 10 },
        { location: 'canvasser', canvasser: 'Yusril', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 12GB', stok: 20 },
        { location: 'canvasser', canvasser: 'Yusril', provider: 'smartfren', jenis: 'voucher', tipe: 'paket', nama: 'Voucher SF Unlimited', stok: 5 },
    ];

    // --- DOM ELEMENTS ---
    const summaryCardsContainer = document.getElementById('summaryCardsContainer');
    const gudangTableBody = document.getElementById('gudangTableBody');
    const canvasserTableBody = document.getElementById('canvasserTableBody');
    const gudangSearchInput = document.getElementById('gudangSearchInput');
    const canvasserSearchInput = document.getElementById('canvasserSearchInput');
    
    // --- DATA PREPARATION ---
    const stokGudang = allStock.filter(s => s.location === 'gudang');
    const stokCanvasser = allStock.filter(s => s.location === 'canvasser');

    // --- FUNCTIONS ---

    function displaySummaryCards() {
        const totalGudang = stokGudang.reduce((sum, item) => sum + item.stok, 0);
        const totalCanvasser = stokCanvasser.reduce((sum, item) => sum + item.stok, 0);
        const totalKeseluruhan = totalGudang + totalCanvasser;

        summaryCardsContainer.innerHTML = `
            <div class="dashboard-summary-card">
                <i class="fas fa-warehouse"></i>
                <div class="card-info">
                    <span class="value">${totalGudang.toLocaleString('id-ID')}</span>
                    <span class="label">Total Stok Gudang</span>
                </div>
            </div>
            <div class="dashboard-summary-card">
                <i class="fas fa-users"></i>
                <div class="card-info">
                    <span class="value">${totalCanvasser.toLocaleString('id-ID')}</span>
                    <span class="label">Total Stok Canvasser</span>
                </div>
            </div>
            <div class="dashboard-summary-card">
                <i class="fas fa-boxes-stacked"></i>
                <div class="card-info">
                    <span class="value">${totalKeseluruhan.toLocaleString('id-ID')}</span>
                    <span class="label">Total Keseluruhan</span>
                </div>
            </div>
        `;
    }

    function renderGudangTable(searchTerm = '') {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredData = stokGudang.filter(item => 
            item.nama.toLowerCase().includes(lowerCaseSearchTerm)
        );

        gudangTableBody.innerHTML = '';
        if (filteredData.length === 0) {
            gudangTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Data tidak ditemukan.</td></tr>';
            return;
        }

        filteredData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.nama}</td>
                <td>${item.provider.toUpperCase()}</td>
                <td><span class="tag tag-${item.jenis}">${item.jenis.replace('-', ' ')}</span></td>
                <td><span class="tag tag-${item.tipe}">${item.tipe}</span></td>
                <td>${item.stok}</td>
            `;
            gudangTableBody.appendChild(row);
        });
    }
    
    function renderCanvasserTable(searchTerm = '') {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filteredData = stokCanvasser.filter(item => 
            item.nama.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.canvasser.toLowerCase().includes(lowerCaseSearchTerm)
        );

        canvasserTableBody.innerHTML = '';
        if (filteredData.length === 0) {
            canvasserTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Data tidak ditemukan.</td></tr>';
            return;
        }

        filteredData.forEach(item => {
            const row = document.createElement('tr');
            // [DIPERBARUI] Kolom Canvasser sekarang menjadi link
            row.innerHTML = `
                <td>${item.nama}</td>
                <td><a href="canvasser-detail.html?name=${encodeURIComponent(item.canvasser)}" class="table-link">${item.canvasser}</a></td>
                <td>${item.provider.toUpperCase()}</td>
                <td><span class="tag tag-${item.jenis}">${item.jenis.replace('-', ' ')}</span></td>
                <td><span class="tag tag-${item.tipe}">${item.tipe}</span></td>
                <td>${item.stok}</td>
            `;
            canvasserTableBody.appendChild(row);
        });
    }

    // --- EVENT LISTENERS ---
    gudangSearchInput.addEventListener('input', (e) => renderGudangTable(e.target.value));
    canvasserSearchInput.addEventListener('input', (e) => renderCanvasserTable(e.target.value));

    // --- INITIALIZATION ---
    displaySummaryCards();
    renderGudangTable();
    renderCanvasserTable();
});
