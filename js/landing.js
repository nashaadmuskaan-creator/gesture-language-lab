// Landing Page – Mode Selection Handler

function selectMode(mode) {
    // Save selected mode to localStorage
    localStorage.setItem('learningMode', mode);
    
    // Redirect to lab page
    window.location.href = 'lab.html';
}

// Optional: Add smooth scroll for anchor links if needed
document.addEventListener('DOMContentLoaded', () => {
    console.log('Gesture Language Lab – Landing Page Loaded');
});