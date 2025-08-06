import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { LATEST_RELEASE_API_URL } from '@keira/shared/constants';
import { TranslateTestingModule } from '@keira/shared/test-utils';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { instance, mock } from 'ts-mockito';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';

import { AppComponent } from './app.component';

import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { KEIRA_APP_CONFIG_TOKEN, KEIRA_MOCK_CONFIG } from '@keira/shared/config';
import { MainWindowComponent } from '@keira/main/main-window';
import { ConnectionWindowComponent } from '@keira/main/connection-window';
import { ModalConfirmComponent, QueryErrorComponent } from '@keira/shared/base-editor-components';
import { ElectronService } from '@keira/shared/common-services';
import { MysqlService } from '@keira/shared/db-layer';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BsDropdownModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        ModalConfirmComponent,
        ToastrModule.forRoot(),
        TranslateTestingModule,
        MainWindowComponent,
        ConnectionWindowComponent,
        QueryErrorComponent,
        AppComponent,
      ],
      providers: [
        provideZonelessChangeDetection(),
        provideNoopAnimations(),
        { provide: ElectronService, useValue: instance(mock(ElectronService)) },
        { provide: MysqlService, useValue: instance(mock(MysqlService)) },
        { provide: KEIRA_APP_CONFIG_TOKEN, useValue: KEIRA_MOCK_CONFIG },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  const setup = () => {
    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;
    const toastrService: ToastrService = TestBed.inject(ToastrService);
    const httpTestingController = TestBed.inject(HttpTestingController);

    const connectionLostSubject = new Subject<boolean>();
    // @ts-ignore
    TestBed.inject(MysqlService)['connectionLost$'] = connectionLostSubject.asObservable();

    return { fixture, component, connectionLostSubject, toastrService, httpTestingController };
  };

  describe('handleConnectionLostAlerts', () => {
    it('should correctly react on connectionLost$ [connection lost]', () => {
      const { fixture, toastrService, connectionLostSubject } = setup();
      fixture.detectChanges();
      spyOn(toastrService, 'success');
      spyOn(toastrService, 'error');

      connectionLostSubject.next(false);
      connectionLostSubject.next(false);
      connectionLostSubject.next(false);

      expect(toastrService.success).toHaveBeenCalledTimes(0);
      expect(toastrService.error).toHaveBeenCalledTimes(1);
      expect(toastrService.error).toHaveBeenCalledWith('Database connection lost');
    });

    it('should correctly react on connectionLost$ [reconnected]', () => {
      const { fixture, connectionLostSubject, toastrService } = setup();
      fixture.detectChanges();
      spyOn(toastrService, 'success');
      spyOn(toastrService, 'error');

      connectionLostSubject.next(true);

      expect(toastrService.error).toHaveBeenCalledTimes(0);
      expect(toastrService.success).toHaveBeenCalledTimes(1);
      expect(toastrService.success).toHaveBeenCalledWith('Database reconnected');
    });
  });

  describe('handleNewerVersionAlert', () => {
    it('should correctly query and show the alert when the latest version is different than the current one', () => {
      const { fixture, httpTestingController } = setup();

      fixture.detectChanges();

      const req = httpTestingController.expectOne(LATEST_RELEASE_API_URL);
      expect(req.request.method).toEqual('GET');
      req.flush({ tag_name: 'some newer version' });

      httpTestingController.verify();
    });

    it('should correctly query and NOT show the alert when the latest version the same as the current one', () => {
      const { fixture, httpTestingController } = setup();

      fixture.detectChanges();

      const req = httpTestingController.expectOne(LATEST_RELEASE_API_URL);
      expect(req.request.method).toEqual('GET');
      req.flush({ tag_name: `v${packageInfo.version}` });

      httpTestingController.verify();
    });

    it('should set showNewerVersionAlert to false when the fa-xmark button is clicked', async () => {
      const { fixture, httpTestingController, component } = setup();
      fixture.detectChanges();
      const req = httpTestingController.expectOne(LATEST_RELEASE_API_URL);
      req.flush({ tag_name: 'some newer version' });
      await fixture.whenStable();
      fixture.detectChanges();

      // Check if the alert is shown with the close button
      expect(component.showNewerVersionAlert).toBeTrue();
      const closeBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector('.newer-version-alert .fa-xmark').closest('button');
      expect(closeBtn).toBeTruthy();

      // click the close button
      closeBtn!.click();
      fixture.detectChanges();

      // the alert should be hidden now
      expect(component.showNewerVersionAlert).toBeFalse();
    });
  });
});
