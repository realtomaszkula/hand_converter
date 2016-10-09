import { Component, trigger, animate, style, state, transition } from '@angular/core';

@Component({
    selector: 'drag-and-drop',
    template: `        
        <div class="jumbotron" >
              <span [@state]="state" (mouseover)="state='on'" (mouseleave)="state='off'" class="glyphicon glyphicon-level-up" aria-hidden="true"></span>  
        </div>`,
    styles: [`
    div { 
        text-align: center ;
    }
    span {
        font-size: 5em;
    }
    `],
    animations: [
        trigger('state', [
            state('off', style({ transform: 'scale(1)' }) ),
            state('on', style({ transform: 'scale(0.8)' }) ),
            transition('off <=> on', animate('200ms, ease-out'))
        ])
    ]
    

})
export class DragAndDropComponent {
    state = 'off'
}