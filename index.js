let Http = Bedrock.Http;
let analyze;
let logCount = 0;
let resetLog = function () {
    logCount = 0;
    document.getElementById("bedrock-log-display").innerHTML = "";
};
let log = function (text) {
    console.log (text);
    let odd = ((++logCount & 0x01) == 1) ? " bedrock-paged-display-odd" : "";
    let html = "<div class='bedrock-paged-display-table-row" + odd + "'><div class='bedrock-paged-display-table-row-entry-text'>(" + new Date ().getTime () + ") - " + text + "</div></div>";
    document.getElementById("bedrock-log-display").innerHTML += html;
};

let main = function () {
    let now = new Date ().getTime ();
    Http.get ("subjects.json?" + now, function (sequences) {
        log ("loaded sequences.");

        let withinTolerance = function (a, b, tolerance) {
            let scale = (a > b) ? (a / b) : (b / a);
            return scale < (1.0 + tolerance);
        };

        // condition the data with sequence lengths
        for (let sequence of sequences) {
            let sequenceStr = sequence["Sequence"];
            sequence["Length"] = sequenceStr.length;
        }

        let CF = Bedrock.CompareFunctions;
        sequences = Bedrock.DatabaseOperations.Sort.new ({ fields:[
                { name:"Patient", asc:true, type: CF.NUMERIC },
                { name:"Month", asc:true, type: CF.NUMERIC },
                { name:"Clone", asc:true, type: CF.NUMERIC }
            ] }).perform (sequences);

        // build the database filter
        Bedrock.Database.Container.new ({
            database: sequences,
            filterValues: [{ field: "Patient", value: 7 }],
            onUpdate: function (db) {
                // make a duplicate of the data before we do our analysis
                let sequences = [];
                for (let sequence of db) {
                    sequences.push (Object.assign({}, sequence));
                }

                Bedrock.PagedDisplay.Table.new ({
                    container: "bedrock-database-display",
                    records: sequences,
                    select: [
                        { name: "Patient", width: 1/16 },
                        { name: "Month", width: 1/16 },
                        { name: "Clone", width: 1/16 },
                        { name: "Sample", width: 1/16 },
                        { name: "Length", width: 1/16 },
                        { name: "Sequence", width: 21/32, type: Bedrock.PagedDisplay.EntryType.LEFT_JUSTIFY }
                    ]
                }).makeTableWithHeader ();

                // now run some analysis - what positions in the sequences vary - start by pivoting
                // the data into strings on the positions
                analyze = function () {
                    resetLog ();
                    let sequenceCount = sequences.length;
                    let positions = [];
                    let sequenceStrLength = 0;
                    for (let sequence of sequences) {
                        if (sequence["Sequence"].length !== sequenceStrLength) {
                            sequenceStrLength = sequence["Sequence"].length;
                            log ("Sequence Length: " + sequenceStrLength);
                        }
                    }
                    for (let i = 0; i < sequenceStrLength; ++i) {
                        positions.push ([]);
                    }
                    for (let sequence of sequences) {
                        let sequenceStr = sequence["Sequence"];
                        for (let i = 0; i < sequenceStrLength; ++i) {
                            positions[i].push (sequenceStr.charAt (i));
                        }
                    }

                    // take a look at the transitions that occur
                    let range = Object.create (null);
                    let transitions = Object.create (null);
                    for (let i = 0; i < sequenceStrLength; ++i) {
                        let varies = false;
                        let lastChar = positions[i][0];
                        range[lastChar] = (range[lastChar] !== undefined) ? (range[lastChar] + 1) : 1;
                        for (let j = 1, end = positions[i].length; j < end; ++j) {
                            let currentChar = positions[i][j];
                            range[currentChar] = (range[currentChar] !== undefined) ? (range[currentChar] + 1) : 1;
                            if (currentChar !== lastChar) {
                                //log("Position " + i + " transitons from '" + lastChar + "' to '" + currentChar + "'" );
                                let transition = lastChar + currentChar;
                                transitions[transition] = (transitions[transition] !== undefined) ? (transitions[transition] + 1) : 1;
                                varies = true;
                                lastChar = currentChar;
                            }
                        }
                        positions[i] = varies;
                    }

                    // function to shrink the gene strings to only the varying components
                    let shrinkSequence = function (sequenceStr) {
                        let shrunkSequence = "";
                        for (let i = 0, end = sequenceStr.length; i < end; ++i) {
                            if (positions[i] === true) {
                                shrunkSequence += sequenceStr.charAt (i);
                            }
                        }
                        //log ("Shrunk sequence from " + sequenceStr.length + " to " + shrunkSequence.length);
                        return shrunkSequence;
                    };

                    // and now shrink all the sequences
                    for (let sequence of sequences) {
                        let sequenceStr = sequence["Sequence"];
                        sequence["Sequence"] = shrinkSequence (sequence["Sequence"]);
                    }

                    let shrunkSequenceStrLength = sequences[0]["Sequence"].length;
                    log ("Shrunk Sequence Length to: " + shrunkSequenceStrLength);

                    // spew a few stats on the range and transitions
                    let rangeKeys = Object.keys (range);
                    let totalRangeCount = 0;
                    for (let rangeKey of rangeKeys) {
                        totalRangeCount += range[rangeKey];
                    }
                    log ("Total Range Count: " + totalRangeCount);
                    for (let rangeKey of rangeKeys) {
                        let percentage = range[rangeKey] / totalRangeCount;
                        log ("Range Value: " + rangeKey + " -> " + range[rangeKey] + " (" + Math.floor (100 * percentage) + "%)");
                        //range[rangeKey] = percentage;
                    }

                    let totalTransitionCount = 0;
                    let transitionKeys = Object.keys (transitions);
                    for (let transition of transitionKeys) {
                        totalTransitionCount += transitions[transition];
                    }
                    log ("Total Transition Count: " + totalTransitionCount);
                    for (let transition of transitionKeys) {
                        let percentage = transitions[transition] / totalTransitionCount;
                        log ("Transition: " + transition + " -> " + transitions[transition] + " (" + Math.floor (100 * percentage) + "%)");
                        //transitions[transition] = percentage;
                    }

                    // confirm that transitions are bidirectional
                    let allPass = true;
                    for (let a = 0, end = rangeKeys.length - 1; a < end; ++a) {
                        let rangeKeyA = rangeKeys[a];
                        for (let b = a + 1; b < rangeKeys.length; ++b) {
                            let rangeKeyB = rangeKeys[b];
                            let transitionAB = rangeKeyA + rangeKeyB;
                            let transitionBA = rangeKeyB + rangeKeyA;
                            let pass = withinTolerance (transitions[transitionAB], transitions[transitionBA], 0.05);
                            allPass &= pass;
                            log (transitionAB + " " + (pass ? "==" : "!=") + " " + transitionBA + " (" + (pass ? "PASS" : "FAIL") + ")");
                        }
                    }
                    if (!allPass) {
                        log ("ALERT: TRANSITIONS ARE NOT BI-DIRECTIONAL");
                    }

                    // convert the transition percentages to lengths
                }
            }
        });
    });
};
