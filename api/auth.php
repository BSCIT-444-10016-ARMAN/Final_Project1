<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$action = $_GET['action'] ?? '';

switch($action) {
    case 'login':
        handleLogin($db);
        break;
    case 'register':
        handleRegister($db);
        break;
    case 'admin_login':
        handleAdminLogin($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function handleLogin($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "SELECT * FROM users WHERE email = :email AND role = 'user'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data['email']);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($data['password'], $user['password'])) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
    }
}

function handleRegister($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Check if user exists
    $query = "SELECT id FROM users WHERE email = :email";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data['email']);
    $stmt->execute();
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        return;
    }
    
    // Create new user
    $query = "INSERT INTO users (name, email, password) VALUES (:name, :email, :password)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt->bindParam(':password', $hashedPassword);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Registration successful']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Registration failed']);
    }
}

function handleAdminLogin($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "SELECT * FROM users WHERE email = :email AND role = 'admin'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $data['email']);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($data['password'], $user['password'])) {
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid admin credentials']);
    }
}
?>
