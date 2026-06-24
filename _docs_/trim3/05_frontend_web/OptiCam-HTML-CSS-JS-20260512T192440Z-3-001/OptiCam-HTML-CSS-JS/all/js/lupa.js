const lupa = document.querySelector('.lupa');
const button = document.getElementById('search-btn');

if (button && lupa) {
    button.addEventListener('click', () => {
        lupa.classList.toggle('scale');
    });
}