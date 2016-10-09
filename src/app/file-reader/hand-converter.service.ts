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
        1st: entire stakes string ex: ($50/$100 USD) or ($50/$100) 
            (stars appends USD suffix for zoom hands)
        2nd: small blind ex: 50
        3rd: big blind ex: 100
    */
    private stakesRegExp = /\(\$(\d+)\/\$(\d+)(?:\sUSD\)|\))/;

    /*
        Capture groups:
        1st: entire string ex: ($783.50 in chips) 
        2nd: naked stack ex: 783.50
    */
    private stacksRegExp = /\(\$(\d+\.*\d+)\sin chips\)/;

    /*
        Capture groups: 
        1st: entire string ex: posts small blind $1
        2nd: 1
        3rd: undefined
        4th: undefined

        only one capture group of 2..4 will return truthy value
    */
    private blindsRegExp = /posts small blind \$(\d+)|posts big blind \$(\d+)|posts big & small blind \$(\d+)/;

    /*
        Capture groups:
        1st: entire string ex: raises $719 to $982.25
        2nd: raises from: 719
        3rd: raises to: 982.25
    */
    private raisesRegExp = /raises \$(\d+|\d+\.\d+) to \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: bets $80.42
        2nd: raises from: 80.42
    */
    private callsOrBetsRegExp = /bets \$(\d+\.\d+|\d+|)|calls \$(\d+\.\d+|\d+)/

    /*
        Capture groups:
        1st: entire string ex: collected $2424.24
        2nd: 2424.24
    */
    private collectedFromRegExp = /collected \$(\d+\.\d+|\d+)/

    private hands: string[];
    private _convertedHands: string[];

    get convertedHands() {
        return this._convertedHands;
    }

    setHands(hands: string[]) {
        this.hands = hands;
        this._convertedHands = this.convertHands(hands)
    }

    private convertHands(hands: string[]): string[] {
        return this.hands.reduce((acc: string[], hand: string) => {
            acc.push(this.convert(hand))
            return acc
        }, [])
    }

    private convert(hand: string) {
        let slicedHand = hand.split('\n')
        this.setHandRegions(slicedHand)
        // to allow for chaining each fn must accept and return string
        let pipeline: PipelineFn[] = [
            this.replaceMetadata,
            this.replaceStacks,
            this.replaceBlinds, 
            this.replaceRaises,
            this.replaceCallsAndBets,
        ] 

        return pipeline.reduce((acc, fn) => fn(acc) , slicedHand).join('\n');
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

    private replaceMetadata(handArr: string[]): string[] {
        return handArr.reduce((previousValue, currentValue, index, arr) => {
            // replaces first line with new metadata
            if (index === 0) currentValue = this.createNewMetadata(currentValue);
            previousValue.push(currentValue);
            return previousValue
        }, [])
         
    }

    private replaceStacks(handArr: string[]): string[] {
        let region = this.handRegions.preflop;
        return this.reduceHand(handArr, this.stacksRegExp, region.start, region.end);

    }

    private replaceBlinds(handArr: string[]): string[] {
        let region = this.handRegions.preflop;
        return this.reduceHand(handArr, this.blindsRegExp, region.start, region.end);
    }

    private replaceAntes(handArr: string[]): string[] {
        // TODO
        return handArr;
    }

    private replaceRaises(handArr: string[]): string[] {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.raisesRegExp, region.start, region.end);
    }

    private replaceCallsAndBets(handArr: string[]): string[] {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.callsOrBetsRegExp, region.start, region.end);
    }

    private replaceCollectedFromPot(handArr: string[]): string[] {
        let region = this.handRegions.postflop;
        return this.reduceHand(handArr, this.collectedFromRegExp, region.end - 2, region.end);
    }

    private replaceTotalPot(handArr: string[]): string[] {
        let region = this.handRegions.summary;
        // TODO
        return handArr;
    }

    private replaceHandSummary(handArr:string[]): string[] {
        let region = this.handRegions.summary;
        // TODO
        return handArr;
    }

    // Helper functions

    lastIndexOfString(handArr: string[], stringToEndOn: string): number {
        return handArr.findIndex(handString => handString.includes(stringToEndOn));
    }   

    reduceHand(hand: string[], regExp: RegExp, start: number, end: number): string[] {
        return hand.reduce((previousValue: any[], currentValue: string, index, arr) => {

            if (index < end && index > start) {
                currentValue = this.transformString(currentValue, regExp);
            }
            previousValue.push(currentValue);

            return previousValue
        }, []);
    }

    private transformString(originalString: string, regExp: RegExp): string {
        let matches = regExp.exec(originalString);
        if (!matches) return originalString;

        let [oldStringSlice, ...captureGroups] = matches;
        captureGroups = captureGroups.filter(group => group);

        let newStringSlice = captureGroups.reduce((acc, curr) => {
            let newCurr = +curr / this.stakeModifier
            return acc.replace(curr, newCurr);
        }, oldStringSlice)

        return originalString.replace(oldStringSlice, newStringSlice);
    }

    private createNewMetadata(originalString: string): string {
        let matches = this.stakesRegExp.exec(originalString)
        if (!matches) return originalString;

        let [stakesString, sb, bb] = matches;

        // will be used in the all pipe-transforming functions to scale the hand
        this.stakeModifier = +bb;

        let newStakesString = stakesString
            .replace(sb, '0.5')
            .replace(bb, '1')

        return originalString.replace(stakesString, newStakesString);
    }


}