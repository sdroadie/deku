var app = app || {};

app.Router = Backbone.Router.extend({
 
  // current view held in #container
  currentView: null,

  // stores the slidebar and toggle view, children of hand view
  slideView: null,

  toggleView: null,

  profile_view: null,

  // a list of all the existing routes
  routes: {
    '': 'home',
    'register': 'register',
    'profile': 'profile',
    'login': 'login',
    'login_reset': 'loginReset',
    'reset_password': 'resetPassword',
    'new_password': 'newPassword',
    'hand': 'hand',
    'profile/:first/:last/:id': 'profileView',
    'profile/:first/:last/:id/search/:field/:query': 'profileView',
    'search/:field/:query': 'search',
    'update/:first/:last/:id': 'update',
    'card/:id': 'cardById',
    'hidden/card/:id': 'cardById',
    '*notFound': 'notFound'
  },

  /* This function facilitates view transitions for #container
   * Each time it is called, it will delete the current view, as long as it exists.
   * It will then create the new view that was passed in
   */
  changeView: function(view) {
    if (this.currentView !== null) {
      this.currentView.undelegateEvents();
      this.currentView.stopListening();
    }
    this.currentView = view;
  },

  /* This will create the children views for the hand view.
   * These consist of the slidebar and the toggle view. Since they
   * need to be destroyed when the user logs out, it is wise to track them
   */
  setChildren: function() {
    if (this.slideView !== null && this.toggleView !== null) {
      this.removeChildren();
    }
    this.slideView = new app.SlidebarView();
    this.toggleView = new app.ToggleView();
    $('#filter-by').html('No active search');
  },

	// delete the children of the HandView
  removeChildren: function() {
    this.slideView.undelegateEvents();
    this.slideView.stopListening();
    this.toggleView.undelegateEvents();
    this.toggleView.$el.empty();
    this.toggleView.stopListening();
    this.slideView = null;
    this.toggleView = null;
    $('#container').css("width", "100%");
    $('#container').css('marginLeft', 'auto');
  },

  // Route on main load. Checks log in state and decides what to do
  home: function() {
    // no logged in user
    if (localStorage.getItem('deku') === null) {
      // go to register
      this.navigate('register', {trigger: true});
    } else {
      // otherwise go to hand
      this.navigate('hand', {trigger: true});
    }
  },

  /* This is the main route for the website, the create account view.
   * A user defaults to this when they are not logged in, and it must properly
	 * remove any content taht might carry over when a user logs out
   */
  register: function() {
    var that = this;
    // if no user is logged in, we can go here
    if (localStorage.getItem('deku') === null) {
      // do the slidebar and toggle button exist
      if (this.slideView !== null && this.toggleView !== null) {
        // they do, so remove them and close the slidebar (only real permanent solution)
        this.removeChildren();
        app.$slidebars.close();
      }
      $('#container').fadeOut(350, function() {
        // In the case that container was shifted in hand route, undo that here
        $(this).css('margin-left', 'auto');
        that.changeView(new app.CreateView());
  		});
    } else {
      $('#container').fadeOut(350, function() { that.navigate('hand', {trigger: true})});
    }
  },

  // navigation to get to loginView
  login: function() {
    var that = this;
    // if no user is logged in, we can go here
    if (localStorage.getItem('deku') === null) {
      $('#container').fadeOut(350, function() {that.changeView(new app.LoginView());});
    } else {
      $('#container').fadeOut(0, function() { that.navigate('hand', {trigger: true})});
    }
  },

  // navigation to get to a login which should flag the user to update password
  loginReset: function() {
    var that = this;
    // if no user is logged in, we can go here
    if (localStorage.getItem('deku') === null) {
      $('#container').fadeOut(350, function() {that.changeView(new app.LoginView());});
    } else {
      $('#container').fadeOut(0, function() { that.navigate('hand', {trigger: true})});
    }
  },

  // Handles navigation to the password reset view
  resetPassword: function() {
    var that = this;
    // if no user is logged in, we can go here
    if (localStorage.getItem('deku') === null) {
      $('#container').fadeOut(350, function() {that.changeView(new app.PassResetView());});
    } else {
      $('#container').fadeOut(350, function() { that.navigate('hand', {trigger: true})});
    }
  },

  // Handles navigation to the update password view, done after a reset
  newPassword: function() {
    var that = this;
    // if no user is logged in, we can go here
    $('#container').fadeOut(350, function() {that.changeView(new app.NewPasswordView());});
  },

  // navigation to get to InfoView
  profile: function() {
    var that = this;
    // if no user is logged in, we can go here
    if (localStorage.getItem('deku') === null) {
      clearInterval(refreshInterval);
      $('#container').fadeOut(350, function() {that.changeView(new app.InfoView({model: app.user}));});
    } else {
      $('#container').fadeOut(350, function() { that.navigate('hand', {trigger: true})});
    }
  },

  // A little bit tricky, this creates the HandView and the associated children (slidebars and toggle)
  hand: function() {
    var that = this;
    // is there a logged in user
    if (localStorage.getItem('deku') !== null) {
      /* Yes, we can load the page.
       * This is partly a protection against a user that logged out from using the back button
       * from being able to get back to the main site.
       */
      $('#container').fadeOut(0, function() { that.changeView(new app.HandView({"use": "hand"}));});
      //The handView's children must be visible. If the page refreshed they would disappear. This combats that
      if (this.slideView === null && this.toggleView === null) {
        // they do, so remove them and close the slidebar (only real permanent solution)
        this.setChildren();
      }
      $('#filter-by').html('No active search');
      if (!$('#default').is(":visible")) {
        $('#default').show('medium');
      }
    } else {
      $('#container').fadeOut(350, function() { that.navigate('login', {trigger: true})});
    }
  },

  search: function(field, query) {
    var that = this;
    // is there a logged in user
    if (localStorage.getItem('deku') !== null) {
      //The handView's children must be visible. If the page refreshed they would disappear. This combats that
			if (this.slideView === null && this.toggleView === null) {
			// they do, so remove them and close the slidebar (only real permanent solution)
      	this.setChildren();
      	$('#default').hide(); // don't ever show the create card option
    	}
      // hides the ability to create while not in hand route
    	$('#default').hide('medium');
      // search should open by default
      if (!$('#search-default').hasClass('expanded')) {
        $('.collapsed').removeClass('expanded')
        .children().hide('medium');
        $('#search-default').toggleClass('expanded')
		 		.children('ul').toggle('medium');
      }

      /* This logic will clear the existing masonry elements
       * Every new search should clear the hand and show the new stuff
       * Always load hand view for searching, this gives access to app.Deck and app.msnry
       */
      this.changeView(new app.HandView({'use': 'search'}));
      clearInterval(refreshInterval);
      msnry_items = app.msnry.getItemElements();
      app.msnry.remove(msnry_items);
      app.msnry.layout();
      
      // confirm values exist
      if (field === '' || query === '') {
        app.router.navigate('hand', {trigger: true});
      } else {
        if (field === 'author') {
          query = query.replace('_', ',');
        }
        app.Deck.searchBy(field + '/' + query);
        $('#filter-by').html('Searching for ' + query.replace(',', ' '));
      }
    } else {
      $('#container').fadeOut(350, function() { that.navigate('login', {trigger: true})});
    }
  },

  // for notifications and viewing cards, this will show just the one card
  cardById: function(id) {
    var that = this;
    // is there a logged in user
    if (localStorage.getItem('deku') !== null) {
      //The handView's children must be visible. If the page refreshed they would disappear. This combats that
			if (this.slideView === null && this.toggleView === null) {
			// they do, so remove them and close the slidebar (only real permanent solution)
      	this.setChildren();
      	$('#default').hide(); // don't ever show the create card option
    	}
      // hides the ability to create while not in hand route
    	$('#default').hide('medium');

      /* This logic will clear the existing masonry elements
       * Every new search should clear the hand and show the new stuff
       * Always load hand view for searching, this gives access to app.Deck and app.msnry
       */
      this.changeView(new app.HandView({'use': 'cardById'}));
      clearInterval(refreshInterval);
      msnry_items = app.msnry.getItemElements();
      app.msnry.remove(msnry_items);
      app.msnry.layout();
      
      app.Deck.fetchById(id);
    } else {
      $('#container').fadeOut(350, function() { that.navigate('login', {trigger: true})});
    }
  },

  /* Shows the profile page of the specified user. Uses the id for the API call
   * For security, it also checks against the given name from what is received by the API call
   */
  profileView: function(first, last, id, field, query){
    var that = this;
    // is there a logged in user
    if (localStorage.getItem('deku') !== null) {
      clearInterval(refreshInterval);
      $.get("http://localhost:4568/deku/api/users/" + id, function(data) {
        var profile = new app.User(data['user']);
        // this checks the name as well. Just ID was not secure
        if (first === profile.get('firstName') && last === profile.get('lastName')) {
          if (that.slideView === null && that.toggleView === null) {
            // show the slidebars if they are not out yet
            that.setChildren();
          }
          if (that.profile_view !== null) {
            that.profile_view.undelegateEvents();
            that.profile_view.stopListening();
          } 
          $('#filter-by').html('No active search');
          $('#default').hide('medium');
          // reside on the hand view to have access to deck and msnry
          $('#container').fadeOut(0, function() {that.changeView(new app.HandView({'use': 'profile'}))});
          // clear previous masonry objects
          msnry_items = app.msnry.getItemElements();
          app.msnry.remove(msnry_items);
          app.msnry.layout();
          
          var el = '#container';
          that.profile_view = new app.ProfileView({
            model: profile
          });
          
          //this is the cards content
          var elem = that.profile_view.render();
          $(el).prepend(elem); //add to the container
          var stampElem = $('#profile-wrapper');
          app.msnry.stamp(stampElem);
         
          // if the user doesn't exist
          if (id === -1) {
            // go to hand if it's faulty
            app.router.navigate('hand', {trigger: true});
          } else {
            // make the API GET call
            if (field !== null && query !== null) {
              if (field === 'author') {
                query = query.replace('_', ',');
              }
              route = id + '/search/' + field + '/' + query;
              app.Deck.fetchProfile(route);
              $('#filter-by').html('Searching for ' + query.replace(',', ' '));
            } else {
              app.Deck.fetchProfile(id);
            }
          }
        } else {
          // trigger a not found page load
          $('#container').fadeOut(350, function() { that.navigate('user_not_found', {trigger: true})});
        }
      })
      .fail(function() {
        // trigger a not found page load
        $('#container').fadeOut(350, function() { that.navigate('user_not_found', {trigger: true})});
      });
    } else {
      $('#container').fadeOut(350, function() { that.navigate('login', {trigger: true})});
    }
	},

  // view for updating user's information
  update: function(first, last, id) {
    var that = this;
    // is there a logged in user
    if (localStorage.getItem('deku') !== null) {
      clearInterval(refreshInterval);
      // prevents someone from accessing the update view of another user
      if (parseInt(id) === app.user.get('id')) {
        // slidebar should not appear when the user is updating their account
        if (this.slideView !== null && this.toggleView !== null) {
          // they do, so remove them and close the slidebar (only real permanent solution)
          this.removeChildren();
          app.$slidebars.close();
        }
        $('#container').fadeOut(0, function() { that.changeView(new app.UpdateAccountView()); });
      } else {
        $('#container').fadeOut(0, function() { that.navigate('hand', {trigger: true})});
      }
    } else {
      $('#container').fadeOut(350, function() { that.navigate('login', {trigger: true})});
    }
  },

  // very simple 404 route. Anything that doesn't match and existing route definition goes here.
  notFound: function(notFound) {
    var that = this;
    // do the slidebar and toggle button exist
    if (this.slideView !== null && this.toggleView !== null) {
      clearInterval(refreshInterval);
      // they do, so remove them and close the slidebar (only real permanent solution)
      this.removeChildren();
      app.$slidebars.close();
    }
    $('#container').fadeOut(350, function() {
      // In the case that container was shifted in hand route, undo that here
      $(this).css('margin-left', 'auto');
      that.changeView(new app.NotFoundView());
  	});
  }
});
