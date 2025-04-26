const form = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');

form.addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent real form submission
  
  // Optionally, you could add form validation or send to a backend here
  
  successMessage.style.display = 'block'; // Show success message
  form.reset(); // Clear form fields
});
