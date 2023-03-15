import { ServerService } from './../../../service/server.service';
import { Component, EventEmitter, Output } from '@angular/core';
import { ServerBaseComponent } from '../../containers/server-base/server-base.component';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Status } from 'src/app/enumeration/status.enum';
import { Server } from 'src/app/model/Server';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css'],
})
export class PopupComponent {
  @Output() onClose = new EventEmitter<void>();
  @Output() addNewServer = new EventEmitter<Partial<Server>>();
  newServerName = '';
  isOpen = false;
  Status = Status;

  form: FormGroup = new FormGroup({
    ipAdress: new FormControl(''),
    name: new FormControl(''),
    memory: new FormControl(''),
    type: new FormControl(''),
    status: new FormControl(Status.SERVER_UP),
  });

  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      ipAdress: ['', [Validators.required]],
      name: ['', [Validators.required]],
      memory: ['', []],
      type: ['', []],
      status: ['', [Validators.required]],
    });
  }

  addServer() {
    if (this.form?.valid) {
      const newServer: Partial<Server> = {
        ...this.form.value,
        hidden: false,
      };
      this.addNewServer.emit(newServer);
      this.form.reset();
    }
  }

  closePopup() {
    this.onClose.emit();
  }
}
