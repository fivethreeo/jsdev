/**
 * Main app initialization and initial auth check
 */

var $ = require('jquery');

require('bootstrap-sass');
// var _ = require('underscore');
// var moment = require('moment');
var ratioc = 400;

$(document).ready(function () {
    $('.bilder img').each(function () {
        var $this = $(this);

        $(this).parents('.item').css({ display: 'block' });
        var ratio = ratioc / $this.height();

        $this.css({
            width: $this.width() * ratio + 'px',
            margin: '0px auto'
        });
        $(this).parents('.item').css({ display: '' });
    });
    $('body');
});


$(".navbar a[href^='#']").on('click', function (event) {
    $('#header-navtoggle').trigger('click');
    var target;

    target = this.hash;
    $(this).closest('.nav').children().removeClass('active');
    $(this).closest('li').addClass('active');
    event.preventDefault();

    if (target === '#hjem') {
        $('.navbar').removeClass('white');
        $('#kontakt').removeClass('show');
    } else {
        $('.navbar').addClass('white');
        $('#kontakt').addClass('show');
    }

    return $('html, body').animate({
        scrollTop: 0
    }, 0, function () {
        $('.page').addClass('startAnim').removeClass('active');
        var page = $(target).closest('.page');

        page.addClass('active');
        return window.history.pushState(null, null, target);
    });
});
