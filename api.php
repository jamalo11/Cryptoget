<?php
require_once 'db.php';

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$requestMethod = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['REQUEST_URI'], '/'));

// Простейший роутинг
if ($path[0] === 'api') {
    if ($path[1] === 'user' && $requestMethod === 'GET') {
        // Получение баланса
        if (isset($path[2], $path[4]) && $path[3] === 'wallet') {
            getWalletBalance($path[2], $path[4]);
        }
        // История транзакций
        elseif (isset($path[2], $path[4]) && $path[3] === 'transactions') {
            getTransactions($path[2], $path[4]);
        }
    } elseif ($path[1] === 'webhook' && $path[2] === 'transactions' && $requestMethod === 'POST') {
        handleTransactionWebhook();
    }
} else {
    echo json_encode(["error" => "Invalid endpoint"]);
}

// Получение баланса кошелька
function getWalletBalance($userId, $network) {
    global $conn;
    $query = "SELECT * FROM wallets WHERE user_id = ? AND network = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'is', $userId, $network);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $wallet = mysqli_fetch_assoc($result);

    if ($wallet) {
        echo json_encode([
            "balance" => $wallet['balance'],
            "address" => $wallet['address']
        ]);
    } else {
        echo json_encode(["error" => "Wallet not found"]);
    }
}

// Получение транзакций
function getTransactions($userId, $type) {
    global $conn;
    $query = "SELECT * FROM transactions WHERE user_id = ? AND type = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'is', $userId, $type);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    $transactions = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $transactions[] = $row;
    }
    echo json_encode($transactions);
}

// Обработка webhook для пополнения
function handleTransactionWebhook() {
    global $conn;
    $data = json_decode(file_get_contents('php://input'), true);

    $userId = $data['user_id'];
    $walletId = $data['wallet_id'];
    $network = $data['network'];
    $token = $data['token'];
    $amount = $data['amount'];
    $txHash = $data['tx_hash'];

    $query = "INSERT INTO transactions (user_id, wallet_id, network, token, amount, tx_hash, type) 
              VALUES (?, ?, ?, ?, ?, ?, 'incoming')";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, 'iissds', $userId, $walletId, $network, $token, $amount, $txHash);
    $success = mysqli_stmt_execute($stmt);

    if ($success) {
        echo json_encode(["message" => "Transaction recorded successfully"]);
    } else {
        echo json_encode(["error" => "Failed to record transaction"]);
    }
}
?>