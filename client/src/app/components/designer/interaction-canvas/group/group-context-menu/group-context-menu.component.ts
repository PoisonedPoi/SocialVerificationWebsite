import { Component, OnInit, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { Group } from 'src/app/models/group';

@Component({
  selector: 'app-group-context-menu',
  templateUrl: './group-context-menu.component.html',
  styles: [
  ]
})
export class GroupContextMenuComponent implements OnInit {

  @Input() group: Group | null = null;
  @Input() x: string = '';
  @Input() y: string = '';

  @Output() remove = new EventEmitter<number>();
  @Output() hide = new EventEmitter<any>();

  @HostListener('document:click', ['$event'])
  clickOff(event: any) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.hide.emit('hide me');
    }  
  }

  constructor(private eRef: ElementRef) { }

  ngOnInit(): void {
  }

  removeGroup() {
    console.log("Remove: ");
    console.log(this.group);
    if (this.group) {
      this.remove.emit(this.group.id);
    }
  }
}
