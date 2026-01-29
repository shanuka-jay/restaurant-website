document.addEventListener('DOMContentLoaded', function() {
    const orderNumberSpan = document.getElementById('orderNumber');
    if (orderNumberSpan) {
        orderNumberSpan.textContent = Math.floor(100000 + Math.random() * 900000); // Random 6 digit number
    }
});
