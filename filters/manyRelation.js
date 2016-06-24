/**
 * **Created on 18/06/16**
 * 
 * Relacionamento vem da base com tipo Array, porem é um array de objeto com varios dados, no formulário o unico que importa é o id
 * 
 * Portanto aqui convertemos par aum array de id
 *
 * sindri-form/filters/manyRelation.js
 * @author André Timermann <andre@andregustvo.org>
 * @module SindriForm/Filters
 * @ignore
 *
 */
'use strict';

const _ = require('lodash');

module.exports = {

    toServer(value){

        return value;


    },
    fromServer(value){


        return _.map(value, 'id');

    }
};
