/**
 * External libs
 */
require ('underscore');

/**
 * Internal modules
 * He knows where to look for the following module because we setup app/js as a
 * a module directory in the webpack configuration defined in Gruntfile.js
 */
require ('cotton');
require ('lib/class.js');
require ('config/');

require ('core/chrome/');

require ('utils/');
var Benchmark = require ('utils/benchmark.js');
require ('db/');
require ('model/');
require ('translators/');
require ('algo/common/');
require ('algo/dbscan/');
require ('algo/dbscan2/');

require ('controller/init.js');
require ('controller/background_messaging_controller.js');
require ('messaging/background_listener.js');
require ('controller/browser_action.js');
require ('controller/background.js');
