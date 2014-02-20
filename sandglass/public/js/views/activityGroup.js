define([ 'lodash',
         'backbone',
         'views/activity' ],
  function( _,
            Backbone,
            ActivityView ) {

  var ActivityGroup = Backbone.View.extend({
    tagName: 'ul',
    className: 'timeline__group-ul',
    duration: 0,

    template: _.template( '<% if ( modelCount ) { %>' +
                          '<li class="timeline__groupHeader">' +
                          '<strong><%= groupLabel %></strong>' +
                          '<span class="timeline__group-duration">' +
                          '<%= duration %></span>' +
                          '</li>' +
                          '<% } %>' ),

    initialize: function() {
      this.activityCollection = new Backbone.Collection();
      this.add( this.model );
      return this;
    },

    addModelListener: function( model ) {
      /* in case no model is left, we have to remove the whole group */
      this.listenTo( model, 'destroy',
                     function() {
                      this.removeModel( model );
                     }.bind( this ));

      /* update the duration of the group, when a model changes */
      this.listenTo( model._view, 'duration_change',
                     function() {
                      this.renderUpdatedDuration();
                     }.bind( this ));

      return this;
    },

    add: function( model ) {
      var _view = new ActivityView( { model: model } );
      model._view = _view;

      this.activityCollection.push( model );
      this.addModelListener( model );

      return this;
    },

    removeModel: function( activity ) {
      this.activityCollection.remove( activity );

      /* only re-render when we removed the last item */
      if( !this.activityCollection.models.length ) {
        this.render();
      }

      return this;
    },

    /* returns the formatted duration of the group */
    getFormattedDuration: function() {
      this.updateDuration();

      var _minutes = parseInt( this.duration, 10 );

      if( _minutes === 0 ) {
        return '< 1min';
      }

      if( _minutes < 60 ) {
        return  _minutes + 'min';
      }

      /* returns hh:min format */
      return parseInt( _minutes / 60, 10 ) + 'h ' +
             ( _minutes - ( parseInt( _minutes / 60, 10 ) * 60 ) ) + 'min';
    },

    /* re-render duration of group */
    renderUpdatedDuration: function() {
      var $target = this.$el
                      .children( '.timeline__groupHeader' )
                      .children( '.timeline__group-duration' );

      $target.text( this.getFormattedDuration() );
    },

    sort: function () {
      this.activityCollection.models =
      _.sortBy( this.activityCollection.models, function( activity ) {
        var _attr = activity.get( this.attributes.sortBy );

        if( ['start', 'end'].indexOf( this.attributes.sortBy ) !== -1 ) {
          return _attr.format('HH:mm:ss');
        }

        return _attr;
      }.bind( this ));

      return this;
    },

    /* calculate the sum of all activity durations */
    updateDuration: function() {
      this.duration = 0;

      _.forEach( this.activityCollection.models, function( activity ) {
        this.duration = this.duration + activity.getDuration( true );
      }.bind( this ));

      return this;
    },

    render: function() {
      var _data = {
        groupLabel: this.attributes.groupLabel,
        duration: this.getFormattedDuration(),
        modelCount: this.activityCollection.models.length > 0
      };

      this.sort();

      this.$el.html( this.template( _data ) );

      _.forEach( this.activityCollection.models, function( activity ) {
        this.$el.append( activity._view.render().$el );
      }.bind( this ));

      return this;
    }
  });

  return ActivityGroup;
});