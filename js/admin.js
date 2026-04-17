// Admin JavaScript Functions
let currentUser = null;

// Initialize admin page
document.addEventListener('DOMContentLoaded', function() {
    // Check if admin is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        if (currentUser.role !== 'admin') {
            window.location.href = 'index.html';
            return;
        }
    } else {
        window.location.href = 'index.html';
        return;
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load dashboard data
    loadAdminDashboard();
});

// Initialize Event Listeners
function initializeEventListeners() {
    // Add user form
    document.getElementById('add-user-form').addEventListener('submit', handleAddUser);
    
    // Add traffic form
    document.getElementById('add-traffic-form').addEventListener('submit', handleAddTraffic);
    
    // Add violation form
    document.getElementById('add-violation-form').addEventListener('submit', handleAddViolation);
    
    // Add notification form
    document.getElementById('add-notification-form').addEventListener('submit', handleAddNotification);
    
    // Notification type change
    document.getElementById('notification-type').addEventListener('change', handleNotificationTypeChange);
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Load page-specific data
        loadPageData(pageId);
    }
}

// Load Page-specific Data
function loadPageData(pageId) {
    switch(pageId) {
        case 'admin-dashboard':
            loadAdminDashboard();
            break;
        case 'manage-users':
            loadUsers();
            break;
        case 'manage-traffic':
            loadTraffic();
            break;
        case 'manage-reports':
            loadReports();
            break;
        case 'manage-violations':
            loadViolations();
            break;
        case 'notifications':
            loadNotifications();
            break;
    }
}

// Dashboard Functions
function loadAdminDashboard() {
    loadAdminStats();
    loadRecentReports();
    loadSystemActivity();
}

function loadAdminStats() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const challans = JSON.parse(localStorage.getItem('challans') || '[]');
    const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
    
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-reports').textContent = reports.length;
    document.getElementById('total-violations').textContent = challans.length;
    document.getElementById('active-locations').textContent = trafficData.length;
}

function loadRecentReports() {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const recentReports = reports.slice(-5).reverse();
    
    const reportsContainer = document.getElementById('recent-reports');
    
    if (recentReports.length === 0) {
        reportsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>No Recent Reports</h3><p>No user reports to display</p></div>';
        return;
    }
    
    reportsContainer.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentReports.map(report => `
                        <tr>
                            <td>${report.userName || 'Unknown'}</td>
                            <td>${report.location}</td>
                            <td>${report.issueType}</td>
                            <td><span class="status status-${report.status}">${report.status.toUpperCase()}</span></td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="viewReportDetails(${report.id})">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function loadSystemActivity() {
    const activities = [
        { icon: 'fa-users', text: 'New user registered', time: '2 hours ago' },
        { icon: 'fa-exclamation-triangle', text: 'Traffic report submitted', time: '3 hours ago' },
        { icon: 'fa-file-invoice', text: 'New violation added', time: '5 hours ago' },
        { icon: 'fa-traffic-light', text: 'Traffic data updated', time: '1 day ago' }
    ];
    
    const activityContainer = document.getElementById('system-activity');
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <i class="fas ${activity.icon}"></i>
            <div class="activity-content">
                <p>${activity.text}</p>
                <small>${activity.time}</small>
            </div>
        </div>
    `).join('');
}

function refreshDashboard() {
    loadAdminDashboard();
    showMessage('Dashboard refreshed', 'success');
}

// Users Management
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const usersTable = document.getElementById('users-table');
    
    if (users.length === 0) {
        usersTable.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><h3>No Users Found</h3><p>No users registered yet</p></div>';
        return;
    }
    
    usersTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="role role-${user.role}">${user.role.toUpperCase()}</span></td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="editUser(${user.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleAddUser(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-user-name').value;
    const email = document.getElementById('new-user-email').value;
    const password = document.getElementById('new-user-password').value;
    const role = document.getElementById('new-user-role').value;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user exists
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('User added successfully', 'success');
    closeModal('add-user-modal');
    document.getElementById('add-user-form').reset();
    loadUsers();
    loadAdminStats();
}

