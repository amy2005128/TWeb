<?php
header('Content-Type: application/json; charset=utf-8');

$dataFile = dirname(__DIR__) . '/data/recenzii.json';

if (!file_exists($dataFile)) {
    file_put_contents($dataFile, '[]');
    chmod($dataFile, 0666);
}

if (!is_writable($dataFile)) {
    chmod($dataFile, 0666);
}

function readReviews($file) {
    $raw = file_get_contents($file);
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function saveReviews($file, $reviews) {
    return file_put_contents(
        $file,
        json_encode($reviews, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
        LOCK_EX
    );
}

function field($arr, $key) {
    return isset($arr[$key]) ? trim((string)$arr[$key]) : '';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $company = isset($_GET['company']) ? trim((string)$_GET['company']) : '';
    $reviews = readReviews($dataFile);

    if ($company !== '') {
        $reviews = array_values(array_filter($reviews, function ($r) use ($company) {
            return isset($r['company']) && mb_strtolower($r['company']) === mb_strtolower($company);
        }));
    }

    usort($reviews, function($a, $b) {
        return strtotime($b['created_at'] ?? '') <=> strtotime($a['created_at'] ?? '');
    });

    echo json_encode([
        'success' => true,
        'reviews' => $reviews
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    $company = field($input, 'company');
    $name    = field($input, 'name');
    $comment = field($input, 'comment');
    $rating  = (int)($input['rating'] ?? 0);

    if ($company === '' || $name === '' || $comment === '') {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Compania, numele și comentariul sunt obligatorii.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Ratingul trebuie să fie între 1 și 5.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $reviews = readReviews($dataFile);

    $review = [
        'id'         => uniqid('rev_', true),
        'company'    => $company,
        'name'       => $name,
        'rating'     => $rating,
        'comment'    => $comment,
        'created_at' => date('c')
    ];

    $reviews[] = $review;

    $saved = saveReviews($dataFile, $reviews);

    if ($saved === false) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Nu s-a putut salva recenzia.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'review' => $review,
        'message' => 'Recenzia a fost salvată.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

http_response_code(405);
echo json_encode([
    'success' => false,
    'error' => 'Metodă nepermisă.'
], JSON_UNESCAPED_UNICODE);