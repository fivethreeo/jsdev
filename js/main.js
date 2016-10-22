/**
 * Main app initialization and initial auth check
 */

require([
    "jquery", "underscore", "bootstrap", "moment", "datetimepicker"
],
function($, _, Bootstrap, moment) {
  $(document).ready(function(){
    $('.bilder img').each(function(){
      var $this = $(this);
    $(this).parents('.item').css({display:'block'})
    var ratio = 400 / $this.height();
        $this.css({
            width: $this.width()*ratio + 'px',
            margin: '0px auto'
        });
    $(this).parents('.item').css({display:''})
    })
  });

  $(".navbar a[href^='#']").on('click', function(event) {
    $('#header-navtoggle').trigger('click');
    var target;
    target = this.hash;
    $(this).closest('.nav').children().removeClass('active');
    $(this).closest('li').addClass('active');
    event.preventDefault();

    if (target!="#hjem"){  
      $('.navbar').addClass("white");
      $('#kontakt').addClass("show");
    }
    else{
      $('.navbar').removeClass("white");
      $('#kontakt').removeClass("show");
    }

    return $('html, body').animate({
      scrollTop: 0
    }, 0, function() {
      $('.page').addClass('startAnim').removeClass('active')
      var page = $(target).closest('.page')
      page.addClass('active')
      return window.history.pushState(null, null, target);
    });
  });
});
