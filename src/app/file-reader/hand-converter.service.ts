import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

type PipeLineFunction = (string) => string;

@Injectable()
export class HandConverterService {
    /* 
        Capture groups: 
        1st: entire stakes string ex: ($50/$100 USD) or ($50/$100) 
            (stars appends USD suffix for zoom hands)
        2nd: small blind ex: 50
        3rd: big blind ex: 100
    */
    private stakesRegExp = /\(\$(\d+)\/\$(\d+)(?:\sUSD\)|\))/;

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
        }, []) as string
         
    }

    private createNewMetadata(metaData: string): string {
        let matches = this.stakesRegExp.exec(metaData)
        let [stakesString, sb, bb] = matches;

        let newStakesString = stakesString
            .replace(sb, '0.5')
            .replace(bb, '1')

        return metaData.replace(stakesString, newStakesString);
    }


}