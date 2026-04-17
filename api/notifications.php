<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_notifications':
        getNotifications($db);
        break;
    case 'add_notification':
        addNotification($db);
        break;
    case 'get_user_notifications':
        getUserNotifications($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getNotifications($db) {
    $query = "SELECT n.*, u.name as user_name FROM notifications n LEFT JOIN users u ON n.user_id = u.id ORDER BY n.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $notifications]);
}

function getUserNotifications($db) {
    $userId = $_GET['user_id'] ?? '';
    
    $query = "SELECT * FROM notifications WHERE user_id = :user_id OR user_id IS NULL ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $notifications]);
}

function addNotification($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "INSERT INTO notifications (user_id, type, title, message, urgent) VALUES (:user_id, :type, :title, :message, :urgent)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':type', $data['type']);
    $stmt->bindParam(':title', $data['title']);
    $stmt->bindParam(':message', $data['message']);
    $stmt->bindParam(':urgent', $data['urgent']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Notification added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add notification']);
    }
}
?>
