$(window).on('resize', scaleElement);

function scaleElement() {
    const screenHeight = window.outerHeight;
    const screenWidth = window.outerWidth;
    const elementHeight = $('.playfield').height() + $('.gameinfo-container').height() + 250;
    const elementWidth = $('.playfield-wrapper').width();

    var scaleY = screenHeight / elementHeight;
    var scaleX = screenWidth / elementWidth;
    var scaleFactor = Math.min(scaleX, scaleY);


    if(screenWidth <= 550) {
        scaleX = ((screenWidth - 250) / (elementWidth));
        scaleY = ((screenHeight - 250) / (elementHeight));
        scaleFactor = Math.min(scaleX, scaleY);
    }

    const currentViewportHeight = window.innerHeight;
    $('#playfield').css('transform', 'scale(' + scaleFactor + ')');
    $('.playfield-wrapper').css('height', currentViewportHeight);
}
