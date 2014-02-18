define([ 'lodash',
         'backbone',
         'defaults',
         'views/activityGroup' ],
  function( _,
            Backbone,
            defaults,
            ActivityGroup ) {

  var Timeline = Backbone.View.extend({
    className: 'timeline',

    initialize: function() {
      this._activityGroups = [];

      this.attributes = {
        sortBy: defaults.sortActivitiesBy
      };

      this.render();
    },

    sort: function( index, keepBuild ) {
      this.attributes.sortBy = index;

      if( !keepBuild ) {
        _.forEach( this._activityGroups, function( activityGroup ) {
          activityGroup.remove();
        });

        this._activityGroups = [];

        _.forEach( Sandglass.collections.activity.models, function( activity ) {
          this.createGroup( activity );
        }.bind( this ));
      }

      /* re-order all groups */
      _.sortBy( this._activityGroups, function( activityGroup ) {
        return activityGroup.groupName;
      });

      if( this.attributes.sortBy === 'start' ) {
        this._activityGroups.reverse();
      }

      this.render();
    },

    add: function( model ) {
      this.createGroup( model );
      this.sort( this.attributes.sortBy );
    },

    createGroup: function( model ) {
      var _modelFindBy = model.get( this.attributes.sortBy ),
          _added = false,
          _view,
          _groupLabel;

      if( this.attributes.sortBy === 'start' ) {
        _modelFindBy = _modelFindBy.format( 'YYYY-MM-DD' );
        _groupLabel = model.get( this.attributes.sortBy )
                        .format( defaults.dateFormat );
      } else {
        _.each(['task', 'project'], function( item ) {
          if( this.attributes.sortBy === item + '_id' ) {
            _modelFindBy = Sandglass.collections[ item ]
                            .getNameById( model.get( item + '_id' ) );
          }
        }.bind( this ));
      }

      _.forEach( this._activityGroups, function( groupView ) {
        if( groupView.attributes.groupName === _modelFindBy ) {
          groupView.add( model );
          _added = true;

          groupView.listenTo( model,
                             'destroy',
                             function() {
                              groupView.removeModel( model );
                             });

          return false;
        }
      });

      if( _added ) {
        return this;
      }

      _view = new ActivityGroup( { model: model,
                                   attributes: {
                                     sortBy: this.attributes.sortBy,
                                     groupName: _modelFindBy,
                                     groupLabel: _groupLabel ? _groupLabel :
                                                               _modelFindBy }
                                  } );

      this._activityGroups.push( _view );
      return this;
    },

    render: function() {
      _.forEach( this._activityGroups, function( activityGroup ) {
        this.$el
          .append( activityGroup.render().$el );
      }.bind( this ));

      this.$el.appendTo('.sandglass');
    },
  });

  return Timeline;
});