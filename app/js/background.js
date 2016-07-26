require ('underscore');

require ('cotton');
require ('./class.js');
require ('./browser_action.js');
require ('./config/init.js')
require ('./config/config.js')

require ('./core/chrome/init.js');
require ('./core/chrome/history');
require ('./core/chrome/installer');
require ('./core/chrome/notification');
require ('./core/chrome/install/temp_database.js');
require ('./core/chrome/messaging/messenger.js');



console.log('start');
