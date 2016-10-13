var HandConverter = (function () {
    function HandConverter() {
    }
    return HandConverter;
})();
var HandConverterService = (function () {
    function HandConverterService() {
        var _this = this;
        /*
            Capture groups:
            1st: entire stakes string ex: ($50/$100)
            2nd: small blind ex: 50
            3rd: big blind ex: 100
        */
        this.stakesRegExp = /\(\$(\d+\.\d+|\d+|)\/\$(\d+\.\d+|\d+|)/;
        /*
            Capture groups:
            1st: entire table string ex: Table 'Sycorax III'
            2nd: table name ex: Sycorax III
        */
        this.tableNameRegExp = /Table \'(.+?)\'/;
        /*
            Capture groups:
            1st: entire string ex: ($783.50 in chips)
            2nd: naked stack ex: 783.50
        */
        this.stacksRegExp = /\(\$(\d+\.\d+|\d+|) in chips/;
        /*
            Capture groups:
            1st: entire string ex: posts small blind $1
            2nd: 1
            3rd: undefined
            4th: undefined
    
            only one capture group of 2..4 will return truthy value
        */
        this.blindsRegExp = /posts small blind \$(\d+\.\d+|\d+|)|posts big blind \$(\d+\.\d+|\d+|)|posts big & small blind \$(\d+\.\d+|\d+|)|posts small & big blinds \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: raises $719 to $982.25
            2nd: raises from: 719
            3rd: raises to: 982.25
        */
        this.raisesRegExp = /raises \$(\d+\.\d+|\d+|) to \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: bets $80.42
            2nd: raises from: 80.42
        */
        this.callsOrBetsRegExp = /bets \$(\d+\.\d+|\d+|)|calls \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: bets $80.42
            2nd: raises from: 80.42
        */
        this.uncalledBetRegExp = /Uncalled bet \(\$(\d+\.\d+|\d+)\)/;
        /*
            Capture groups:
            1st: entire string ex: Uncalled bet ($186)
            2nd:186
        */
        this.collectedFromRegExp = /collected \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: and won ($1220)
            2nd: 1220
        */
        this.summaryAndWonRegExp = /won \(\$(\d+\.\d+|\d+)\)/;
        /*
            Capture groups:
            1st: entire string ex: posts the ante $2
            2nd: 2
        */
        this.antesRegExp = /posts the ante \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: Main pot $1205.40
            2nd: 1205.40
        */
        this.mainPotRegExp = /Main pot \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: Main pot $1205.40
            2nd: 1205.40
        */
        this.sidePotRegExp = /Side pot \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: Total pot $1444.80
            2nd: 1444.80
        */
        this.totalPotRegExp = /^Total pot \$(\d+\.\d+|\d+)/;
        /*
            Capture groups:
            1st: entire string ex: Rake $2.75
            2nd: 2.75
        */
        this.rakeRegExp = /Rake \$(\d+\.\d+|\d+)$/;
        // Pipeline funcitons
        this.replaceMetadata = function (handArr) {
            return handArr.reduce(function (previousValue, currentValue, index, arr) {
                // replaces first line with new metadata
                if (index === 0)
                    currentValue = _this.createNewMetadata(currentValue);
                previousValue.push(currentValue);
                return previousValue;
            }, []);
        };
        this.replaceTableName = function (handArr) {
            // table string is always second
            var originalString = handArr[1];
            var matches = _this.tableNameRegExp.exec(originalString);
            if (!matches) {
                console.warn('Could not find table name');
                return handArr;
            }
            var tableString = matches[0], tableName = matches[1];
            // picking new random name from preset list
            var possibleNames = ['Gotha']; // can add more in the future
            var newName = possibleNames[Math.floor(Math.random() * possibleNames.length)];
            // creating new table string
            var newTableString = tableString.replace(tableName, newName);
            // updating original array
            handArr[1] = originalString.replace(tableString, newTableString);
            return handArr;
        };
        this.replaceStacks = function (handArr) {
            var region = _this.handRegions.preflop;
            return _this.reduceHand(handArr, _this.stacksRegExp, region.start, region.end);
        };
        this.replaceBlinds = function (handArr) {
            var region = _this.handRegions.preflop;
            return _this.reduceHand(handArr, _this.blindsRegExp, region.start, region.end);
        };
        this.replaceAntes = function (handArr) {
            var region = _this.handRegions.preflop;
            return _this.reduceHand(handArr, _this.antesRegExp, region.start, region.end);
        };
        this.replaceRaises = function (handArr) {
            var region = _this.handRegions.postflop;
            return _this.reduceHand(handArr, _this.raisesRegExp, region.start, region.end);
        };
        this.replaceCallsAndBets = function (handArr) {
            var region = _this.handRegions.postflop;
            return _this.reduceHand(handArr, _this.callsOrBetsRegExp, region.start, region.end);
        };
        this.replaceUncalledBets = function (handArr) {
            var region = _this.handRegions.postflop;
            return _this.reduceHand(handArr, _this.uncalledBetRegExp, region.start, region.end);
        };
        this.replaceCollectedFromPot = function (handArr) {
            var region = _this.handRegions.postflop;
            return _this.reduceHand(handArr, _this.collectedFromRegExp, region.start, region.end);
        };
        this.replaceSummaryMainPot = function (handArr) {
            var region = _this.handRegions.summary;
            return _this.reduceHand(handArr, _this.mainPotRegExp, region.start, region.end);
        };
        this.replaceSummarySidePot = function (handArr) {
            var region = _this.handRegions.summary;
            return _this.reduceHand(handArr, _this.sidePotRegExp, region.start, region.end);
        };
        this.replaceSummaryTotalPot = function (handArr) {
            // this is the string with hand summary ex: Total pot $1223 | Rake $3 
            var i = _this.handRegions.summary.start + 1;
            var originalString = handArr[i];
            var _a = _this.totalPotRegExp.exec(originalString), potString = _a[0], potValue = _a[1];
            var _b = _this.rakeRegExp.exec(originalString), rakeString = _b[0], rakeValue = _b[1];
            var pot = +potValue;
            var rake = +rakeValue;
            var potWithoutRake = pot - rake;
            // calculate new pot
            var convertedPot = pot / _this.stakeModifier;
            // create new rake and pot string
            var newPot = _this.convertToFloat(convertedPot + rake);
            var newRakeString = rakeString.replace(rakeValue, rake + '');
            var newPotString = potString.replace(potValue, newPot + '');
            // update original string with new values
            var result = originalString
                .replace(potString, newPotString)
                .replace(rakeString, newRakeString);
            handArr[i] = result;
            return handArr;
        };
        this.replaceSummarySeatPot = function (handArr) {
            var region = _this.handRegions.summary;
            return _this.reduceHand(handArr, _this.summaryAndWonRegExp, region.start, region.end);
        };
        // Helper functions
        this.lastIndexOfString = function (handArr, stringToEndOn) {
            return handArr.findIndex(function (handString) { return handString.includes(stringToEndOn); });
        };
        this.reduceHand = function (hand, regExp, start, end, customFn) {
            return hand.reduce(function (previousValue, currentValue, index, arr) {
                if (index <= end && index >= start) {
                    if (customFn) {
                        customFn();
                    }
                    else {
                        currentValue = _this.transformString(currentValue, regExp);
                    }
                }
                previousValue.push(currentValue);
                return previousValue;
            }, []);
        };
        this.convertToMockStakes = function (curr) {
            return _this.convertToFloat(+curr / _this.stakeModifier);
        };
        this.convertToFloat = function (num) {
            return num.toFixed(2).replace(/\.00$/, '');
        };
        this.transformString = function (originalString, regExp) {
            var matches = regExp.exec(originalString);
            if (!matches)
                return originalString;
            var oldStringSlice = matches[0], captureGroups = matches.slice(1);
            captureGroups = captureGroups.filter(function (group) { return group; });
            var newStringSlice = captureGroups.reduce(function (acc, curr) {
                var newCurr = _this.convertToMockStakes(curr);
                return acc.replace(curr, newCurr);
            }, oldStringSlice);
            return originalString.replace(oldStringSlice, newStringSlice);
        };
        this.createNewMetadata = function (originalString) {
            var matches = _this.stakesRegExp.exec(originalString);
            if (!matches)
                throw new Error('Cannot read the stakes');
            var stakesString = matches[0], sb = matches[1], bb = matches[2];
            // will be used in the all pipe-transforming functions to scale the hand
            _this.stakeModifier = +bb;
            if (_this.stakeModifier < 1)
                throw new Error('Converter only works for stakes > 100');
            var newStakesString = stakesString
                .replace(sb, '0.50')
                .replace(bb, '1');
            return originalString.replace(stakesString, newStakesString);
        };
    }
    HandConverterService.prototype.convertHand = function (hand) {
        var result = {};
        try {
            result.convertedHand = this.convert(hand);
        }
        catch (e) {
            result.error = e;
        }
        finally {
            result.converted = result.error ? false : true;
            return result;
        }
    };
    HandConverterService.prototype.convert = function (hand) {
        var slicedHand = this.trimAndSlice(hand);
        this.setHandRegions(slicedHand);
        // to allow for chaining each fn must accept and return string[]
        var pipeline = [
            this.replaceMetadata,
            this.replaceTableName,
            this.replaceStacks,
            this.replaceBlinds,
            this.replaceAntes,
            this.replaceRaises,
            this.replaceCallsAndBets,
            this.replaceUncalledBets,
            this.replaceCollectedFromPot,
            this.replaceSummarySidePot,
            this.replaceSummaryMainPot,
            this.replaceSummaryTotalPot,
            this.replaceSummarySeatPot
        ];
        return pipeline.reduce(function (acc, fn) { return fn(acc); }, slicedHand).join('\n');
    };
    HandConverterService.prototype.trimAndSlice = function (hand) {
        var slicedHand = hand.trim().split('\n');
        return slicedHand.map(function (line) { return line.trim(); });
    };
    HandConverterService.prototype.setHandRegions = function (handArr) {
        var preflop = {
            start: 2,
            end: this.lastIndexOfString(handArr, '*** HOLE CARDS ***')
        };
        var postflop = {
            start: preflop.end,
            end: this.lastIndexOfString(handArr, '*** SUMMARY ***')
        };
        var summary = {
            start: postflop.end,
            end: handArr.length - 1
        };
        this.handRegions = {
            preflop: preflop,
            summary: summary,
            postflop: postflop
        };
    };
    return HandConverterService;
})();
var hcs = new HandConverterService();
addEventListener('message', function (e) {
    var handObject = e.data;
    var convertedHand = hcs.convertHand(handObject.hands);
    console.log('recieved and dispatching');
    postMessage('hello', undefined);
});
function constructErrorMsg(firstLine, fileName, error) {
    return "FILE: " + firstLine + " HAND: " + firstLine + " could not be converted because: ERROR - " + error;
}
