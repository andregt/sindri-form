/**
 * Created by André Timermann on 16/05/16.
 *
 * <File Reference Aqui: date>
 */
'use strict';

const FieldBase = require('../lib/fieldBase');
const DateTemplate = require('../templates/fields/datePicker.html');
const _ = require('lodash');


class DatePicker extends FieldBase {


    match() {

        // Nunca Combina, deve ser definido com force
        return false;

    }

    getField() {

        let self = this;


        return {
            key: self.fieldName,
            type: "date",
            className: self.info.className,
            templateOptions: {
                label: self.createLabel(),
                required: _.indexOf(self.info.validation, 'required') !== -1
            }

        };


    }

    static getFormlyField() {

        return {
            name: 'date',
            template: DateTemplate,
            controller: function ($scope) {

                $scope.formats = ['dd/MM/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
                $scope.format = $scope.formats[0];

                $scope.open = function ($event) {

                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.opened = true;
                };


            }
        };

    }

}

module.exports = DatePicker;

