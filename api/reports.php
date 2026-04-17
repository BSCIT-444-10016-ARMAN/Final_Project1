<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_reports':
        getReports($db);
        break;
    case 'add_report':
        addReport($db);
        break;
    case 'update_report':
        updateReport($db);
        break;
    case 'get_user_reports':
        getUserReports($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getReports($db) {
    $query = "SELECT r.*, u.name as user_name FROM reports r LEFT JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $reports]);
}

function getUserReports($db) {
    $userId = $_GET['user_id'] ?? '';
    
    $query = "SELECT * FROM reports WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $reports = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $reports]);
}

function addReport($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "INSERT INTO reports (user_id, location, issue_type, description) VALUES (:user_id, :location, :issue_type, :description)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':issue_type', $data['issue_type']);
    $stmt->bindParam(':description', $data['description']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Report submitted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to submit report']);
    }
}

function updateReport($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "UPDATE reports SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':status', $data['status']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Report updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update report']);
    }
}
?>
