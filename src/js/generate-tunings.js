/* A Node script to (re)generate the EDO tuning data we use in this package. */
"use strict";
var fluid = require("infusion");
var fs = require("fs");

var flock = fluid.registerNamespace("flock");

require("../../");

fluid.registerNamespace("flock.mmt.tuningGenerator");

flock.mmt.tuningGenerator.generate = function (that) {
    var payload = {};

    fluid.each(that.options.scales, function (scaleDef, scaleKey) {
        var channels = scaleDef.notesPerOctave / 12;
        var generatedScale = {
            noteMap: {}
        };

        var channelDiff = 8192 / channels;
        for (var a = 0; a < 128; a++) {
            var channel = a % channels;
            var bend = Math.round(8192 + (channelDiff * channel));
            var adjustment = Math.floor((a - scaleDef.centerPitch)/channels);
            generatedScale.noteMap[a] = {
                note: scaleDef.centerPitch + adjustment,
                channel: channel,
                bend: bend
            }
            /*

                56 -> 58:1
                57 -> 58:2
                58 -> 59:1
                59 -> 59:2
                60 -> 60:1
                61 -> 60:2
                62 -> 61:1
                63 -> 61:2
                64 -> 62:1

             */
        }

        payload[scaleKey] = generatedScale;
    });

    var templatePath = fluid.module.resolvePath(that.options.templateFile);
    var templateContent = fs.readFileSync(templatePath);

    var outputPath = fluid.module.resolvePath(that.options.outputFile);
    var unindentedJson = JSON.stringify(payload, null, 2);
    var indentedJson = unindentedJson.replace(/(\n)/mg, "$1    ");
    var content = fluid.stringTemplate(templateContent, { jsonAsString: indentedJson });
    fs.writeFileSync(outputPath, content);
};

fluid.defaults("flock.mmt.tuningGenerator", {
    gradeNames: ["fluid.component"],
    scales: {
        "12-EDO": {
            notesPerOctave: 12,
            centerPitch:    60
        },
        "24-EDO": {
            notesPerOctave: 24,
            centerPitch:    60
        },
        "36-EDO": {
            notesPerOctave: 36,
            centerPitch:    60
        },
        "48-EDO": {
            notesPerOctave: 48,
            centerPitch:    60
        },
        "60-EDO": {
            notesPerOctave: 60,
            centerPitch:    60
        },
        "72-EDO": {
            notesPerOctave: 72,
            centerPitch:    60
        },
        "84-EDO": {
            notesPerOctave: 84,
            centerPitch:    60
        },
        "96-EDO": {
            notesPerOctave: 96,
            centerPitch:    60
        },
        "108-EDO": {
            notesPerOctave: 108,
            centerPitch:    60
        },
        "120-EDO": {
            notesPerOctave: 120,
            centerPitch:    60
        },
        "132-EDO": {
            notesPerOctave: 132,
            centerPitch:    60
        },
        "144-EDO": {
            notesPerOctave: 144,
            centerPitch:    60
        },
        "156-EDO": {
            notesPerOctave: 156,
            centerPitch:    60
        },
        "168-EDO": {
            notesPerOctave: 168,
            centerPitch:    60
        },
        "180-EDO": {
            notesPerOctave: 180,
            centerPitch:    60
        },
        "192-EDO": {
            notesPerOctave: 192,
            centerPitch:    60
        }
    },
    outputFile: "%flocking-midi-microtoner/dist/tunings.js",
    templateFile: "%flocking-midi-microtoner/src/templates/wrapperTemplate.txt",
    listeners: {
        "onCreate.generate": {
            funcName: "flock.mmt.tuningGenerator.generate",
            args:     ["{that}"]
        }
    }
});

flock.mmt.tuningGenerator();
