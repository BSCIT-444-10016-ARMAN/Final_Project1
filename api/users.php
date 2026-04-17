<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_users':
        getUsers($db);
        break;
    case 'update_user':
        updateUser($db);
        break;
    case 'delete_user':
        deleteUser($db);
        break;
    case 'get_stats':
        getUserStats($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getUsers($db) {
    $query = "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $users]);
}

function updateUser($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "UPDATE users SET name = :name, email = :email, role = :role WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':role', $data['role']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update user']);
    }
}

function deleteUser($db) {
    $id = $_GET['id'] ?? '';
    
    $query = "DELETE FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete user']);
    }
}

function getUserStats($db) {
    $query = "SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as new_users_this_month
        FROM users";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $stats]);
}
?>
