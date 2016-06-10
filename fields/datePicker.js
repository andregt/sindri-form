/**
 * Created by André Timermann on 16/05/16.
 *
 * @module SindriForm/Fields
 * @ignore
 */
'use strict';

const FieldType = require('../lib/fieldType');
const DateTemplate = require('../templates/fields/datePicker.html');
const _ = require('lodash');

/**
 * Date Picker
 * 
 * @todo Não finalizado
 * 
 * @extends {module:SindriForm/Field~FieldType}
 */
class DatePickerField extends FieldType {


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

module.exports = DatePickerField;

