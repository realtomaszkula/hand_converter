import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

interface HandRegions {
    preflop: { start: number, end: number},
    postflop: { start: number, end: number},
    summary: { start: number, end: number}
}
interface PipelineFn {
    (source: string[]): string[];
}

@Injectable()
export class HandConverterService {

    private stakeModifier: number;
    private handRegions: HandRegions;

    /* 
        Capture groups: 
        1st: entire stakes string ex: ($50/$100)
        2nd: small blind ex: 50
        3rd: big blind ex: 100
    */
    private stakesRegExp = /\(\$(\d+\.\d+|\d+|)\/\$(\d+\.\d+|\d+|)/;
    
    /*
        Capture groups:
        1st: entire string ex: ($783.50 in chips) 
        2nd: naked stack ex: 783.50
    */
    private stacksRegExp = /\(\$(\d+\.\d+|\d+|) in chips/;

    /*
        Capture groups: 
        1st: entire string ex: posts small blind $1
        2nd: 1
        3rd: undefined
        4th: undefined

        only one capture group of 2..4 will return truthy value
    */
    private blindsRegExp = /posts small blind \$(\d+\.\d+|\d+|)|posts big blind \$(\d+\.\d+|\d+|)|posts big & small blind \$(\d+\.\d+|\d+|)|posts small & big blinds \$(\d+\.\d+|\d+)/;

    /*
        Capture groups:
        1st: entire string ex: raises $719 to $982.25
        2nd: raises from: 719
        3rd: raises to: 982.25
    */
    private raisesRegExp = /raises \$(\d+\.\d+|\d+|) to \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: bets $80.42
        2nd: raises from: 80.42
    */
    private callsOrBetsRegExp = /bets \$(\d+\.\d+|\d+|)|calls \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: bets $80.42
        2nd: raises from: 80.42
    */
    private uncalledBetRegExp = /Uncalled bet \(\$(\d+\.\d+|\d+)\)/

    /*
        Capture groups:
        1st: entire string ex: Uncalled bet ($186)
        2nd:186
    */
    private collectedFromRegExp = /collected \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: and won ($1220)
        2nd: 1220
    */
    private summaryAndWonRegExp = /won \(\$(\d+\.\d+|\d+)\)/

    /*
        Capture groups:
        1st: entire string ex: posts the ante $2
        2nd: 2
    */
    private antesRegExp = /posts the ante \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: Main pot $1205.40
        2nd: 1205.40
    */
    private mainPotRegExp = /Main pot \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: Main pot $1205.40
        2nd: 1205.40
    */
    private sidePotRegExp = /Side pot \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: Total pot $1444.80
        2nd: 1444.80
    */
    private totalPotRegExp = /^Total pot \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: Rake $2.75
        2nd: 2.75
    */
    private rakeRegExp = /Rake \$(\d+\.\d+|\d+)$/

    private _convertedHands: string[];

    private _convertedHand: string;

    get convertedHands() {
        return this._convertedHands;
    }

    get convertedHand() {
        return this._convertedHand;
    }

    setHands(hands: string[]) {
        this._convertedHands = this.convertHands(hands)
    }

    setHand(hand: string) {
        this._convertedHand = this.convert(hand)
    }

    private convertHands(hands: string[]): string[] {
        return hands.reduce((acc: string[], hand: string) => {
            acc.push(this.convert(hand))
            return acc
        }, [])
    }

    private convert(hand: string) {
        let slicedHand: string[] = this.trimAndSlice(hand);

        this.setHandRegions(slicedHand)
        // to allow for chaining each fn must accept and return string[]
        let pipeline: PipelineFn[] = [
            this.replaceMetadata,
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
        ] 

        return pipeline.reduce((acc, fn) => fn(acc) , slicedHand).join('\n');
    }

    private trimAndSlice(hand: string): string[] {
        let slicedHand = hand.trim().split('\n');
        return slicedHand.map(line => line.trim());
    }

    private setHandRegions(handArr: string[]): void {
        let preflop = {
            start: 2,
            end: this.lastIndexOfString(handArr,  '*** HOLE CARDS ***')
        }

        let postflop = {
            start: preflop.end,
            end: this.lastIndexOfString(handArr,  '*** SUMMARY ***')
        }

        let summary = {
            start: postflop.end,
            end: handArr.length - 1
        }

        this.handRegions = {
            preflop,
            summary,
            postflop
        }
    }

    // Pipeline funcitons

    public replaceMetadata = (handArr: string[]): string[] => {
        return handArr.reduce((previousValue, currentValue, index, arr) => {
            // replaces first line with new metadata
            if (index === 0) currentValue = this.createNewMetadata(currentValue);
            previousValue.push(currentValue);
            return previousValue
        }, [])
         
    }

    public replaceStacks = (handArr: string[]): string[] => {
        let region = this.handRegions.preflop;
        return this.reduceHand(handArr, this.stacksRegExp, region.start, region.end);

    }

    public replaceBlinds = (handArr: string[]): string[] => {
        let region = this.handRegions.preflop;
        return this.reduceHand(handArr, this.blindsRegExp, region.start, region.end);
    }

    public replaceAntes = (handArr: string[]): string[] => {
        let region = this.handRegions.preflop;
        return this.reduceHand(handArr, this.antesRegExp, region.start, region.end);
    }

    public replaceRaises = (handArr: string[]): string[] => {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.raisesRegExp, region.start, region.end);
    }

    public replaceCallsAndBets = (handArr: string[]): string[] => {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.callsOrBetsRegExp, region.start, region.end);
    }

