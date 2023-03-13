import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerBaseComponent } from './server-base.component';

describe('ServerBaseComponent', () => {
  let component: ServerBaseComponent;
  let fixture: ComponentFixture<ServerBaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServerBaseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServerBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
