var app = app || {};

app.HeaderView = Backbone.View.extend({
    el: ".navbar-form",

    template: _.template( $('#login_header').html() ),

    initialize: function() {
        this.listenTo(app.user, "set change", this.render);
        this.render();
    },

    render: function() {
        if (localStorage.getItem('deku') !== null) {
            this.template = _.template( $('#logout_header').html() );
            this.$el.html(this.template(app.user.toJSON()));
        } else {
            this.template = _.template( $('#login_header').html() );
            this.$el.html(this.template);
        }
    }
})
