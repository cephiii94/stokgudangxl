// Konfigurasi Aplikasi
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ZgVsEy-2l4aREU5C4rnn2X7FptYZj0KtgswA8ojL-40/edit?usp=sharing'; // GANTI DENGAN LINK ANDA
// [DITAMBAHKAN] Nama sheet 'Pengumuman'
const SHEET_NAMES = ['Gudang', 'Ali Akbar', 'Yanuar Efendi', 'Yusril', 'totalstok', 'Pengumuman']; 

// Fungsi untuk mengubah link Google Sheet menjadi link unduhan CSV
function getSheetCsvUrl(baseUrl, sheetName) {
    const sheetId = baseUrl.split('/d/')[1].split('/')[0];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// Fungsi untuk mengubah teks CSV menjadi array objek JSON
function csvToJson(csv) {
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines.shift().split(',').map(header => header.replace(/^"|"$/g, '').trim());
    const jsonResult = [];

    lines.forEach(line => {
        const obj = {};
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let char of line) {
            if (char === '"' && inQuotes && current.slice(-1) === '"') {
                current += char;
            } else if (char === '"' && inQuotes) {
                inQuotes = false;
            } else if (char === '"' && !inQuotes) {
                inQuotes = true;
            } else if (char === ',' && !inQuotes) {
                values.push(current.replace(/^"|"$/g, '').trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.replace(/^"|"$/g, '').trim());

        if (values.length === headers.length) {
            headers.forEach((header, i) => {
                obj[header] = values[i];
            });
            jsonResult.push(obj);
        }
    });

    return jsonResult;
}

// Fungsi utama untuk mengambil dan memproses semua data
async function fetchAndProcessData() {
    console.log("Mulai mengambil data...");
    const allItems = [];
    let gudangSummaryData = [];
    
    // [BARU] Variabel global untuk data pengumuman
    window.pengumumanData = [];
    
    window.updateTimestamps = {
        gudang: null,
        canvassers: {}
    };

    for (const sheetName of SHEET_NAMES) {
        const url = getSheetCsvUrl(GOOGLE_SHEET_URL, sheetName);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`Gagal mengambil data untuk sheet: ${sheetName}`);
                continue;
            }
            const csvText = await response.text();
            const jsonData = csvToJson(csvText);

            if (sheetName === 'totalstok') {
                gudangSummaryData = jsonData;
                if (jsonData.length > 0 && jsonData[0].LastUpdate) {
                    window.updateTimestamps.gudang = jsonData[0].LastUpdate;
                }
            } else if (sheetName === 'Pengumuman') {
                // [BARU] Menyimpan data dari sheet Pengumuman
                window.pengumumanData = jsonData;
            } else {
                if (sheetName !== 'Gudang' && jsonData.length > 0 && jsonData[0].LastUpdate) {
                    window.updateTimestamps.canvassers[sheetName] = jsonData[0].LastUpdate;
                }

                jsonData.forEach(item => {
                    if (sheetName === 'Gudang') {
                        item.Lokasi = 'Gudang';
                        item.Canvasser = null;
                        item.Status = 'Alokasi';
                    } else {
                        item.Lokasi = 'Canvasser';
                        item.Canvasser = sheetName;
                    }
                    allItems.push(item);
                });
            }
        } catch (error) {
            console.error(`Error saat memproses sheet ${sheetName}:`, error);
        }
    }

    // Proses data ringkasan gudang
    window.gudangSummary = gudangSummaryData.map(item => ({
        nama: (item.NamaProduk || '').trim(),
        provider: (item.Provider || '').toLowerCase().trim(),
        jenis: (item.Jenis || '').toLowerCase().trim().replace(/ /g, '-'),
        tipe: (item.Tipe || '').toLowerCase().trim(),
        stok: parseInt(item.Total, 10) || 0
    }));

    // Mengelompokkan item berdasarkan produk
    const groupedData = allItems.reduce((acc, item) => {
        const trimmedNamaProduk = (item.NamaProduk || '').trim();
        if (!trimmedNamaProduk) return acc;

        const key = `${trimmedNamaProduk}-${item.Canvasser || 'Gudang'}`;
        if (!acc[key]) {
            acc[key] = {
                nama: trimmedNamaProduk,
                provider: (item.Provider || '').toLowerCase().trim(),
                jenis: (item.Jenis || '').toLowerCase().trim().replace(/ /g, '-'),
                tipe: (item.Tipe || '').toLowerCase().trim(),
                lokasi: item.Lokasi,
                canvasser: item.Canvasser,
                items: []
            };
        }
        acc[key].items.push({
            id: item.SerialNumber,
            status: item.Status
        });
        return acc;
    }, {});
    
    console.log("Data berhasil diambil dan diproses.");
    window.processedData = Object.values(groupedData);
    return { gudangSummary: window.gudangSummary, processedData: window.processedData };
}

// Menjalankan pengambilan data saat script dimuat
document.addEventListener('DOMContentLoaded', () => {
    const dataReadyEvent = new Event('dataReady');
    
    fetchAndProcessData().then(() => {
        document.dispatchEvent(dataReadyEvent);
    }).catch(error => {
        console.error("Gagal memuat data aplikasi:", error);
        document.body.innerHTML = `<div style="text-align: center; padding: 50px;"><h1>Gagal memuat data</h1><p>Pastikan link Google Sheet benar dan sudah dibagikan.</p></div>`;
    });
});