/**
 * filter/auto_date.js
 *
 * Created by André Timermann on 16/05/2016
 *
 */
'use strict';

const moment = require('moment');

/**
 * 
 * @type {{toServer: (function(*=)), fromServer: (function(*=))}}
 */
module.exports = {

    toServer(value){

        if (value){
            return moment(value, 'DDMMYYYYhhmm').toDate();
        }else{
            return value;
        }


    },
    fromServer(value){

        if (value){
            return moment(value).format('DDMMYYYYhhmm');
        }else{
            return value;
        }

    }
};
