/* eslint-env node */
// The main file that is included when you run `require("flocking-midi-microtoner")`.
"use strict";
var fluid = require("infusion");

// Register our content so it can be used with calls like fluid.module.resolvePath("%flocking-midi-microtoner/path/to/content.js");
fluid.module.register("flocking-midi-microtoner", __dirname, require);
