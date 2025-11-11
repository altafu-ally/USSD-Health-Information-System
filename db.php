<?php
$host = "localhost";
$user = "root"; // weka jina lako la database user
$pass = "";     // weka password yako
$dbname = "ussd_health_system";

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>