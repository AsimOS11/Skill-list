// Course data storage key
const STORAGE_KEY = 'skillListCourses';

// Global variable to track which course is being updated/deleted
let currentCourseIndex = null;

// Get courses from browser storage
function getCourses() {
    const courses = localStorage.getItem(STORAGE_KEY);
    return courses ? JSON.parse(courses) : [];
}

// Save courses to browser storage
function saveCourses(courses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

// Calculate percentage
function calculatePercentage(completed, total) {
    // Extract numeric values from strings
    const completedNum = parseFloat(completed);
    const totalNum = parseFloat(total);
    
    if (isNaN(completedNum) || isNaN(totalNum) || totalNum === 0) {
        return 0;
    }
    
    const percentage = (completedNum / totalNum) * 100;
    return Math.min(Math.round(percentage), 100);
}

// Render courses table
function renderCourses() {
    const courses = getCourses();
    const tbody = document.getElementById('courseTableBody');
    const emptyState = document.getElementById('emptyState');
    const totalCoursesEl = document.getElementById('totalCourses');
    
    // Update total courses count
    totalCoursesEl.textContent = courses.length;
    
    // Show empty state if no courses
    if (courses.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }
    
    emptyState.classList.remove('show');
    
    // Render each course
    tbody.innerHTML = courses.map((course, index) => {
        const percentDone = calculatePercentage(course.completed, course.totalVideos);
        const percentLeft = 100 - percentDone;
        
        return `
            <tr style="animation-delay: ${index * 0.1}s">
                <td>${index + 1}</td>
                <td><strong>${course.courseName}</strong></td>
                <td>${course.platform}</td>
                <td class="link-cell">
                    ${course.link ? `<a href="${course.link}" target="_blank" rel="noopener">🔗 View</a>` : '-'}
                </td>
                <td>${course.totalVideos}</td>
                <td>${course.completed || '0'}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentDone}%"></div>
                    </div>
                    <span class="progress-text">${percentDone}%</span>
                </td>
                <td>
                    <span class="progress-text">${percentLeft}%</span>
                </td>
                <td>
                    <button class="btn-update" onclick="openUpdateModal(${index})">📝 Update</button>
                </td>
                <td>
                    <button class="btn-delete" onclick="openDeleteModal(${index})">🗑️ Delete</button>
                </td>
            </tr>
        `;
    }).join('');
}

// Add new course
function addCourse(event) {
    event.preventDefault();
    
    // Get form values
    const courseName = document.getElementById('courseName').value.trim();
    const platform = document.getElementById('platform').value.trim();
    const link = document.getElementById('link').value.trim();
    const totalVideos = document.getElementById('totalVideos').value.trim();
    
    // Validate required fields
    if (!courseName || !platform || !totalVideos) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Create course object with completed initialized to 0
    const course = {
        courseName,
        platform,
        link: link || '',
        totalVideos,
        completed: '0',
        dateAdded: new Date().toISOString()
    };
    
    // Get existing courses and add new one
    const courses = getCourses();
    courses.push(course);
    saveCourses(courses);
    
    // Clear form
    document.getElementById('courseForm').reset();
    
    // Add success animation to button
    const btn = document.querySelector('.btn-add');
    btn.classList.add('success-animation');
    setTimeout(() => btn.classList.remove('success-animation'), 400);
    
    // Render updated table
    renderCourses();
    
    // Scroll to table
    document.querySelector('.table-container').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
}

// Open update modal
function openUpdateModal(index) {
    currentCourseIndex = index;
    const courses = getCourses();
    const course = courses[index];
    
    // Set modal content
    document.getElementById('modalCourseName').textContent = course.courseName;
    document.getElementById('modalCompleted').value = course.completed || '0';
    
    // Show modal
    document.getElementById('updateModal').classList.add('show');
}

// Close update modal
function closeUpdateModal() {
    document.getElementById('updateModal').classList.remove('show');
    currentCourseIndex = null;
}

// Save completion
function saveCompletion() {
    if (currentCourseIndex === null) return;
    
    const completed = document.getElementById('modalCompleted').value.trim();
    
    if (!completed) {
        alert('Please enter completion value!');
        return;
    }
    
    // Get courses and update the specific course
    const courses = getCourses();
    courses[currentCourseIndex].completed = completed;
    saveCourses(courses);
    
    // Close modal and render updated table
    closeUpdateModal();
    renderCourses();
    
    // Show success feedback
    const updateBtn = document.querySelector('.btn-save');
    updateBtn.classList.add('success-animation');
    setTimeout(() => updateBtn.classList.remove('success-animation'), 400);
}

// Open delete modal
function openDeleteModal(index) {
    currentCourseIndex = index;
    document.getElementById('deleteModal').classList.add('show');
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    currentCourseIndex = null;
}

// Confirm delete
function confirmDelete() {
    if (currentCourseIndex === null) return;
    
    // Get courses, remove the selected one, and save
    const courses = getCourses();
    courses.splice(currentCourseIndex, 1);
    saveCourses(courses);
    
    // Close modal and render updated table
    closeDeleteModal();
    renderCourses();
}

// Close modals when clicking outside
window.onclick = function(event) {
    const updateModal = document.getElementById('updateModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.target === updateModal) {
        closeUpdateModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
}

// Handle Enter key in modal
document.addEventListener('keydown', function(event) {
    const updateModal = document.getElementById('updateModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.key === 'Enter' && updateModal.classList.contains('show')) {
        saveCompletion();
    }
    
    if (event.key === 'Escape') {
        if (updateModal.classList.contains('show')) {
            closeUpdateModal();
        }
        if (deleteModal.classList.contains('show')) {
            closeDeleteModal();
        }
    }
});

// Initialize app
function init() {
    // Render existing courses
    renderCourses();
    
    // Add form submit listener
    document.getElementById('courseForm').addEventListener('submit', addCourse);
    
    // Add input validation for numbers
    const totalVideosInput = document.getElementById('totalVideos');
    const modalCompletedInput = document.getElementById('modalCompleted');
    
    // Allow various formats: numbers, "10h", "5.5h", etc.
    const validateInput = (e) => {
        const value = e.target.value;
        // Allow digits, dots, and 'h' for hours
        if (!/^[\d.h\s]*$/i.test(value)) {
            e.target.value = value.slice(0, -1);
        }
    };
    
    totalVideosInput.addEventListener('input', validateInput);
    modalCompletedInput.addEventListener('input', validateInput);
}

// Start app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make functions globally available
window.openUpdateModal = openUpdateModal;
window.closeUpdateModal = closeUpdateModal;
window.saveCompletion = saveCompletion;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
