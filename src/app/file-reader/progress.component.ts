import { Component, Input } from '@angular/core';

@Component({
    selector: 'progress-component',
    template: `
        <div class="progress">
            <div class="progress-bar" role="progressbar" [style.width]="value + '%'">
                    <span> {{value}}% Complete </span>
            </div>
        </div>
    `
})
export class ProgressComponent {
    @Input() value: number;
}