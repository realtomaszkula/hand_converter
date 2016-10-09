import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

type PipeLineFunction = (string) => string;

@Injectable()
export class HandConverterService {

    private stakeModifier: number;

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
        // to allow for chaining each fn must accept and return string
        let pipeline: PipeLineFunction[] = [
            this.replaceMetadata,
            // ... might add more in the future
        ] 

        return pipeline.reduce((acc, fn) => fn(acc) , hand);
    }

    private replaceMetadata(hand: string): string {
        const handArr = hand.trim().split('\n');

        return handArr.reduce((previousValue: any, currentValue: string, index, arr) => {
            // replaces first line with new metadata
            if (index === 0) currentValue = this.createNewMetadata(currentValue);
            previousValue.push(currentValue);

            // if last index join accumulator to return string
            if (index === arr.length - 1) previousValue = previousValue.join('\n');
            return previousValue
        }, [])
         
    }

    private replaceSeatsAndBlindsData(hand: string): string {
        const handArr = hand.trim().split('\n');

        const start = 2;
        const end = handArr.indexOf('*** HOLE CARDS ***');

        return handArr.reduce((previousValue: any, currentValue: string, index, arr) => {

            if (index < end && index > start) {
                currentValue = this.createNewStakesString(currentValue);
                currentValue = this.createNewBlindsString(currentValue);
            }

            if (index === arr.length - 1) previousValue = previousValue.join('\n');
            return previousValue
        }, []);
        
    }   

    private createNewBlindsString(originalString: string): string {
        let matches = this.blindsRegExp.exec(originalString);
        if (!matches) return originalString;

        /*
         ...blinds will capture 3 capture group (post sb, posts bb or posts sb & bb)
            out of which only one will return truthy value
        */
        let [blindString, ...blinds ] = matches;
        let oldBlind = blinds.filter(blind => blind);
        let newBlind = +oldBlind / this.stakeModifier

        return blindString.replace(oldBlind, newBlind)
    }

    private createNewStakesString(originalString: string): string {
        let matches = this.stacksRegExp.exec(originalString);
        if (!matches) return originalString;

        // old values
        let [stackString, stackSize] = matches;

        // new values
        let newStackSize = +stackSize / this.stakeModifier;
        let newStackString = stackString.replace(stackSize, newStackSize);
        
        return originalString.replace(stackString, newStackString)
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