
document.addEventListener('DOMContentLoaded', function () {
    const carousel = 
    document.getElementById("carousel");
    let speed = 1;
    let isHovered = false;

    function autoScroll(){
        if(!isHovered){
            carousel.scrollLeft += speed;

            const halfWidth = carousel.scrollWidth/2;

            if (carousel.scrollLeft >= halfWidth){
                carousel.scrollLeft -= halfWidth;
            }
        }
        requestAnimationFrame(autoScroll);
    }
    autoScroll();

    console.log('DOM fully loaded and parsed');

});
