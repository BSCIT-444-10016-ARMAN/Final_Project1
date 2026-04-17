// Global Variables
let currentUser = null;
let isAdmin = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isAdmin = currentUser.role === 'admin';
        
        if (isAdmin) {
            window.location.href = 'admin.html';
        } else {
            showUserInterface();
            showPage('user-dashboard');
        }
    } else {
        showPage('home');
    }
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load sample data if needed
    loadSampleData();
});

// Initialize Event Listeners
function initializeEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', handleUserLogin);
    
    // Register form
    document.getElementById('register-form').addEventListener('submit', handleUserRegistration);
    
    // Admin login form
    document.getElementById('admin-login-form').addEventListener('submit', handleAdminLogin);
    
    // Report form
    document.getElementById('report-form').addEventListener('submit', handleReportSubmit);
    
    // Edit profile form
    document.getElementById('edit-profile-form').addEventListener('submit', handleEditProfile);
    
    // Change password form
    document.getElementById('change-password-form').addEventListener('submit', handleChangePassword);
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
        case 'user-dashboard':
            loadUserDashboard();
            break;
        case 'my-challans':
            loadUserChallans();
            break;
        case 'profile':
            loadUserProfile();
            break;
    }
}

// Show User Interface
function showUserInterface() {
    document.getElementById('main-nav').style.display = 'none';
    document.getElementById('user-nav').style.display = 'flex';
}

// Authentication Functions
function handleUserLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { ...user, role: 'user' };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showMessage('Login successful!', 'success');
        showUserInterface();
        showPage('user-dashboard');
    } else {
        showMessage('Invalid email or password', 'error');
    }
}

function handleUserRegistration(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    
    // Validate passwords
    if (password !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('User with this email already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('Registration successful! Please login.', 'success');
    showPage('login');
}

function handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    
    // Default admin credentials (in real app, this would be server-side)
    if (email === 'admin@traffic.com' && password === 'admin123') {
        currentUser = {
            id: 'admin',
            name: 'Administrator',
            email: 'admin@traffic.com',
            role: 'admin'
        };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        isAdmin = true;
        showMessage('Admin login successful!', 'success');
        window.location.href = 'admin.html';
    } else {
        showMessage('Invalid admin credentials', 'error');
    }
}

function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    showMessage('Logged out successfully', 'success');
    
    // Show main navigation
    document.getElementById('main-nav').style.display = 'flex';
    document.getElementById('user-nav').style.display = 'none';
    
    showPage('home');
}

// User Dashboard Functions
function loadUserDashboard() {
    if (!currentUser) return;
    
    // Update user name
    document.getElementById('user-name').textContent = currentUser.name;
    
    // Load traffic status
    loadTrafficStatus();
    
    // Load notifications
    loadUserNotifications();
    
    // Load location filter
    loadLocationFilter();
}

function loadTrafficStatus() {
    const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
    const trafficContainer = document.getElementById('traffic-status');
    
    if (trafficData.length === 0) {
        trafficContainer.innerHTML = '<div class="empty-state"><i class="fas fa-traffic-light"></i><h3>No Traffic Data</h3><p>Check back later for updates</p></div>';
        return;
    }
    
    trafficContainer.innerHTML = trafficData.map(traffic => `
        <div class="traffic-item traffic-${traffic.level}">
            <h4>${traffic.location}</h4>
            <p>Status: ${traffic.level.toUpperCase()}</p>
            <small>Updated: ${new Date(traffic.updatedAt).toLocaleTimeString()}</small>
        </div>
    `).join('');
}

function loadLocationFilter() {
    const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
    const locationFilter = document.getElementById('location-filter');
    
    const locations = [...new Set(trafficData.map(t => t.location))];
    
    locationFilter.innerHTML = '<option value="">All Locations</option>' + 
        locations.map(location => `<option value="${location}">${location}</option>`).join('');
}

function filterTrafficByLocation() {
    const selectedLocation = document.getElementById('location-filter').value;
    const trafficData = JSON.parse(localStorage.getItem('trafficData') || '[]');
    const trafficContainer = document.getElementById('traffic-status');
    
    const filteredData = selectedLocation ? 
        trafficData.filter(t => t.location === selectedLocation) : trafficData;
    
    if (filteredData.length === 0) {
        trafficContainer.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No Results</h3><p>Try a different location</p></div>';
        return;
    }
    
    trafficContainer.innerHTML = filteredData.map(traffic => `
        <div class="traffic-item traffic-${traffic.level}">
            <h4>${traffic.location}</h4>
            <p>Status: ${traffic.level.toUpperCase()}</p>
            <small>Updated: ${new Date(traffic.updatedAt).toLocaleTimeString()}</small>
        </div>
    `).join('');
}

function loadUserNotifications() {
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    const userNotifications = notifications.filter(n => 
        n.userId === currentUser.id || n.type === 'broadcast'
    );
    
    const notificationsContainer = document.getElementById('user-notifications');
    
    if (userNotifications.length === 0) {
        notificationsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-bell"></i><h3>No Notifications</h3><p>You\'re all caught up!</p></div>';
        return;
    }
    
    notificationsContainer.innerHTML = userNotifications.map(notification => `
        <div class="notification-item ${notification.urgent ? 'urgent' : ''}">
            <h4>${notification.title}</h4>
            <p>${notification.message}</p>
            <small>${new Date(notification.createdAt).toLocaleString()}</small>
        </div>
    `).join('');
}

