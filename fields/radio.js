/**
 * Created by André Timermann on 14/05/16.
 *
 * <File Reference Aqui: radio>
 */
'use strict';

const FieldBase = require('../lib/fieldBase');
const RadioTemplate = require('../templates/fields/radio.html');
const _ = require('lodash');

class RadioField extends FieldBase {


    match() {

        // TODO: Carregar este field, apenas quando tiver poucos elementos. Max: 4
        return (this.info.type === 'enum');

    }

    getField() {

        let self = this;


        return {
            key: self.fieldName,
            type: "radio",
            className: self.info.className,
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

