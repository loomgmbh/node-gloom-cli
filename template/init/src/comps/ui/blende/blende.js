(function($) {
  'use strict';

  Drupal.behaviors.[[THEME_]]__blende = createLOOMComponent('blende', function() {
    this.wrapper = this.element('wrapper');
    this.content = this.element('content');

    this.on('open', this.onOpen.bind(this));
  }, {

    onOpen: function (event, time) {
      time = time || 600;
      if (!this.state('loaded')) {
        var that = this;

        setTimeout(function () {
          that.wrapper.animate({
            height: that.content.height(),
          }, time, function () {
            that.state('finished', true);
            that.wrapper.css('height', '');
          });
          that.state('loaded', true);
        }, 1);
      }
    },

  });

})(jQuery);
