//only - to show/hide the overlay
window.addEventListener('load',  ()=> {

    document.querySelector('.overlay').style.display = 'flex';
});

setTimeout(() => {
    document.querySelector('.overlay').style.display = 'none';
}, 1000); // hides after 1 second

// loading overlay eka load wunata passe call karanawa
colorActiveSideBarMenuItem();


// table eke loading spin eka load karanwa
function showLoadingOverlayOnTable(loaderId,tableId) {
    const loader = document.getElementById(loaderId);
    const bookingTable = document.getElementById(tableId);
    loader.style.display = ''; // Clear loading after 2 seconds
    bookingTable.style.display = 'none'; // Hide the booking table while loading
    setTimeout(() => {
        const loader = document.getElementById('loaderId');
        loader.style.display = 'none'; // Clear loading after 2 seconds
        bookingTable.style.display = ''; // Hide the booking table while loading
    }, 500);
}