    public replaceUncalledBets = (handArr: string[]): string[] => {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.uncalledBetRegExp, region.start, region.end);
    }

    public replaceCollectedFromPot = (handArr: string[]): string[] => {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.collectedFromRegExp, region.start, region.end);
    }

    public replaceSummaryMainPot = (handArr:string[]): string[] => {
        let region = this.handRegions.summary;
        return this.reduceHand(handArr, this.mainPotRegExp, region.start, region.end);
    }

    public replaceSummarySidePot = (handArr:string[]): string[] => {
        let region = this.handRegions.summary;
        return this.reduceHand(handArr, this.sidePotRegExp, region.start, region.end);
    }


    public replaceSummaryTotalPot = (handArr:string[]): string[] => {
        // this is the string with hand summary ex: Total pot $1223 | Rake $3 
        let i = this.handRegions.summary.start + 1;
        const originalString = handArr[i];

        let [potString, potValue] = this.totalPotRegExp.exec(originalString)     
        let [rakeString, rakeValue] =    this.rakeRegExp.exec(originalString)

        let pot = +potValue;
        let rake = +rakeValue;
        let potWithoutRake = pot - rake;

        // calculate new pot and adjust rake to represent more believable rake at lower pots
        let convertedPot = pot / this.stakeModifier;
        if (convertedPot < 60) rake = 1;

        // create new rake and pot string
        let newPot = convertedPot + rake;
        let newRakeString = rakeString.replace(rakeValue, rake + '')
        let newPotString = potString.replace(potValue, newPot + '');

        // update original string with new values
        let result = originalString
                        .replace(potString, newPotString)
                        .replace(rakeString, newRakeString)

        handArr[i] = result;
        return handArr;
    }

     public replaceSummarySeatPot = (handArr: string[]): string[] => {
        let region = this.handRegions.summary;
        return this.reduceHand(handArr, this.summaryAndWonRegExp, region.start, region.end);
    }


    // Helper functions

    public lastIndexOfString = (handArr: string[], stringToEndOn: string): number => {
        return handArr.findIndex(handString => handString.includes(stringToEndOn));
    }   

    public reduceHand = (hand: string[], regExp: RegExp, start: number, end: number, customFn?: Function): string[] => {
        return hand.reduce((previousValue: any[], currentValue: string, index, arr) => {

            if (index <= end && index >= start) {
                if (customFn) {
                    customFn();
                } else {
                    currentValue = this.transformString(currentValue, regExp);
                }
            }
            previousValue.push(currentValue);

            return previousValue
        }, []);
    }

    public convertToMockStakes = (curr: string): string => {
       return  (+curr / this.stakeModifier)
                        .toFixed(2)
                        .replace(/\.00$/, ''); 
    }

    public transformString = (originalString: string, regExp: RegExp): string => {
        let matches = regExp.exec(originalString);
        if (!matches) return originalString;

        let [oldStringSlice, ...captureGroups] = matches;
        captureGroups = captureGroups.filter(group => group);

        let newStringSlice = captureGroups.reduce((acc, curr) => {
            let newCurr = this.convertToMockStakes(curr);
            return acc.replace(curr as any, newCurr as any);
        }, oldStringSlice)

        return originalString.replace(oldStringSlice, newStringSlice);
    }

    public createNewMetadata = (originalString: string): string => {
        let matches = this.stakesRegExp.exec(originalString)
        if (!matches) console.error('Cannot read the stakes');

        let [stakesString, sb, bb] = matches;

        // will be used in the all pipe-transforming functions to scale the hand
        this.stakeModifier = +bb;

        console.log(this.stakeModifier)
        if (this.stakeModifier < 1) throw new Error('converter works only for stakes > 100')

        let newStakesString = stakesString
            .replace(sb, '0.5')
            .replace(bb, '1')

        return originalString.replace(stakesString, newStakesString);
    }


}