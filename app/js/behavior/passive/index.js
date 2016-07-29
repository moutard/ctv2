'use strict';

Cotton.Behavior.Passive = {};

// FIXME: as the order matter we should properly import what we need in each file.
require ('./parser.js');
require ('./google_image_parser.js');
require ('./google_parser.js');
require ('./wikipedia_parser.js');
require ('./parser_factory.js');
