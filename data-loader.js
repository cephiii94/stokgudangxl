// Konfigurasi Aplikasi
const GOOGLE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ZgVsEy-2l4aREU5C4rnn2X7FptYZj0KtgswA8ojL-40/edit?usp=sharing'; // GANTI DENGAN LINK ANDA
const SHEET_NAMES = ['Gudang', 'Ali Akbar', 'Yanuar Efendi', 'Yusril', 'totalstok']; // Tambahkan nama canvasser baru di sini

// Fungsi untuk mengubah link Google Sheet menjadi link unduhan CSV
function getSheetCsvUrl(baseUrl, sheetName) {
    const sheetId = baseUrl.split('/d/')[1].split('/')[0];
    return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

// [DIPERBARUI] Fungsi untuk mengubah teks CSV menjadi array objek JSON yang lebih andal
function csvToJson(csv) {
    // Hapus baris kosong di akhir jika ada
    const lines = csv.trim().split('\n');
    if (lines.length < 2) return []; // Kembalikan array kosong jika tidak ada data

    // Ambil header dan hapus kutip ganda yang mungkin ada
    const headers = lines.shift().split(',').map(header => header.replace(/^"|"$/g, '').trim());
    const jsonResult = [];

    lines.forEach(line => {
        const obj = {};
        // Regex untuk mem-parsing baris CSV, menangani field yang dikutip
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
        } else {
            console.warn('Baris CSV dilewati karena jumlah kolom tidak cocok:', line);
        }
    });

    return jsonResult;
}


// Fungsi utama untuk mengambil dan memproses semua data
async function fetchAndProcessData() {
    console.log("Mulai mengambil data...");
    const allItems = [];
    let gudangSummaryData = [];

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
            } else {
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

    // Proses data ringkasan gudang dari sheet 'totalstok'
    window.gudangSummary = gudangSummaryData.map(item => ({
        nama: (item.NamaProduk || '').trim(),
        provider: (item.Provider || '').toLowerCase().trim(),
        jenis: (item.Jenis || '').toLowerCase().trim().replace(/ /g, '-'),
        tipe: (item.Tipe || '').toLowerCase().trim(),
        stok: parseInt(item.Total, 10) || 0
    }));

    // Mengelompokkan item berdasarkan NamaProduk, Provider, Jenis, Tipe, dan Canvasser untuk detail SN
    const groupedData = allItems.reduce((acc, item) => {
        const trimmedNamaProduk = (item.NamaProduk || '').trim();
        if (!trimmedNamaProduk) return acc; // Lewati jika nama produk kosong

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