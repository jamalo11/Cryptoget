<?php
$host = 'localhost';  // Ваш хост
$db = 'wallet_app';   // Название базы данных
$user = 'root';       // Ваш пользователь MySQL
$pass = '';           // Ваш пароль MySQL

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    die("Ошибка подключения: " . mysqli_connect_error());
}
?>