<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_challans':
        getChallans($db);
        break;
    case 'get_user_challans':
        getUserChallans($db);
        break;
    case 'add_challan':
        addChallan($db);
        break;
    case 'update_challan':
        updateChallan($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getChallans($db) {
    $query = "SELECT c.*, u.name as user_name, u.email as user_email FROM challans c LEFT JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $challans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $challans]);
}

function getUserChallans($db) {
    $userId = $_GET['user_id'] ?? '';
    
    $query = "SELECT * FROM challans WHERE user_id = :user_id ORDER BY created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    
    $challans = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $challans]);
}

function addChallan($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "INSERT INTO challans (user_id, vehicle_number, violation_type, fine_amount, location, violation_date) VALUES (:user_id, :vehicle_number, :violation_type, :fine_amount, :location, :violation_date)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':vehicle_number', $data['vehicle_number']);
    $stmt->bindParam(':violation_type', $data['violation_type']);
    $stmt->bindParam(':fine_amount', $data['fine_amount']);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':violation_date', $data['violation_date']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Challan added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add challan']);
    }
}

function updateChallan($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "UPDATE challans SET status = :status WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':status', $data['status']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Challan updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update challan']);
    }
}
?>
