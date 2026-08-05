$(function(){

    // Activar "all" 
    $('.category-item[category="all"]').addClass('ct_item-active');

    $('.category-item').on('click', function(e){
        e.preventDefault();

        let categoria = $(this).attr('category');

        // Activar botón
        $('.category-item').removeClass('ct_item-active');
        $(this).addClass('ct_item-active');

        // Filtro
        if(categoria === "all"){
            $('.card-pedido').fadeIn();
        } else {
            $('.card-pedido').hide();
            $('.card-pedido[category="'+categoria+'"]').fadeIn();
        }
    });

});