import { TestBed } from '@angular/core/testing';
import { ElectronService } from './electron.service';
import { ServerSettingsService } from './server-settings.service';
import { SOAP_TRANSPORT } from './soap-transport';
import { reloadCommand, SoapService } from './soap.service';

describe('SoapService', () => {
  const setup = (answer: { status: number; body: string } | Error, electron = true) => {
    localStorage.clear();
    const transport = vi.fn(() => (answer instanceof Error ? Promise.reject(answer) : Promise.resolve(answer)));
    TestBed.configureTestingModule({
      providers: [
        { provide: SOAP_TRANSPORT, useValue: transport },
        { provide: ElectronService, useValue: { isElectron: () => electron } },
      ],
    });
    TestBed.inject(ServerSettingsService).save({ soapEnabled: true, soapUser: 'gm', soapPassword: 'p&w' });
    return { service: TestBed.inject(SoapService), transport };
  };

  it('runs a command and reads the answer', async () => {
    const { service, transport } = setup({ status: 200, body: '<ns1:executeCommandResponse><result>Re-Loading &lt;texts&gt;</result>' });
    expect(service.available()).toBe(true);
    expect(await service.execute('.reload creature_text <x>')).toBe('Re-Loading <texts>');
    const [[request]] = transport.mock.calls as unknown as [[{ host: string; port: number; auth: string; body: string }]];
    expect(request).toEqual(expect.objectContaining({ host: '127.0.0.1', port: 7878, auth: 'gm:p&w' }));
    expect(request.body).toContain('<command>reload creature_text &lt;x&gt;</command>');
    expect(request.body).toContain('xmlns:ns1="urn:AC"');
  });

  it('gives no result when there is none', async () => {
    expect(await setup({ status: 200, body: '<ok/>' }).service.execute('server info')).toBe('');
  });

  it("says why a command failed: the server's fault, a refused account, a bad answer, no connection", async () => {
    await expect(setup({ status: 500, body: '<faultstring>There is no such command</faultstring>' }).service.execute('x')).rejects.toThrow(
      'There is no such command',
    );
    TestBed.resetTestingModule();
    await expect(setup({ status: 401, body: '' }).service.execute('x')).rejects.toThrow('refused');
    TestBed.resetTestingModule();
    await expect(setup({ status: 404, body: '' }).service.execute('x')).rejects.toThrow('HTTP 404');
    TestBed.resetTestingModule();
    await expect(setup(new Error('ECONNREFUSED')).service.execute('x')).rejects.toThrow('ECONNREFUSED');
  });

  it('is only available in the desktop app, with SOAP on', () => {
    expect(setup({ status: 200, body: '' }, false).service.available()).toBe(false);
  });

  it("knows each table's reload", () => {
    expect(reloadCommand('creature_text', '1')).toBe('reload creature_text');
    expect(reloadCommand('creature_template', '299')).toBe('reload creature_template 299');
    expect(reloadCommand('creature_template', '{"x":1}')).toBeUndefined();
    expect(reloadCommand('pool_template', '1')).toBeUndefined();
  });
});
