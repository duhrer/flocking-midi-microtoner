/* globals flocking */
(function (fluid, flock) {
    "use strict";

    fluid.registerNamespace("flock.mmt.router");

    flock.mmt.router.generateSelectorModel = function () {
        return fluid.transform(Object.keys(flock.mmt.tunings), function (key) {
            return { id: key, name: key };
        });
    };

    flock.mmt.router.sendMessage = function (that, event, payload) {
        var outputConnection = fluid.get(that, "controlOutput.connection");
        if (outputConnection) {
            outputConnection.send(payload);
        }
    };

    flock.mmt.router.spindleAndSendNote = function (that, event, payload) {
        var alteredPayload = fluid.copy(payload);

        var alteredTuning = fluid.get(flock.mmt.tunings, that.model.tuning);
        if (alteredTuning) {
            var noteRules = alteredTuning.noteMap[payload.note];

            if (payload.type === "noteOn") {
                // pitchbend before each note, so that we can support playing a single instrument monophonically.
                that.sendMessage("pitchbend", {
                    type: "pitchbend",
                    channel: noteRules.channel,
                    value: noteRules.bend
                });
            }

            alteredPayload.note = noteRules.note;
            alteredPayload.channel = noteRules.channel;
            that.sendMessage(event, alteredPayload);
        }
        else {
            that.sendMessage(event, payload);
        }
    };

    fluid.defaults("flock.mmt.router", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            tuning: false
        },
        selectors: {
            controlInput:   ".control-input",
            controlOutput:  ".control-output",
            tuningSelector: ".tuning-selector"
        },
        invokers: {
            sendMessage: {
                funcName: "flock.mmt.router.sendMessage",
                args:     ["{that}", "{arguments}.0", "{arguments}.1"] // event, payload
            },
            spindleAndSendNote: {
                funcName: "flock.mmt.router.spindleAndSendNote",
                args:     ["{that}", "{arguments}.0", "{arguments}.1"] // event, payload
            }
        },
        components: {
            enviro: {
                type: "flock.enviro"
            },
            controlInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.controlInput",
                options: {
                    portType: "input",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "MIDI Input",
                                }
                            }
                        },
                        connection: {
                            options: {
                                listeners: {
                                    noteOn: {
                                        func: "{flock.mmt.router}.spindleAndSendNote",
                                        args: ["noteOn", "{arguments}.0"]
                                    },
                                    noteOff: {
                                        func: "{flock.mmt.router}.spindleAndSendNote",
                                        args: ["noteOff", "{arguments}.0"]
                                    },
                                    control: {
                                        func: "{flock.mmt.router}.sendMessage",
                                        args: ["control", "{arguments}.0"]
                                    },
                                    program: {
                                        func: "{flock.mmt.router}.sendMessage",
                                        args: ["program", "{arguments}.0"]
                                    },
                                    aftertouch: {
                                        func: "{flock.mmt.router}.sendMessage",
                                        args: ["aftertouch", "{arguments}.0"]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            controlOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.controlOutput",
                options: {
                    portType: "output",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "MIDI Output",
                                }
                            }
                        }
                    }
                }
            },
            scaleSelector: {
                type: "flock.ui.selectBox",
                container: "{that}.dom.tuningSelector",
                options: {
                    model: {
                        options: "@expand:flock.mmt.router.generateSelectorModel()",
                        selection: "{flock.mmt.router}.model.tuning"
                    }
                }
            }
        }
    })
})(fluid, flock);
