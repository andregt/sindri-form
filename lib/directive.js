/**
 * **Created on 08/04/16**
 *
 *
 *
 * @author André Timermann <andre@andregustavo.org>
 * @module SindriForm/Directive
 */
'use strict';

module.exports = function () {
    return {
        restrict: 'E',
        template: require('../templates/index.html'),
        scope: {
            api: '@',
            template: '@',
            id: '=',
            options: '='
        },
        controller: require('./controller'),
        controllerAs: "sindriFormCtrl"
    }
};