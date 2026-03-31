<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Metoda nepermisă. Folosește POST.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Date JSON invalide.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function field($arr, $key) {
    return isset($arr[$key]) ? trim((string)$arr[$key]) : '';
}

$required = [
    'prenume', 'nume', 'idnp', 'datan', 'sex', 'pasaport',
    'email', 'tel', 'bagaj', 'bagaj_label', 'total_price'
];

foreach ($required as $f) {
    if (field($input, $f) === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => "Câmpul \"$f\" este obligatoriu."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$idnp = field($input, 'idnp');
$email = field($input, 'email');

if (!preg_match('/^\d{13}$/', $idnp)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'IDNP invalid. Trebuie să conțină exact 13 cifre.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Email invalid.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$dataFile = dirname(__DIR__) . '/data/bilete.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, '[]');
}

$current = file_get_contents($dataFile);
$tickets = json_decode($current, true);

if (!is_array($tickets)) {
    $tickets = [];
}

$nrBilet = 'BL' . strtoupper(substr(uniqid(), -8));

$ticket = [
    'nr_bilet'        => $nrBilet,
    'flight_id'       => field($input, 'flight_id'),
    'dest'            => field($input, 'dest'),
    'date'            => field($input, 'date'),
    'dep'             => field($input, 'dep'),
    'arr'             => field($input, 'arr'),
    'agency'          => field($input, 'agency'),
    'seat'            => field($input, 'seat'),
    'seat_class'      => field($input, 'seat_class'),
    'bagaj'           => field($input, 'bagaj'),
    'bagaj_label'     => field($input, 'bagaj_label'),
    'pasager_prenume' => field($input, 'prenume'),
    'pasager_nume'    => field($input, 'nume'),
    'idnp'            => $idnp,
    'datan'           => field($input, 'datan'),
    'sex'             => field($input, 'sex'),
    'pasaport'        => field($input, 'pasaport'),
    'email'           => $email,
    'tel'             => field($input, 'tel'),
    'from_city'       => field($input, 'from_city'),
    'base_price'      => field($input, 'base_price'),
    'extra_bagaj'     => field($input, 'extra_bagaj'),
    'extra_seat'      => field($input, 'extra_seat'),
    'total_price'     => field($input, 'total_price'),
    'purchased_at'    => date('c')
];

$tickets[] = $ticket;

$result = file_put_contents(
    $dataFile,
    json_encode($tickets, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
    LOCK_EX
);

if ($result === false) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Nu s-a putut salva biletul.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

echo json_encode([
    'success' => true,
    'nr_bilet' => $nrBilet,
    'ticket' => $ticket,
    'message' => 'Biletul a fost salvat cu succes.'
], JSON_UNESCAPED_UNICODE);