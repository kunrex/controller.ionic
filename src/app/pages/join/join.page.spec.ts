import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinPage } from './join.page';

describe('JoinPage', () => {
  let component: JoinPage;
  let fixture: ComponentFixture<JoinPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