function editUser(userId) {
    showMessage('Edit user functionality - To be implemented', 'info');
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        showMessage('User deleted successfully', 'success');
        loadUsers();
        loadAdminStats();
    }
}

function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm) || 
        user.email.toLowerCase().includes(searchTerm)
    );
    
    const usersTable = document.getElementById('users-table');
    
    if (filteredUsers.length === 0) {
        usersTable.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No Results Found</h3><p>Try different search terms</p></div>';
        return;
    }
    
    usersTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredUsers.map(user => `
                        <tr>
                            <td>${user.id}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td><span class="role role-${user.role}">${user.role.toUpperCase()}</span></td>
                            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="editUser(${user.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function clearUserSearch() {
    document.getElementById('user-search').value = '';
    loadUsers();
}

// Traffic Management
function loadTraffic() {
    const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
    const trafficTable = document.getElementById('traffic-table');
    
    if (trafficData.length === 0) {
        trafficTable.innerHTML = '<div class="empty-state"><i class="fas fa-traffic-light"></i><h3>No Traffic Data</h3><p>No traffic information available</p></div>';
        return;
    }
    
    trafficTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Location</th>
                        <th>Level</th>
                        <th>Description</th>
                        <th>Updated</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${trafficData.map(traffic => `
                        <tr>
                            <td>${traffic.id}</td>
                            <td>${traffic.location}</td>
                            <td><span class="traffic-level traffic-${traffic.level}">${traffic.level.toUpperCase()}</span></td>
                            <td>${traffic.description || '-'}</td>
                            <td>${new Date(traffic.updatedAt).toLocaleString()}</td>
                            <td>
                                <button class="btn btn-sm btn-info" onclick="editTraffic(${traffic.id})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteTraffic(${traffic.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleAddTraffic(e) {
    e.preventDefault();
    
    const location = document.getElementById('new-traffic-location').value;
    const level = document.getElementById('new-traffic-level').value;
    const description = document.getElementById('new-traffic-description').value;
    
    const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
    
    const newTraffic = {
        id: Date.now(),
        location,
        level,
        description,
        updatedAt: new Date().toISOString()
    };
    
    trafficData.push(newTraffic);
    localStorage.setItem('trafficData', JSON.stringify(trafficData));
    
    showMessage('Traffic data added successfully', 'success');
    closeModal('add-traffic-modal');
    document.getElementById('add-traffic-form').reset();
    loadTraffic();
    loadAdminStats();
}

function editTraffic(trafficId) {
    showMessage('Edit traffic functionality - To be implemented', 'info');
}

function deleteTraffic(trafficId) {
    if (confirm('Are you sure you want to delete this traffic data?')) {
        const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
        const filteredTraffic = trafficData.filter(t => t.id !== trafficId);
        localStorage.setItem('trafficData', JSON.stringify(filteredTraffic));
        
        showMessage('Traffic data deleted successfully', 'success');
        loadTraffic();
        loadAdminStats();
    }
}

