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
        controller: function ($scope) {

            $scope.xxx = "André";

            // The model object that we reference
            // on the  element in index.html
            $scope.rental = {};

            // An array of our form fields with configuration
            // and options set. We make reference to this in
            // the 'fields' attribute on the  element

            // DOcumentar formulario: Layout do formulário pode ser definido pela propriedade className
            $scope.rentalFields = [
                {
                    key: 'first_name',
                    type: 'input',
                    templateOptions: {
                        type: 'text',
                        label: 'First Name',
                        required: true,
                        // className: "col-sm-4 col-sm-offset-3"
                    }

                },
                {
                    key: 'last_name',
                    type: 'input',
                    templateOptions: {
                        type: 'text',
                        label: 'Last Name',
                        required: true,
                    }
                },
                {
                    key: 'email',
                    type: 'input',
                    templateOptions: {
                        type: 'email',
                        label: 'Email address',
                        required: true,
                    }
                },
            ];

        }
    }
}