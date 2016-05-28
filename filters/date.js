/**
 * filter/auto_date.js
 *
 * Created by André Timermann on 16/05/2016
 *
 */
'use strict';

const moment = require('moment');

module.exports = {

    toServer(value){

        if (value){
            return moment(value, 'DDMMYYYY').toDate();
        }else{
            return value;
        }


    },
    fromServer(value){

        if (value){
            return moment(value).format('DDMMYYYY');
        }else{
            return value;
        }

    }
};
