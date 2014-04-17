var app = app || {};

app.ToggleView = Backbone.View.extend({

  el: "#toggle-bars",

  template: "#toggle-view",

  events: {
    "click": "toggle"
  },

  initialize: function() {
    this.listenTo(app.user, 'change', this.destroyView);
    this.render();
  },

  render: function() {
    var template = app.TemplateCache.get(this.template);
    this.$el.html(template);
  },

  //custom toggle event using the Slidebars instance
  toggle: function(event) {
    event.preventDefault();
    app.$slidebars.toggle('right');
  },

  /* Destroy this view when the user state changes
   * As long as the name field is not blank, someone is logged in.
   * Here it must be made empty since nothing will replace it.
   */
  destroyView: function() {
    if (app.user.get('firstName') === '') {
      this.undelegateEvents();
      this.$el.empty();
      this.stopListening();
      return this;
    }
  }

});
