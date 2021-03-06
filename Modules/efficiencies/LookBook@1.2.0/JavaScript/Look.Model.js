define('Look.Model', [
    'LookItem.Collection',
    'Backbone',
    'Utils'
], function LookModel(
    LookItemCollection,
    Backbone,
    Utils
) {
    'use strict';

    return Backbone.Model.extend({
        urlRoot: Utils.getAbsoluteUrl('services/Look.Service.ss'),
        initialize: function() {
            this.on('change:items', function(model, items) {
                if (!(items instanceof LookItemCollection)) {
                    model.set('items', new LookItemCollection(items));
                }
            });
        }
    });
});