// Reports Management
function loadReports() {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const reportsTable = document.getElementById('reports-table');
    
    if (reports.length === 0) {
        reportsTable.innerHTML = '<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><h3>No Reports Found</h3><p>No user reports submitted yet</p></div>';
        return;
    }
    
    reportsTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reports.map(report => `
                        <tr>
                            <td>${report.id}</td>
                            <td>${report.userName || 'Unknown'}</td>
                            <td>${report.location}</td>
                            <td>${report.issueType}</td>
                            <td>${report.description}</td>
                            <td>
                                <select class="status-select" onchange="updateReportStatus(${report.id}, this.value)">
                                    <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="approved" ${report.status === 'approved' ? 'selected' : ''}>Approved</option>
                                    <option value="rejected" ${report.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                    <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                            </td>
                            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteReport(${report.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function updateReportStatus(reportId, newStatus) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const reportIndex = reports.findIndex(r => r.id === reportId);
    
    if (reportIndex !== -1) {
        reports[reportIndex].status = newStatus;
        localStorage.setItem('reports', JSON.stringify(reports));
        showMessage('Report status updated successfully', 'success');
    }
}

function deleteReport(reportId) {
    if (confirm('Are you sure you want to delete this report?')) {
        const reports = JSON.parse(localStorage.getItem('reports') || '[]');
        const filteredReports = reports.filter(r => r.id !== reportId);
        localStorage.setItem('reports', JSON.stringify(filteredReports));
        
        showMessage('Report deleted successfully', 'success');
        loadReports();
        loadAdminStats();
    }
}

function filterReports() {
    const filterValue = document.getElementById('report-filter').value;
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    
    const filteredReports = filterValue ? 
        reports.filter(r => r.status === filterValue) : reports;
    
    const reportsTable = document.getElementById('reports-table');
    
    if (filteredReports.length === 0) {
        reportsTable.innerHTML = '<div class="empty-state"><i class="fas fa-filter"></i><h3>No Reports Found</h3><p>No reports match the selected filter</p></div>';
        return;
    }
    
    reportsTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Location</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredReports.map(report => `
                        <tr>
                            <td>${report.id}</td>
                            <td>${report.userName || 'Unknown'}</td>
                            <td>${report.location}</td>
                            <td>${report.issueType}</td>
                            <td>${report.description}</td>
                            <td>
                                <select class="status-select" onchange="updateReportStatus(${report.id}, this.value)">
                                    <option value="pending" ${report.status === 'pending' ? 'selected' : ''}>Pending</option>
                                    <option value="approved" ${report.status === 'approved' ? 'selected' : ''}>Approved</option>
                                    <option value="rejected" ${report.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                    <option value="resolved" ${report.status === 'resolved' ? 'selected' : ''}>Resolved</option>
                                </select>
                            </td>
                            <td>${new Date(report.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteReport(${report.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function viewReportDetails(reportId) {
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    const report = reports.find(r => r.id === reportId);
    
    if (report) {
        showMessage(`Report Details: ${report.description}`, 'info');
    }
}

// Violations Management
function loadViolations() {
    const challans = JSON.parse(localStorage.getItem('challans') || '[]');
    const violationsTable = document.getElementById('violations-table');
    
    if (challans.length === 0) {
        violationsTable.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><h3>No Violations Found</h3><p>No traffic violations recorded yet</p></div>';
        return;
    }
    
    violationsTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User</th>
                        <th>Vehicle</th>
                        <th>Violation Type</th>
                        <th>Fine Amount</th>
                        <th>Status</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${challans.map(challan => {
                        const user = JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === challan.userId);
                        return `
                        <tr>
                            <td>${challan.id}</td>
                            <td>${user ? user.name : 'N/A'}</td>
                            <td>${challan.vehicleNumber}</td>
                            <td>${challan.violationType}</td>
                            <td>₹${challan.fineAmount}</td>
                            <td>
                                <select class="status-select" onchange="updateViolationStatus(${challan.id}, this.value)">
                                    <option value="unpaid" ${challan.status === 'unpaid' ? 'selected' : ''}>Unpaid</option>
                                    <option value="paid" ${challan.status === 'paid' ? 'selected' : ''}>Paid</option>
                                </select>
                            </td>
                            <td>${challan.location || '-'}</td>
                            <td>${new Date(challan.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteViolation(${challan.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleAddViolation(e) {
    e.preventDefault();
    
    const userId = document.getElementById('violation-user-select').value;
    const vehicleNumber = document.getElementById('new-violation-vehicle').value;
    const violationType = document.getElementById('new-violation-type').value;
    const fineAmount = document.getElementById('new-violation-fine').value;
    const location = document.getElementById('new-violation-location').value;
    const violationDate = document.getElementById('new-violation-date').value;
    
    const challans = JSON.parse(localStorage.getItem('challans') || '[]');
    
    const newChallan = {
        id: Date.now(),
        userId: userId ? parseInt(userId) : null,
        vehicleNumber,
        violationType,
        fineAmount: parseFloat(fineAmount),
        status: 'unpaid',
        location,
        violationDate,
        createdAt: new Date().toISOString()
    };
    
    challans.push(newChallan);
    localStorage.setItem('challans', JSON.stringify(challans));
    
    showMessage('Violation added successfully', 'success');
    closeModal('add-violation-modal');
    document.getElementById('add-violation-form').reset();
    loadViolations();
    loadAdminStats();
}

function updateViolationStatus(violationId, newStatus) {
    const challans = JSON.parse(localStorage.getItem('challans') || '[]');
    const challanIndex = challans.findIndex(c => c.id === violationId);
    
    if (challanIndex !== -1) {
        challans[challanIndex].status = newStatus;
        localStorage.setItem('challans', JSON.stringify(challans));
        showMessage('Violation status updated successfully', 'success');
    }
}

function deleteViolation(violationId) {
    if (confirm('Are you sure you want to delete this violation?')) {
        const challans = JSON.parse(localStorage.getItem('challans') || '[]');
        const filteredChallans = challans.filter(c => c.id !== violationId);
        localStorage.setItem('challans', JSON.stringify(filteredChallans));
        
        showMessage('Violation deleted successfully', 'success');
        loadViolations();
        loadAdminStats();
    }
}

// Notifications Management
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const notificationsTable = document.getElementById('notifications-table');
    
    if (notifications.length === 0) {
        notificationsTable.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><h3>No Notifications</h3><p>No notifications sent yet</p></div>';
        return;
    }
    
    notificationsTable.innerHTML = `
        <div class="table-container">
            <table class="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Type</th>
                        <th>Title</th>
                        <th>Message</th>
                        <th>Urgent</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${notifications.map(notification => {
                        const user = notification.userId ? 
                            JSON.parse(localStorage.getItem('users') || '[]').find(u => u.id === notification.userId) : null;
                        return `
                        <tr>
                            <td>${notification.id}</td>
                            <td><span class="notification-type">${notification.type}</span></td>
                            <td>${notification.title}</td>
                            <td>${notification.message}</td>
                            <td>${notification.urgent ? 'Yes' : 'No'}</td>
                            <td>${new Date(notification.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-danger" onclick="deleteNotification(${notification.id})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        </tr>
                    `}).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function handleAddNotification(e) {
    e.preventDefault();
    
    const type = document.getElementById('notification-type').value;
    const userId = document.getElementById('notification-user-select').value;
    const title = document.getElementById('notification-title').value;
    const message = document.getElementById('notification-message').value;
    const urgent = document.getElementById('notification-urgent').checked;
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    
    const newNotification = {
        id: Date.now(),
        userId: type === 'user' ? (userId ? parseInt(userId) : null) : null,
        type,
        title,
        message,
        urgent,
        createdAt: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    showMessage('Notification sent successfully', 'success');
    closeModal('add-notification-modal');
    document.getElementById('add-notification-form').reset();
    loadNotifications();
}

function handleNotificationTypeChange() {
    const type = document.getElementById('notification-type').value;
    const userGroup = document.getElementById('notification-user-group');
    
    if (type === 'user') {
        userGroup.style.display = 'block';
        loadUserSelectOptions();
    } else {
        userGroup.style.display = 'none';
    }
}

function loadUserSelectOptions() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userSelect = document.getElementById('notification-user-select');
    
    userSelect.innerHTML = '<option value="">Select User</option>' + 
        users.map(user => `<option value="${user.id}">${user.name} (${user.email})</option>`).join('');
}

function deleteNotification(notificationId) {
    if (confirm('Are you sure you want to delete this notification?')) {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const filteredNotifications = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
        
        showMessage('Notification deleted successfully', 'success');
        loadNotifications();
    }
}

// Modal Functions
function showAddUserModal() {
    document.getElementById('add-user-modal').style.display = 'block';
}

function showAddTrafficModal() {
    document.getElementById('add-traffic-modal').style.display = 'block';
}

function showAddViolationModal() {
    loadUserSelectOptions();
    document.getElementById('add-violation-modal').style.display = 'block';
}

function showAddNotificationModal() {
    document.getElementById('add-notification-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Utility Functions
function showMessage(message, type = 'info') {
    // Remove any existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Insert at the top of the main content
    const main = document.querySelector('.main .container');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Remove after 4 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
