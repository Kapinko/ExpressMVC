

ExpressMVC
==========

A simple boilerplate library to assist in the setup of an
[expressjs](http://expressjs.com) application that follows the
[MVC](http://en.wikipedia.org/wiki/Model–view–controller) pattern.  The setup
should be comfortable and familiar to most [PHP](http://php.net) developers.

How to install
--------------

### Make sure the following environment variables are set.

    export MYSQL_CONFIG=/path/to/bin/mysql_config

### Install module via npm @see [npmjs.org](http://npmjs.org)

    npm install ExpressMVC

### Install the following modules globally. You may need sudo privileges

    npm install -g nodemon
    npm install -g vows

How to run your application
---------------------------

The suggested way to run your application is:

    $ nodemon /path/to/my/main.js

or (if you require the MySQL library)

    $ DYLD_LIBRARY_PATH='/path/to/my/mysql/lib' nodemon /path/to/my/main.js

Dependencies
------------


*   [node](http://nodejs.org) server side javascript based on 
    [V8 JavaScript](http://code.google.com/p/v8)
*   [npm](http://npmjs.org) the node package manager

### Required npm modules

*   [underscore](https://github.com/documentcloud/underscore/) - a utility belt
    for javascript
*   [underscore.string](https://github.com/edtsech/underscore.string)  - string
    extensions for the underscore library
*   [express](https://github.com/visionmedia/express) a node web framework.
*   [express-namespace](https://github.com/visionmedia/express-namespace) 
    namespaced route support
*   [express-params](https://github.com/visionmedia/express-params) param 
    pre-condition functions
*   [express-form](https://github.com/dandean/express-form) provides data
    filtering and validation as route middleware for your Express applications.
*   [connect-form](https://github.com/visionmedia/connect-form) a multipart /
    urlencoded form parsing middleware
*   [generic-pool](https://github.com/coopernurse/node-pool)
*   [db-mysql](https://github.com/mariano/node-db-mysql) MySQL database binding
*   [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js/) XML parsing for node
*   [moment](https://github.com/timrwood/moment) - a javascript date library 
    that helps create, manipulate, and format dates without extending the 
    `Date` prototype.
*   [uquery](https://github.com/scull7/uquery)

### Suggested modules

*   [nodemon](https://github.com/remy/nodemon) Monitor for any changes in your
    node.js application and automatically restart the server.
*   [vows](http://vowsjs.org) Asynchronous BDD &amp; continuous integration 
    for node.js



Contributors
------------

The following are major contributors of ExpressMVC

*   Nathan A Sculli ([Kapinko](http://github.com/Kapinko))


License
-------

All original code within this library is
Copyright (c) 2011 Nathan Anthony Sculli &lt;nathan.sculli@kapinko.com&gt;

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
