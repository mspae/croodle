import { observer } from '@ember/object';
import $ from 'jquery';
import { scheduleOnce, next } from '@ember/runloop';
import Component from '@ember/component';
import moment from 'moment';
import { groupBy } from 'ember-awesome-macros/array';

export default Component.extend({
  didInsertElement() {
    this._super();
    scheduleOnce('afterRender', this, function() {
      /*
       * adding floatThead jQuery plugin to poll table
       * https://mkoryak.github.io/floatThead/
       *
       * top:
       *   Offset from the top of the `window` where the floating header will
       *   'stick' when scrolling down
       * Since we are adding a browser horizontal scrollbar on top, scrollingTop
       * has to be set to height of horizontal scrollbar which depends on
       * used browser
       */
      $('.user-selections-table').floatThead({
        position: 'absolute',
        top: this.getScrollbarHeight
      });

      /*
       * fix width calculation error caused by bootstrap glyphicon on webkit
       */
      $('.glyphicon').css('width', '14px');

      /*
       * scrollbar on top of table
       */
      const topScrollbarInner = $('<div></div>')
              .css('width', $('.user-selections-table').width())
              .css('height', '1px');
      const topScrollbarOuter = $('<div></div>')
              .addClass('top-scrollbar')
              .css('width', '100%')
              .css('overflow-x', 'scroll')
              .css('overflow-y', 'hidden')
              .css('position', 'relative')
              .css('z-index', '1002');
      $('.table-scroll').before(
        topScrollbarOuter.append(topScrollbarInner)
      );

      /*
       * scrollbar on top of table for thead
       */
      const topScrollbarInnerThead = $('<div></div>')
              .css('width', $('.user-selections-table').width())
              .css('height', '1px');
      const topScrollbarOuterThead = $('<div></div>')
              .addClass('top-scrollbar-floatThead')
              .css('width', $('.table-scroll').outerWidth())
              .css('overflow-x', 'scroll')
              .css('overflow-y', 'hidden')
              .css('position', 'fixed')
              .css('top', '-1px')
              .css('z-index', '1002')
              .css('margin-left', `${($('.table-scroll').outerWidth() - $('.table-scroll').width()) / 2 * (-1)}px`)
              .css('margin-right', `${($('.table-scroll').outerWidth() - $('.table-scroll').width()) / 2 * (-1)}px`);
      $('.table-scroll').prepend(
        topScrollbarOuterThead.append(topScrollbarInnerThead).hide()
      );

      // add listener to resize scrollbars if window get resized
      $(window).resize(this.resizeScrollbars);

      /*
       * bind scroll event on all scrollbars
       */
      $('.table-scroll').scroll(function() {
        $('.top-scrollbar').scrollLeft($('.table-scroll').scrollLeft());
        $('.top-scrollbar-floatThead').scrollLeft($('.table-scroll').scrollLeft());
      });
      $('.top-scrollbar').scroll(function() {
        $('.table-scroll').scrollLeft($('.top-scrollbar').scrollLeft());
        $('.top-scrollbar-floatThead').scrollLeft($('.top-scrollbar').scrollLeft());
      });
      $('.top-scrollbar-floatThead').scroll(function() {
        $('.table-scroll').scrollLeft($('.top-scrollbar-floatThead').scrollLeft());
        $('.top-scrollbar').scrollLeft($('.top-scrollbar-floatThead').scrollLeft());
      });

      /*
       * show inner scrollbar only, if header is fixed
       */
      $(window).scroll($.proxy(this.updateScrollbarTopVisibility, this));
    });
  },

  /*
   * calculates horizontal scrollbar height depending on current browser
   */
  getScrollbarHeight() {
    const wideScrollWtml = $('<div>').attr('id', 'wide_scroll_div_one').css({
      'width': 50,
      'height': 50,
      'overflow-y': 'scroll',
      'position': 'absolute',
      'top': -200,
      'left': -200
    }).append(
      $('<div>').attr('id', 'wide_scroll_div_two').css({
        'height': '100%',
        'width': 100
      })
    );
    $('body').append(wideScrollWtml); // Append our div and add the hmtl to your document for calculations
    const scrollW1 = $('#wide_scroll_div_one').height(); // Getting the width of the surrounding(parent) div - we already know it is 50px since we styled it but just to make sure.
    const scrollW2 = $('#wide_scroll_div_two').innerHeight(); // Find the inner width of the inner(child) div.
    const scrollBarWidth = scrollW1 - scrollW2; // subtract the difference
    $('#wide_scroll_div_one').remove(); // remove the html from your document
    return scrollBarWidth;
  },

  optionsGroupedByDates: groupBy('options', 'optionsGroupedBy', function(groupValue, currentValue) {
    // have to parse the date cause due to timezone it may start with another day string but be at same day due to timezone
    // e.g. '2015-01-01T23:00:00.000Z' and '2015-01-02T00:00:00.000Z' both are at '2015-01-02' for timezone offset '+01:00'
    return moment(groupValue).format('YYYY-MM-DD') === moment(currentValue).format('YYYY-MM-DD');
  }),
  optionsGroupedBy: 'title',

  /*
   * resize scrollbars
   * used as event callback when window is resized
   */
  resizeScrollbars() {
    $('.top-scrollbar div').css('width', $('.user-selections-table').width());
    $('.top-scrollbar-floatThead').css('width', $('.table-scroll').outerWidth());
    $('.top-scrollbar-floatThead div').css('width', $('.user-selections-table').width());
  },

  /*
   * resize scrollbars if document height might be changed
   * and therefore scrollbars might be added
   */
  triggerResizeScrollbars: observer('controller.isEvaluable', 'controller.model.users.[]', function() {
    next(() => {
      this.resizeScrollbars();
    });
  }),

  /*
   * show / hide top scrollbar depending on window position
   * used as event callback when window is scrolled
   */
  updateScrollbarTopVisibility() {
    const windowTop = $(window).scrollTop();
    const tableTop = $('.table-scroll table').offset().top;
    if (windowTop >= tableTop - this.getScrollbarHeight()) {
      $('.top-scrollbar-floatThead').show();

      // update scroll position
      $('.top-scrollbar-floatThead').scrollLeft($('.table-scroll').scrollLeft());
    } else {
      $('.top-scrollbar-floatThead').hide();
    }
  },

  /*
   * clean up
   * especially remove event listeners
   */
  willDestroyElement() {
    $(window).off('resize', this.resizeScrollbars);
    $(window).off('scroll', this.updateScrollbarTopVisibility);
  }
});
