var app = app || {};

app.user = new app.User();

Backbone.sync = function(method, model, options) {
  if (method === 'create') { // HTTP POST
    if (model instanceof app.Card) {
      $.ajax({
        type: 'POST',
        url: app.Deck.url,
        data: model.toJSON(),
        success: function(data) {},
        fail: function(data) {}
      });
    } else if (model instanceof app.User) {
    
    }
  } else if (method === 'read') { // HTTP GET
    if (model instanceof app.Card) {
    
    } else if (model instanceof app.User) {
    
    }
  } else if (method === 'update') { // HTTP PUT
    if (model instanceof app.Card) {
    
    } else if (model instanceof app.User) {
    
    }
  } else if (method === 'delete') { // HTTP DELETE
    if (model instanceof app.Card) {
    
    } else if (model instanceof app.User) {
    
    }
  }
}

app.TemplateCache = {
  get: function(selector) {
    if (!this.templates) {
      this.templates = {};
    }

    var template = this.templates[selector];
    if (!template) {
      var tmpl = $(selector).html();
      console.log(selector + ": " + tmpl);
      template = _.template(tmpl);
      this.templates[selector] = template;
    }

    return template;
  } 
};

$(function() {
  app.router = new app.Router();
  Backbone.history.start();
  //new app.AppView();
});
