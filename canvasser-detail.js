document.addEventListener('DOMContentLoaded', function() {
    // --- DATA ---
    const allProducts = [
        // Data untuk Ali Akbar
        { canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana XL 10GB', items: [{id: '896001'}, {id: '896002'}, {id: '896003'}, {id: '896004'}, {id: '896005'}] },
        { canvasser: 'Ali Akbar', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', items: [{id: '897001'}, {id: '897002'}, {id: '897003'}] },
        { canvasser: 'Ali Akbar', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 5GB', items: [{id: 'AX5001'}, {id: 'AX5002'}, {id: 'AX5003'}, {id: 'AX5004'}, {id: 'AX5005'}, {id: 'AX5006'}] },
        { canvasser: 'Ali Akbar', provider: 'smartfren', jenis: 'voucher', tipe: 'kosongan', nama: 'Voucher SF Kosongan', items: [{id: 'SF001'}, {id: 'SF002'}] },
        
        // Data untuk Yanuar Efendi
        { canvasser: 'Yanuar Efendi', provider: 'xl', jenis: 'voucher', tipe: 'paket', nama: 'Voucher XL Xtra Combo', items: [{id: 'XLX01'}, {id: 'XLX02'}, {id: 'XLX03'}] },
        { canvasser: 'Yanuar Efendi', provider: 'axis', jenis: 'kartu-perdana', tipe: 'paket', nama: 'Perdana Axis 8GB', items: [{id: '85901'}, {id: '85902'}, {id: '85903'}, {id: '85904'}] },
        { canvasser: 'Yanuar Efendi', provider: 'smartfren', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana SF Kosongan', items: [{id: '88101'}, {id: '88102'}, {id: '88103'}, {id: '88104'}, {id: '88105'}] },

        // Data untuk Yusril
        { canvasser: 'Yusril', provider: 'xl', jenis: 'kartu-perdana', tipe: 'kosongan', nama: 'Perdana XL Kosongan', items: [{id: '897004'}, {id: '897005'}, {id: '897006'}] },
        { canvasser: 'Yusril', provider: 'axis', jenis: 'voucher', tipe: 'paket', nama: 'Voucher Axis AIGO 12GB', items: [{id: 'AX1201'}, {id: 'AX1202'}, {id: 'AX1203'}, {id: 'AX1204'}, {id: 'AX1205'}] },
        { canvasser: 'Yusril', provider: 'smartfren', jenis: 'voucher', tipe: 'paket', nama: 'Voucher SF Unlimited', items: [{id: 'SFU01'}, {id: 'SFU02'}, {id: 'SFU03'}] },
    ];

    // --- STATE ---
    let currentCanvasserProducts = [];
    let qrCodeInstance = null; // Untuk menyimpan instance QRCode

    // --- DOM ELEMENTS ---
    const canvasserNameTitle = document.getElementById('canvasserNameTitle');
    const summaryCardsContainer = document.getElementById('summaryCardsContainer');
    const chartContainer = document.getElementById('chartContainer');
    const productTableBody = document.getElementById('productTableBody');
    const productSearchInput = document.getElementById('productSearchInput');
    const qrCodeModal = document.getElementById('qrCodeModal');
    const qrCodeModalTitle = document.getElementById('qrCodeModalTitle');
    const serialNumberHeader = document.getElementById('serialNumberHeader');
    const serialNumberTableBody = document.getElementById('serialNumberTableBody');
    const closeQrCodeBtn = document.getElementById('closeQrCodeBtn');
    const qrcodeValue = document.getElementById('qrcodeValue');
    const qrcodeContainer = document.getElementById('qrcode');


    // --- FUNCTIONS ---

    function getCanvasserNameFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('name');
    }

    function getProductsByCanvasser(name) {
        return allProducts.filter(p => p.canvasser === name);
    }

    function displayCanvasserInfo(name) {
        canvasserNameTitle.textContent = `Detail Stok: ${name}`;
    }

    function displaySummaryCards(products) {
        const totalStok = products.reduce((sum, p) => sum + p.items.length, 0);
        const uniqueProductCount = products.length;

        summaryCardsContainer.innerHTML = `
            <div class="detail-summary-card">
                <i class="fas fa-box-open"></i>
                <div class="card-info">
                    <span class="value">${totalStok}</span>
                    <span class="label">Total Stok Unit</span>
                </div>
            </div>
            <div class="detail-summary-card">
                <i class="fas fa-tags"></i>
                <div class="card-info">
                    <span class="value">${uniqueProductCount}</span>
                    <span class="label">Jenis Produk</span>
                </div>
            </div>
        `;
    }
    
    function displayStockChart(products) {
        const stockByProvider = products.reduce((acc, p) => {
            acc[p.provider] = (acc[p.provider] || 0) + p.items.length;
            return acc;
        }, {});

        const maxStock = Math.max(...Object.values(stockByProvider), 1);
        
        let chartHTML = '';
        const providerColors = { xl: '#4a90e2', axis: '#8b5cf6', smartfren: '#ef4444' };

        for (const provider in stockByProvider) {
            const stock = stockByProvider[provider];
            const heightPercentage = (stock / maxStock) * 100;
            chartHTML += `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" style="height: ${heightPercentage}%; background-color: ${providerColors[provider] || '#ccc'};">
                        <span class="bar-label">${stock}</span>
                    </div>
                    <span class="bar-title">${provider.toUpperCase()}</span>
                </div>
            `;
        }
        chartContainer.innerHTML = chartHTML;
    }

    function displayProductTable(products, searchTerm = '') {
        productTableBody.innerHTML = '';
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        
        const filteredProducts = products.filter(p => 
            p.nama.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (filteredProducts.length === 0) {
            productTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Produk tidak ditemukan.</td></tr>';
            return;
        }

        filteredProducts.forEach(p => {
            const stok = p.items.length;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${p.nama}</td>
                <td><span class="tag tag-${p.jenis}">${p.jenis.replace('-', ' ')}</span></td>
                <td><span class="tag tag-${p.tipe}">${p.tipe}</span></td>
                <td>${stok}</td>
                <td>
                    <button class="action-btn" data-product-name="${p.nama}">
                        <i class="fas fa-eye"></i> Lihat Detail
                    </button>
                </td>
            `;
            productTableBody.appendChild(row);
        });
    }

    function generateQrCode(text) {
        qrcodeContainer.innerHTML = ''; // Kosongkan QR code sebelumnya
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
            row.dataset.id = item.id; // Tambahkan data-id untuk identifikasi
            row.innerHTML = `<td>${item.id}</td>`;
            // Tandai baris pertama sebagai aktif
            if (index === 0) {
                row.classList.add('active');
            }
            serialNumberTableBody.appendChild(row);
        });

        // Generate QR code dari item pertama
        const firstId = product.items[0]?.id;
        generateQrCode(firstId);

        qrCodeModal.classList.add('show');
    }

    function closeQrCodeModal() {
        qrCodeModal.classList.remove('show');
    }

    // --- EVENT LISTENERS ---
    productSearchInput.addEventListener('input', (e) => {
        displayProductTable(currentCanvasserProducts, e.target.value);
    });

    productTableBody.addEventListener('click', (e) => {
        const detailButton = e.target.closest('.action-btn');
        if (detailButton) {
            const productName = detailButton.dataset.productName;
            const product = currentCanvasserProducts.find(p => p.nama === productName);
            openQrCodeModal(product);
        }
    });
    
    // [BARU] Event listener untuk klik pada tabel serial number
    serialNumberTableBody.addEventListener('click', (e) => {
        const clickedRow = e.target.closest('tr');
        if (!clickedRow) return;

        const allRows = serialNumberTableBody.querySelectorAll('tr');
        allRows.forEach(row => row.classList.remove('active')); // Hapus kelas aktif dari semua baris

        clickedRow.classList.add('active'); // Tambahkan kelas aktif ke baris yang diklik
        
        const idToGenerate = clickedRow.dataset.id;
        generateQrCode(idToGenerate);
    });

    closeQrCodeBtn.addEventListener('click', closeQrCodeModal);
    qrCodeModal.addEventListener('click', (e) => {
        if (e.target === qrCodeModal) {
            closeQrCodeModal();
        }
    });

    // --- INITIALIZATION ---
    const canvasserName = getCanvasserNameFromURL();
    if (canvasserName) {
        currentCanvasserProducts = getProductsByCanvasser(canvasserName);
        
        displayCanvasserInfo(canvasserName);
        displaySummaryCards(currentCanvasserProducts);
        displayStockChart(currentCanvasserProducts);
        displayProductTable(currentCanvasserProducts);
    } else {
        document.body.innerHTML = '<h1 style="text-align: center; margin-top: 50px;">Canvasser tidak ditemukan.</h1><a href="index.html" style="display: block; text-align: center;">Kembali ke Home</a>';
    }
});
