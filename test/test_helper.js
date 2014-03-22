global.FieldKit = require('../lib');
global.sinon = require('sinon');

var QUnitBDD = require('qunit-bdd');
global.describe = QUnitBDD.describe;
global.context = QUnitBDD.context;
global.before = QUnitBDD.before;
global.it = QUnitBDD.it;
global.expect = QUnitBDD.expect;
