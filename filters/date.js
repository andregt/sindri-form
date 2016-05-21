/**
 * filter/auto_date.js
 *
 * Created by André Timermann on 16/05/2016
 *
 */
'use strict';

const moment = require('moment');

module.exports = {

    to(value){

        return moment(value, 'DDMMYYYY').toDate();

    },
    from(value){

        moment(value).format('DDMMYYYY');

    }

};
