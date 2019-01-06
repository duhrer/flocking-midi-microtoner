# Flocking MIDI Microtoner

This package provides a MIDI router that can be used with a WebMIDI-compatible browser (chromium and derivatives).  The
router transforms the typical note input from a MIDI controller from a scale using 12 steps per octave (12-EDO) to
various alternate scales that also use [equal divisions of the octave](https://en.xen.wiki/w/EDO).  It can be used to
play polyphonic [microtonal music](http://en.wikipedia.org/wiki/Microtonal_music) on a single MIDI controller.

## How does it work?

MIDI provides support for 128 distinct pitches expressed as "notes".  In addition, most devices support a "pitch bend",
which allows fine-grained shifting of pitch between playable notes.  This package uses pitch bend messages to shift the
tuning of notes between the steps in a 12-note octave.

Pitch bend messages apply to all notes playing of the same MIDI channel.  To support true polyphony, this package sends
notes that are shifted by the same amount to their own MIDI channel.  The number of channels is determined by the number
of distinct "pitch bends" required to realise the tuning.  The simplest example is 24-EDO, in which there are 24 steps
in an octave.  12 of these steps can be played in the standard 12-EDO tuning, i.e. without pitch bend.  The other 12
notes are played on a separate channel, which has been pitch bent up by half a step.  As there are 16 channels in MIDI,
this package can support very fine grained tunings, up to 192-EDO.

To make the altered scale continuous, input notes are also transposed.  Let's continue the 24-EDO example, in which we
need two octaves on the same keyboard to play what would be a single octave on a 12-EDO instrument.  Assuming that C4
is the same on both the input and output, the following transposition (and channel splitting) would be used:

| Input Note | Output Note | Output Channel |
| ---------- | ----------- | -------------- |
| C4         | C4          | 1              |
| C#4        | C4          | 2              |
| D4         | C#4         | 1              |
| D#4        | C#4         | 2              |
| E4         | D4          | 1              |
| F4         | D4          | 2              |
| F#4        | D#4         | 1              |
| G4         | D#4         | 2              |
| G#4        | E4          | 1              |
| A4         | E4          | 2              |
| A#4        | F4          | 1              |
| B4         | F4          | 2              |
| C5         | F#4         | 1              |
| C#5        | F#4         | 2              |
| D5         | G4          | 1              |
| D#5        | G4          | 2              |
| E5         | G#4         | 1              |
| F5         | G#4         | 2              |
| F#5        | A4          | 1              |
| G5         | A4          | 2              |
| G#5        | A#4         | 1              |
| A5         | A#4         | 2              |
| A#5        | B4          | 1              |
| B5         | B4          | 2              |
| C6         | C5          | 1              |

As this package uses pitch bend messages to manage the relative tuning of each output channel, all pitch bend messages
from the MIDI input are not transmitted to any MIDI output channel.  Mod wheel and control code messages are passed
through to all output channels, so that you can reconfigure the output instruments using your MIDI input if desired.

## How do I use it?

1. Install this package and its dependencies.
2. Open the file `index.html` in [a browser that supports the Web MIDI API](https://caniuse.com/#feat=midi).
3. Connect the "input" selector to your controller or other MIDI input.
4. Connect the "output" selector to a device or piece of software that accepts MIDI input.  See notes below about
   choosing a usable output.

## Choosing the Right MIDI Device to Play with This Package.

The approach used here expects the output to listen for inputs on a range of MIDI channels, and to keep the
channel inputs separate from each other.  If the output applies all channel inputs to the same instrument, the pitch
bending used to achieve "microtones" will not work as expected.  The ideal setup would be something like a software
instrument running sixteen copies of the same instrument, each listening to a different channel.

Although this may be made configurable in the future, this package assumes that the pitch bend on the output is
configured to bend one whole semitone up for a pitch bend value of 8192. If your output is configured differently, the
bent output will not be as expected.
