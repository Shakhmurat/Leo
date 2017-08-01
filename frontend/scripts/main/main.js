'use strict';

$(document).ready(function() {

	if ('objectFit' in document.documentElement.style === false) {
	  var container = document.getElementsByClassName('fit-img-js');
	  for (var i = 0; i < container.length; i++) {
	    var imageSource = container[i].querySelector('img').src;
	    container[i].querySelector('img').style.opacity = '0';
	    container[i].style.backgroundSize = 'cover';
	    container[i].style.backgroundImage = 'url(' + imageSource + ')';
	    container[i].style.backgroundPosition = 'center center';
	    container[i].style.backgroundRepeat = 'no-repeat';
	  }
	} else {
	  console.log('No worries, your browser supports objectFit');
	}
    
  $('.input-search').keyup(function () {
  	var searchValue = $('.input-search').val().toUpperCase();
  	$('.product-item-body').each(function(){
		  if($(this).text().toUpperCase().indexOf(searchValue) > -1) {
		    $(this).parent().show();
		  } else {
		  	$(this).parent().hide();
		  }
		});
  });
  
});

