/*
 * Copyright 2014-2015 Fabian Tollenaar <fabian@starting-point.nl>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

module.exports = function(app) {
  "use strict";

  var express       = require('express')
    , debug         = require('debug')('signalk-server:config:production')
    , morgan        = require('morgan')
    , errorHandler  = require('errorhandler')
    , config        = app.config
  ;

  if(app.get('env') == 'production') {
    config.environment  = 'production';
    config.debug        = false;

    app.use(morgan('combined'));
    app.use(errorhandler());
    
    app.all('/', function(req, res) {
      res.json({ 'signalk ready': true });
    });
  }
};