// Report Issue Functions
function handleReportSubmit(e) {
    e.preventDefault();
    
    const location = document.getElementById('issue-location').value;
    const issueType = document.getElementById('issue-type').value;
    const description = document.getElementById('issue-description').value;
    
    const reports = JSON.parse(localStorage.getItem('reports') || '[]');
    
    const newReport = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        location,
        issueType,
        description,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    reports.push(newReport);
    localStorage.setItem('reports', JSON.stringify(reports));
    
    // Add notification for admin
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
        id: Date.now(),
        userId: null,
        type: 'broadcast',
        title: 'New Report Submitted',
        message: `${currentUser.name} reported a ${issueType} at ${location}`,
        urgent: false,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    showMessage('Report submitted successfully!', 'success');
    document.getElementById('report-form').reset();
    showPage('user-dashboard');
}

// Challans Functions
function loadUserChallans() {
    const challans = JSON.parse(localStorage.getItem('challans') || '[]');
    const userChallans = challans.filter(c => c.userId === currentUser.id);
    
    const challansContainer = document.getElementById('challans-list');
    
    if (userChallans.length === 0) {
        challansContainer.innerHTML = '<div class="empty-state"><i class="fas fa-file-invoice"></i><h3>No Challans</h3><p>Great driving record!</p></div>';
        return;
    }
    
    challansContainer.innerHTML = userChallans.map(challan => `
        <div class="challan-item">
            <div class="challan-info">
                <h4>Vehicle: ${challan.vehicleNumber}</h4>
                <p>Violation: ${challan.violationType}</p>
                <p>Date: ${new Date(challan.createdAt).toLocaleDateString()}</p>
                <p>Location: ${challan.location || 'N/A'}</p>
            </div>
            <div class="challan-status">
                <div class="fine-amount">₹${challan.fineAmount}</div>
                <div class="status-${challan.status}">${challan.status.toUpperCase()}</div>
            </div>
        </div>
    `).join('');
}

// Profile Functions
function loadUserProfile() {
    if (!currentUser) return;
    
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
    document.getElementById('profile-created').textContent = new Date(currentUser.createdAt).toLocaleDateString();
}

function showEditProfileModal() {
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-email').value = currentUser.email;
    document.getElementById('edit-profile-modal').style.display = 'block';
}

function showChangePasswordModal() {
    document.getElementById('change-password-modal').style.display = 'block';
}

function handleEditProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value;
    const email = document.getElementById('edit-email').value;
    
    // Update current user
    currentUser.name = name;
    currentUser.email = email;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].name = name;
        users[userIndex].email = email;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showMessage('Profile updated successfully!', 'success');
    closeModal('edit-profile-modal');
    loadUserProfile();
    loadUserDashboard(); // Update name in dashboard
}

function handleChangePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    // Check current password (in real app, this would be server-side)
    if (currentPassword !== currentUser.password) {
        showMessage('Current password is incorrect', 'error');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update users array
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    showMessage('Password changed successfully!', 'success');
    closeModal('change-password-modal');
    document.getElementById('change-password-form').reset();
}

// Modal Functions
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

function loadSampleData() {
    // Load sample traffic data if none exists
    if (!localStorage.getItem('trafficData')) {
        const sampleTrafficData = [
            {
                id: 1,
                location: 'Main Street & 1st Avenue',
                level: 'low',
                description: 'Light traffic flow',
                updatedAt: new Date().toISOString()
            },
            {
                id: 2,
                location: 'Highway 101 - Exit 25',
                level: 'medium',
                description: 'Moderate congestion',
                updatedAt: new Date().toISOString()
            },
            {
                id: 3,
                location: 'Downtown Circle',
                level: 'high',
                description: 'Heavy traffic, avoid if possible',
                updatedAt: new Date().toISOString()
            },
            {
                id: 4,
                location: 'Airport Road',
                level: 'medium',
                description: 'Normal rush hour traffic',
                updatedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('trafficData', JSON.stringify(sampleTrafficData));
    }
    
    // Load sample notifications if none exists
    if (!localStorage.getItem('notifications')) {
        const sampleNotifications = [
            {
                id: 1,
                type: 'broadcast',
                title: 'Traffic Alert',
                message: 'Heavy traffic reported on Highway 101 - Exit 25',
                urgent: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                type: 'broadcast',
                title: 'System Update',
                message: 'New features have been added to the traffic monitoring system',
                urgent: false,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            }
        ];
        localStorage.setItem('notifications', JSON.stringify(sampleNotifications));
    }
    
    // Load sample challans if none exists
    if (!localStorage.getItem('challans')) {
        const sampleChallans = [
            {
                id: 1,
                userId: 1,
                vehicleNumber: 'MH-12-AB-1234',
                violationType: 'Speeding',
                fineAmount: 500,
                status: 'unpaid',
                location: 'Highway 101',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                userId: 1,
                vehicleNumber: 'MH-12-AB-1234',
                violationType: 'No Parking',
                fineAmount: 200,
                status: 'paid',
                location: 'Downtown Circle',
                createdAt: new Date(Date.now() - 604800000).toISOString()
            }
        ];
        localStorage.setItem('challans', JSON.stringify(sampleChallans));
    }
    
    // Create sample user if none exists
    if (!localStorage.getItem('users')) {
        const sampleUsers = [
            {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem('users', JSON.stringify(sampleUsers));
    }
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
