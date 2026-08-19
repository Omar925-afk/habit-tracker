document.getElementById('year').textContent = new Date().getFullYear();

const bookingForm = document.querySelector('form');

if (bookingForm) {
  bookingForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const button = bookingForm.querySelector('button');
    const originalText = button.textContent;
    button.textContent = 'Booked!';
    button.disabled = true;

    setTimeout(() => {
      button.textContent = originalText;
      button.disabled = false;
      bookingForm.reset();
    }, 1800);
  });
}
