import { Component } from '@angular/core';

@Component({
    selector: 'drag-and-drop',
    template: `        
        <div class="jumbotron">
              <span class="glyphicon glyphicon-level-up" aria-hidden="true"></span>  
        </div>`,
    styles: [`
    div { 
        text-align: center ;
    }
    span {
        font-size: 5em;
    }
    `]

})
export class DragAndDropComponent {
    
}