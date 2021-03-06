var app = app || {};

app.UpdateAccountView = Backbone.View.extend({

  el: "#container",

  template: "#update-view",

  events: {
    'click #edit': 'edit',
    'click #cancel': 'cancel',
    'click #save': 'save',
    'click #delete': 'deleteAccount'
  },

  initialize: function() {
    this.$el.empty();
    this.render();
  },

  render: function() {
    var template = app.TemplateCache.get(this.template);
    var html = template(app.user.toJSON());
    this.$el.prepend(html).show()
    .css('margin-left', 'auto'); //center align content
    $('.edit-data').hide();
    $('#editSC').hide();
  },

  /* This will bring up the edit options for everything and
   * reset them to their current values in app.user.
   * This was just a bit easier code-wise than editting one by one.
   * The user can change anything, even password. They just use
   * the old password when confirming changes
   */
  edit: function(event) {
    event.preventDefault();
    // hide all the static data, show edit fields.
    $('#edit').hide();
    $('#editSC').show();
    $('.current-data').hide();
    $('.edit-data').show();

    class_list = ["CMSC 304", "CMSC 345", "CMSC 313", "CMSC 331", "CMSC 341", "STAT 355", "CMSC 201", "CMSC 202"];
    
    // reset data in the input fields, just for safety
    $('#fname-input').val(app.user.get('firstName'));
    $('#lname-input').val(app.user.get('lastName'));
    $('#email-input').val(app.user.get('email'));
    $('#major-input').val(app.user.get('major'));
    $('#classes-input').tagit({
      availableTags: class_list,
      removeConfirmation: true,
      allowSpaces: true,
      tagLimit: 8,
      beforeTagAdded: function(event, ui) {
        // this makes sure the class you entered is a real class
        if ($.inArray(ui.tagLabel.trim(), class_list) === -1) {
          $('.ui-widget-content').val('')
          .attr('placeholder', 'Enter a valid class');
          return false;
        } else {
          return true;
        }
      },
      onTagLimitExceeded: function(event, ui) {
        $('.ui-widget-content').val('');
      }
    });
    $('.ui-autocomplete-input').addClass('tagit-field');
    classes = app.user.get('classes');
    for (c in classes) {
      $('#classes-input').tagit('createTag', classes[c]);
    }
    $('#year-input').val(app.user.get('grad_year'));
    $('#bio-input').val(app.user.get('bio'));
  },

  /* Check all the values in the form to see if they are passing expected values
   */
  formError: function(values) {
    error = false;
    major_list = $('#major-list').children().map(function() { return this.value;}).get();
    year_list = $('#year-list').children().map(function() { return this.value;}).get();
		email_reg = /^\w+([-_.]\w+)*@\w+.edu$/;

    if (values.bio === '') {
      error = true;
      $('#bio-input').val(app.user.get('bio'));
    }

		if (values.grad_year === '' || $.inArray(values.grad_year, year_list) === -1){
      error = true;
      $('#year-input').val(app.user.get('grad_year'));
    }

    if (values.classes === '[]') {
      error = true;
      $('#classes-input').tagit('removeAll');
      classes = app.user.get('classes');
      for (c in classes) {
        $('#classes-input').tagit('createTag', classes[c]);
      }
    }

		if (values.major === '' || $.inArray(values.major, major_list) === -1) {
      error = true;
      $('#major-input').val(app.user.get('major'));
    }

		if (values.password.length < 8 || values.password !== $('#password-confirm').val()) {
      if (values.password.length !== 0 && $("#password-confirm").val().length !== 0) {
        error = true;
        $('#password-input').val('')
        .attr('placeholder', 'Enter new password...');
        $('#password-confirm').val('')
        .attr('placeholder', 'Confirm new password...');
      }
    }
    
    if (!email_reg.test(values.email)) {
      error = true;
      $('#emain-input').val(app.user.get('email'));
    }

    if (values.lastName === '') {
      error = true;
      $('#lname-input').val(app.user.get('lastName'));
    }
 
    if (values.firstName === '') {
      error = true;
      $('#fname-input').val(app.user.get('firstName'));
    }

    return error;
  },

  /* This will take all of the data from the document and bundle it in a JSON packet.
   * Then it asks for user password and sends everything to the server
   */
  save: function(event) {
    event.preventDefault();

    var class_array = $('#classes-input').tagit('assignedTags');
    updateValues = {
      firstName: $("#fname-input").val(),
      lastName: $("#lname-input").val(),
      email: $("#email-input").val(),
      password: $("#password-input").val(),
      major: $("#major-input").val(),
      classes: JSON.stringify(class_array),
      grad_year: $("#year-input").val(),
      bio: $("#bio-input").val(),
      confirm_password: ''
    }

    var that = this;

    if (!this.formError(updateValues)) {
      bootbox.prompt("Enter password to save your changes. If you changed your password, enter your old password.", function(result) {
        if (result !== null) {
          updateValues.confirm_password = result;
          var url = "http://localhost:4568/deku/api/users/update/" + app.user.get('id');
          $.post(url, updateValues, function( data, textStatus, jqXHR ) {
              // Store that user in localStorage for persistent user state.
              localStorage.setItem('deku', JSON.stringify(data['user']));
              app.user.set(data['user']);
              route = "update/" + app.user.get('firstName') + "/" + app.user.get('lastName') + '/' + app.user.get('id');
              // if name didn't change, reset the url
              if (Backbone.history.fragment === route) {
                Backbone.history.loadUrl(Backbone.history.fragment);
              } else {
                // otherwise refresh the view with the new route
                app.router.navigate(route, {trigger: true});
              }
          })
          .fail(function() {
              bootbox.alert("Sorry, your password didn't match.");
          });
        }
      });
      // little bit of a cheeky hack to make the prompt input take a password field instead of straight text.
      $('.bootbox-input-text').attr('type', 'password');
    }
  },

  // code to handle account deletion
  deleteAccount: function(event) {
    event.preventDefault();
    bootbox.prompt("To delete your account, enter your password. Be sure you want to do this as all your account information will be gone.", function(result) {
      if (result !== null) {
        value = {
          'password': result
        };
        var url = "http://localhost:4568/deku/api/users/delete/" + app.user.get('id');
        $.post(url, value, function(data, textStatus, jqXHR) {
          // user is delete, so log out.
          localStorage.removeItem('deku');
          app.user.set(app.user.defaults());
          app.router.navigate('register', {trigger: true});
        })
        .fail(function() {
          bootbox.alert("Sorry, your password didn't match.");
        });
      }
    });
    $('.bootbox-input-text').attr('type', 'password');
  },

  // cancel the edit
  cancel: function(event) {
    event.preventDefault();
    $('#editSC').hide();
    $('#edit').show();
    $('.edit-data').hide();
    $('.current-data').show();
    
    // reset data in the input fields
    $('#fname-input').val(app.user.get('firstName'));
    $('#lname-input').val(app.user.get('lastName'));
    $('#email-input').val(app.user.get('email'));
    $('#major-input').val(app.user.get('major'));
    $('#year-input').val(app.user.get('grad_year'));
    $('#bio-input').val(app.user.get('bio'));
  }
});
