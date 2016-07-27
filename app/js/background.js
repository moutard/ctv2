/**
 * External libs
 */
require ('underscore');

require ('cotton');
require ('./class.js');
require ('./browser_action.js');
require ('./config/init.js');
require ('./config/config.js');

require ('./core/chrome/init.js');
require ('./core/chrome/history.js');
require ('./core/chrome/installer.js');
require ('./core/chrome/notification.js');
require ('./core/chrome/install/temp_database.js');
require ('./core/chrome/messaging/messenger.js');

require ('./utils/init.js');
require ('./utils/url_parser.js');
require ('./utils/exclude_container.js');
require ('./utils/exclude_corn.js');
require ('./utils/ga.js');
require ('./utils/benchmark.js');

require ('./db');
require ('./model');
require ('./translators');

console.log('start');
