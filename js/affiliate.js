// Affiliate form submit
const affiliateForm = document.querySelector('.affiliate-form');

affiliateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thank you! Your affiliate application has been submitted.');
    affiliateForm.reset();
});
