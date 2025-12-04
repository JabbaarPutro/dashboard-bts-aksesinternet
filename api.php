<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = getenv('MYSQL_HOST') ?: getenv('MYSQLHOST') ?: 'localhost';
$user = getenv('MYSQL_USER') ?: getenv('MYSQLUSER') ?: 'root';
$pass = getenv('MYSQL_PASSWORD') ?: getenv('MYSQLPASSWORD') ?: '';
$db   = getenv('MYSQL_DATABASE') ?: getenv('MYSQLDATABASE') ?: 'db_bts_aksesinternet_dashboard';
$port = getenv('MYSQL_PORT') ?: getenv('MYSQLPORT') ?: 3306;

$conn = new mysqli($host, $user, $pass, $db, $port);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['error' => 'Koneksi database gagal: ' . $conn->connect_error]);
    exit();
}

$type = isset($_GET['type']) ? $_GET['type'] : 'bts';

$pointData = [];
$provinceData = [];
$filters = []; 
$lastUpdated = null;

if ($type === 'bts') {
    $sql = "SELECT id, nama_situs as nama, provinsi, kabupaten, latitude, longitude, status, jaringan, jenis_layanan FROM bts";
    $lastUpdatedQuery = "SELECT MAX(last_updated) as last_updated FROM bts";
    $statusMapping = ['On Air' => 'onAir', 'Dalam Pembangunan' => 'dalamPembangunan'];

} elseif ($type === 'internet') {
    $sql = "SELECT id, nama_lokasi as nama, provinsi, kabupaten, latitude, longitude, status, jenis_layanan FROM akses_internet";
    $lastUpdatedQuery = "SELECT MAX(last_updated) as last_updated FROM akses_internet";
    $statusMapping = ['Aktif' => 'onAir', 'Dalam Instalasi' => 'dalamPembangunan'];
} else {
    echo json_encode(['error' => 'Tipe data tidak valid.']);
    exit();
}

$lastUpdatedResult = $conn->query($lastUpdatedQuery);
if ($lastUpdatedResult && $lastUpdatedResult->num_rows > 0) {
    $row = $lastUpdatedResult->fetch_assoc();
    if ($row['last_updated']) {
        $timestamp = strtotime($row['last_updated']);
        $bulan = [ 1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April', 5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus', 9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember' ];
        $lastUpdated = date('j', $timestamp) . ' ' . $bulan[date('n', $timestamp)] . ' ' . date('Y', $timestamp);
    }
}

$result = $conn->query($sql);

$jaringanTypes = [];
$layananTypes = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $point = [
            'id' => (int)$row['id'],
            'nama_situs' => $row['nama'],
            'provinsi' => $row['provinsi'],
            'kabupaten' => $row['kabupaten'],
            'lat' => (float)$row['latitude'],
            'lon' => (float)$row['longitude'],
            'status' => $row['status'],
        ];

        if ($type === 'bts') {
            $point['jaringan'] = $row['jaringan'];
            $point['jenis_layanan'] = $row['jenis_layanan'];
            if ($row['jaringan'] && !in_array($row['jaringan'], $jaringanTypes)) $jaringanTypes[] = $row['jaringan'];
            if ($row['jenis_layanan'] && !in_array($row['jenis_layanan'], $layananTypes)) $layananTypes[] = $row['jenis_layanan'];
        } else {
            $point['jaringan'] = null;
            $point['jenis_layanan'] = $row['jenis_layanan'];
            if ($row['jenis_layanan'] && !in_array($row['jenis_layanan'], $layananTypes)) $layananTypes[] = $row['jenis_layanan'];
        }
        $pointData[] = $point;


        $provinsi = $row['provinsi'];
        $kabupaten = $row['kabupaten'];
        $status = $row['status'];
        $statusKey = $statusMapping[$status] ?? 'lainnya';

        if (!isset($provinceData[$provinsi])) {
            $provinceData[$provinsi] = ['total' => 0, 'onAir' => 0, 'dalamPembangunan' => 0, 'regencies' => []];
        }
        if (!isset($provinceData[$provinsi]['regencies'][$kabupaten])) {
            $provinceData[$provinsi]['regencies'][$kabupaten] = ['total' => 0, 'onAir' => 0, 'dalamPembangunan' => 0];
        }

        $provinceData[$provinsi]['total']++;
        $provinceData[$provinsi]['regencies'][$kabupaten]['total']++;
        if (isset($provinceData[$provinsi][$statusKey])) {
            $provinceData[$provinsi][$statusKey]++;
            $provinceData[$provinsi]['regencies'][$kabupaten][$statusKey]++;
        }
    }
}
$conn->close();

if ($type === 'bts') {
    sort($jaringanTypes);
    sort($layananTypes);
    $filters['jaringan'] = $jaringanTypes;
    $filters['jenis_layanan'] = $layananTypes;
} else {
    sort($layananTypes);
    $filters['jenis_layanan'] = $layananTypes;
}

$output = [
    'pointData' => $pointData,
    'provinceData' => $provinceData,
    'lastUpdated' => $lastUpdated,
    'filters' => $filters 
];

echo json_encode($output, JSON_PRETTY_PRINT);
?>