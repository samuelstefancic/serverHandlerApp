import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ChangeDetectorRef,
  AfterViewChecked,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { Status } from 'src/app/enumeration/status.enum';
import { Server } from 'src/app/model/Server';
import { ServerService } from 'src/app/service/server.service';

@Component({
  selector: 'app-server-popup',
  templateUrl: './server-popup.component.html',
  styleUrls: ['./server-popup.component.css'],
})
export class ServerPopupComponent implements AfterViewChecked {
  @Input() action: 'add' | 'update' | 'delete' | 'reset' = 'add';
  @Input() server: Partial<Server> | null | undefined;
  @Output() actionCompleted = new EventEmitter<void>();
  @Output() addNewServer = new EventEmitter<Partial<Server>>();
  @Output() updateServer = new EventEmitter<Partial<Server>>();
  @Output() deleteServer = new EventEmitter<number>();
  Status = Status;
  allowedStatus = [Status.SERVER_UP, Status.SERVER_DOWN];
  private firstUpdate: boolean = true;

  form: FormGroup = new FormGroup({
    ipAdress: new FormControl(''),
    name: new FormControl(''),
    memory: new FormControl(''),
    type: new FormControl(''),
    status: new FormControl(Status.SERVER_UP),
  });

  constructor(
    private formBuilder: FormBuilder,
    private serverService: ServerService,
    private changeDetector: ChangeDetectorRef
  ) {}
  ngAfterViewChecked() {
    if (this.firstUpdate) {
      if (this.server) {
        this.form.patchValue(this.server);
        this.firstUpdate = false;
        this.changeDetector.detectChanges();
      }
    }
  }
  ngAfterViewInit() {
    if (this.server) {
      this.form.patchValue(this.server);
    }
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      id: [this.server?.id || null],
      ipAdress: [this.server?.ipAdress || '', [Validators.required]],
      name: [this.server?.name || '', [Validators.required]],
      memory: [this.server?.memory || '', []],
      type: [this.server?.type || '', []],
      status: [this.server?.status || Status.SERVER_UP, [Validators.required]],
    });
  }
  /*ngOnChanges(changes: SimpleChanges) {
    if (changes['server'] && changes['server'].currentValue) {
      this.form.patchValue(changes['server'].currentValue);
    } else if (changes['server'] && changes['server'].currentValue === null) {
      this.form.reset();
    }
  }*/

  performAction() {
    if (this.form?.valid) {
      const serverData: Partial<Server> = {
        ...this.form.value,
        hidden: false,
      };
      switch (this.action) {
        case 'add':
          this.addServer(serverData);
          this.onActionCompleted();
          break;
        case 'update':
          this.updateSelectedServer(serverData);
          this.onActionCompleted();
          break;
        case 'delete':
          this.deleteSelectedServer();
          break;
        case 'reset':
          this.resetForm();
          this.onActionCompleted();
          break;
        default:
          console.error('Invalid action type');
      }
    }
  }

  addServer(serverData: Partial<Server>) {
    this.addNewServer.emit(serverData);
    console.log('server have been added ' + serverData);
  }

  updateSelectedServer(serverData: Partial<Server>) {
    this.updateServer.emit({ ...serverData, id: this.server?.id });
  }

  deleteSelectedServer() {
    this.deleteServer.emit(this.server?.id);
  }

  resetForm() {
    this.form.reset();
  }

  onActionCompleted() {
    this.actionCompleted.emit();
    console.log('boutton pressé');
  }
}
