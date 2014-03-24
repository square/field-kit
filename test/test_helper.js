global.FieldKit = require('../lib');
global.sinon = require('sinon');
global.timekeeper = require('timekeeper');

var QUnitBDD = require('qunit-bdd');
global.describe = QUnitBDD.describe;
global.context = QUnitBDD.context;
global.before = QUnitBDD.before;
global.it = QUnitBDD.it;
global.expect = QUnitBDD.expect;

global.type = require('./helpers/typing').type;
global.buildField = require('./helpers/builders').buildField;
global.buildInput = require('./helpers/builders').buildInput;
global.expectThatTyping = require('./helpers/expectations').expectThatTyping;
global.expectThatLeaving = require('./helpers/expectations').expectThatLeaving;
global.expectThatPasting = require('./helpers/expectations').expectThatPasting;
global.PassthroughFormatter = require('./helpers/passthrough_formatter');
global.FakeEvent = require('./helpers/fake_event');
