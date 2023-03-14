import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @Output() close = new EventEmitter<void>();
  isOpen = false;

  openPopup() {
    this.isOpen = true;
  }

  closePopup() {
    this.isOpen = false;
    this.close.emit();
  }

  onBackgroundClick() {
    this.closePopup();
  }
}
