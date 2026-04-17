<?php
header('Content-Type: application/json');
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

$action = $_GET['action'] ?? '';

switch($action) {
    case 'get_traffic':
        getTrafficData($db);
        break;
    case 'add_traffic':
        addTrafficData($db);
        break;
    case 'update_traffic':
        updateTrafficData($db);
        break;
    case 'delete_traffic':
        deleteTrafficData($db);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getTrafficData($db) {
    $query = "SELECT * FROM traffic_data ORDER BY updated_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $trafficData = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['success' => true, 'data' => $trafficData]);
}

function addTrafficData($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "INSERT INTO traffic_data (location, level, description) VALUES (:location, :level, :description)";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':level', $data['level']);
    $stmt->bindParam(':description', $data['description']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Traffic data added successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to add traffic data']);
    }
}

function updateTrafficData($db) {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $query = "UPDATE traffic_data SET location = :location, level = :level, description = :description WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $data['id']);
    $stmt->bindParam(':location', $data['location']);
    $stmt->bindParam(':level', $data['level']);
    $stmt->bindParam(':description', $data['description']);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Traffic data updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update traffic data']);
    }
}

function deleteTrafficData($db) {
    $id = $_GET['id'] ?? '';
    
    $query = "DELETE FROM traffic_data WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Traffic data deleted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete traffic data']);
    }
}
?>
