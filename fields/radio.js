/**
 * Created by André Timermann on 14/05/16.
 *
 * @module SindriForm/Fields
 * @ignore
 */
'use strict';

const FieldType = require('../lib/fieldType');
const RadioTemplate = require('../templates/fields/radio.html');
const _ = require('lodash');

/**
 * RadioBox
 *
 * @extends {module:SindriForm/Field~FieldType}
 */
class RadioField extends FieldType {


    match() {

        // TODO: Carregar este field, apenas quando tiver poucos elementos. Max: 4
        return (this.info.type === 'enum');

    }

    getField() {

        let self = this;


        return {
            key: self.fieldName,
            type: "radio",
            className: self.formConfig.className,
            templateOptions: {
                label: self.createLabel(),
                required: _.indexOf(self.info.validation, 'required') !== -1,
                inputs: self.info.enum
            }

        };


    }

    static getFormlyField() {

        return {
            name: 'radio',
            template: RadioTemplate
        };

    }

}

module.exports = RadioField;

