import { folderOf, frameworkVersion, isFullPath, keiraWppConfig, parseOutputs, setConfigValue } from './wow-packet-parser';

const TEMPLATE = `<configuration>
  <appSettings>
    <add key="TargetedDatabase" value="1"/>
    <add key="DumpFormat" value="0"/>
    <add key="DBEnabled"          value="false" />
    <add key="Server"             value="localhost" />
    <add key="Port"               value="3306" />
    <add key="Username"           value="root" />
    <add key="Password"           value="" />
    <add key="WPPDatabase"        value="wpp" />
    <add key="TDBDatabase"        value="world" />
    </appSettings>
</configuration>`;

describe('WowPacketParser config', () => {
  it("sets a key, or adds it when it isn't there, its value escaped", () => {
    expect(setConfigValue(TEMPLATE, 'Port', 3307)).toContain('<add key="Port"               value="3307" />');
    expect(setConfigValue(TEMPLATE, 'Password', 'a"<&>')).toContain('value="a&quot;&lt;&amp;&gt;"');
    // `$` patterns are taken as they are
    expect(setConfigValue(TEMPLATE, 'Password', "p$&x$1$'")).toContain('<add key="Password"           value="p$&amp;x$1$\'" />');
    expect(setConfigValue(TEMPLATE, 'Extra', '$&')).toContain('<add key="Extra" value="$&amp;" />');
    expect(setConfigValue(TEMPLATE, 'SplitSQLFile', true)).toContain('    <add key="SplitSQLFile" value="true" />\n    </appSettings>');
  });

  it("writes the 3.3.5 text and SQL output, with Keira's databases when asked", () => {
    const plain = keiraWppConfig(TEMPLATE);
    expect(plain).toContain('<add key="TargetedDatabase" value="2"/>');
    expect(plain).toContain('<add key="DumpFormat" value="1"/>');
    expect(plain).toContain('value="false" />');
    expect(plain).toContain('<add key="Username"           value="root" />');

    const withDb = keiraWppConfig(TEMPLATE, {
      host: '127.0.0.1',
      port: 3306,
      user: 'acore',
      password: 'acore',
      wppDatabase: 'acore_wpp_keira',
      worldDatabase: 'acore_world',
    });
    expect(withDb).toContain('<add key="DBEnabled"          value="true" />');
    expect(withDb).toContain('<add key="Server"             value="127.0.0.1" />');
    expect(withDb).toContain('<add key="Username"           value="acore" />');
    expect(withDb).toContain('<add key="WPPDatabase"        value="acore_wpp_keira" />');
    expect(withDb).toContain('<add key="TDBDatabase"        value="acore_world" />');
  });

  it('finds what a parse wrote next to the sniff', () => {
    const files = [
      { name: 'My Sniff.pkt', modified: 10 },
      { name: 'My Sniff_parsed.txt', modified: 20 },
      { name: '2026_My Sniff_world.sql', modified: 21 },
      { name: 'My Sniff_old.txt', modified: 5 },
      { name: 'Other_parsed.txt', modified: 30 },
      { name: 'My Sniff.log', modified: 30 },
    ];
    expect(parseOutputs(files, 'C:\\sniffs\\My Sniff.pkt', 15)).toEqual(['2026_My Sniff_world.sql', 'My Sniff_parsed.txt']);
    expect(parseOutputs(files, '/sniffs/My Sniff.bin', 15)).toEqual(['2026_My Sniff_world.sql', 'My Sniff_parsed.txt']);
  });

  it('reads paths: full ones, their folder, the .NET version of a build', () => {
    expect(['C:\\sniffs\\a.pkt', 'c:/a.pkt', '\\\\server\\a.pkt', '/home/a.pkt'].every(isFullPath)).toBe(true);
    expect(['a.pkt', 'sniffs/a.pkt', '.\\a.pkt'].some(isFullPath)).toBe(false);
    expect(folderOf('C:\\sniffs\\a.pkt')).toBe('C:\\sniffs');
    expect(folderOf('C:\\a.pkt')).toBe('C:\\');
    expect(folderOf('/a.pkt')).toBe('/');
    expect(folderOf('/s/a.pkt')).toBe('/s');
    expect(['net9.0', 'net10.0', 'netcoreapp3.1', 'x'].map(frameworkVersion)).toEqual([9, 10, 3.1, 0]);
  });
});
