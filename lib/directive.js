/**
 * Created by André Timermann on 08/04/16.
 *
 *
 */
'use strict';


module.exports = function () {
    return {
        restrict: 'E',
        template: require('../templates/index.html'),
        scope: {
            api: '@',
            httpRequest: '&'
        },
        controller: require('./controller'),
        controllerAs: "sindriFormCtrl"

    }
};