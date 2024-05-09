import { Component, ViewChild } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { NpcText } from '@keira/shared/acore-world-model';
import { PageObject, TranslateTestingModule } from '@keira/shared/test-utils';
import { ModelForm } from '@keira/shared/utils';
import { BsModalService } from 'ngx-bootstrap/modal';
import { instance, mock } from 'ts-mockito';
import { NpcTextFieldsGroupComponent } from './npc-text-fields-group.component';

describe(NpcTextFieldsGroupComponent.name, () => {
  type GroupIdType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

  @Component({
    template: `<keira-npc-text-fields-group [formGroup]="formGroup" [groupId]="groupId" />`,
    standalone: true,
    imports: [NpcTextFieldsGroupComponent],
  })
  class TestHostNpcTextFieldsGroupComponent {
    @ViewChild(NpcTextFieldsGroupComponent) child: NpcTextFieldsGroupComponent;
    formGroup: FormGroup<ModelForm<NpcText>>;
    groupId: GroupIdType;
  }

  class Page extends PageObject<TestHostNpcTextFieldsGroupComponent> {
    text0(groupId: number) {
      return this.getInputById(`text${groupId}_0`);
    }
    text1(groupId: number) {
      return this.getInputById(`text${groupId}_1`);
    }
    broadcastTextId(groupId: number) {
      return this.getInputById(`BroadcastTextID${groupId}`);
    }
    lang(groupId: number) {
      return this.getInputById(`lang${groupId}`);
    }
    probability(groupId: number) {
      return this.getInputById(`Probability${groupId}`);
    }
    em0(groupId: number) {
      return this.getInputById(`em${groupId}_0`);
    }
    em1(groupId: number) {
      return this.getInputById(`em${groupId}_1`);
    }
    em2(groupId: number) {
      return this.getInputById(`em${groupId}_2`);
    }
    em3(groupId: number) {
      return this.getInputById(`em${groupId}_3`);
    }
    em4(groupId: number) {
      return this.getInputById(`em${groupId}_4`);
    }
    em5(groupId: number) {
      return this.getInputById(`em${groupId}_5`);
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TestHostNpcTextFieldsGroupComponent, NpcTextFieldsGroupComponent, TranslateTestingModule],
      providers: [{ provide: BsModalService, useValue: instance(mock(BsModalService)) }],
    }).compileComponents();
  }));
  function setup(config: { groupId: GroupIdType }) {
    const formGroup = new FormGroup<ModelForm<NpcText>>({
      ID: new FormControl(),
      text0_0: new FormControl(),
      text0_1: new FormControl(),
      BroadcastTextID0: new FormControl(),
      lang0: new FormControl(),
      Probability0: new FormControl(),
      em0_0: new FormControl(),
      em0_1: new FormControl(),
      em0_2: new FormControl(),
      em0_3: new FormControl(),
      em0_4: new FormControl(),
      em0_5: new FormControl(),
      text1_0: new FormControl(),
      text1_1: new FormControl(),
      BroadcastTextID1: new FormControl(),
      lang1: new FormControl(),
      Probability1: new FormControl(),
      em1_0: new FormControl(),
      em1_1: new FormControl(),
      em1_2: new FormControl(),
      em1_3: new FormControl(),
      em1_4: new FormControl(),
      em1_5: new FormControl(),
      text2_0: new FormControl(),
      text2_1: new FormControl(),
      BroadcastTextID2: new FormControl(),
      lang2: new FormControl(),
      Probability2: new FormControl(),
      em2_0: new FormControl(),
      em2_1: new FormControl(),
      em2_2: new FormControl(),
      em2_3: new FormControl(),
      em2_4: new FormControl(),
      em2_5: new FormControl(),
      text3_0: new FormControl(),
      text3_1: new FormControl(),
      BroadcastTextID3: new FormControl(),
      lang3: new FormControl(),
      Probability3: new FormControl(),
      em3_0: new FormControl(),
      em3_1: new FormControl(),
      em3_2: new FormControl(),
      em3_3: new FormControl(),
      em3_4: new FormControl(),
      em3_5: new FormControl(),
      text4_0: new FormControl(),
      text4_1: new FormControl(),
      BroadcastTextID4: new FormControl(),
      lang4: new FormControl(),
      Probability4: new FormControl(),
      em4_0: new FormControl(),
      em4_1: new FormControl(),
      em4_2: new FormControl(),
      em4_3: new FormControl(),
      em4_4: new FormControl(),
      em4_5: new FormControl(),
      text5_0: new FormControl(),
      text5_1: new FormControl(),
      BroadcastTextID5: new FormControl(),
      lang5: new FormControl(),
      Probability5: new FormControl(),
      em5_0: new FormControl(),
      em5_1: new FormControl(),
      em5_2: new FormControl(),
      em5_3: new FormControl(),
      em5_4: new FormControl(),
      em5_5: new FormControl(),
      text6_0: new FormControl(),
      text6_1: new FormControl(),
      BroadcastTextID6: new FormControl(),
      lang6: new FormControl(),
      Probability6: new FormControl(),
      em6_0: new FormControl(),
      em6_1: new FormControl(),
      em6_2: new FormControl(),
      em6_3: new FormControl(),
      em6_4: new FormControl(),
      em6_5: new FormControl(),
      text7_0: new FormControl(),
      text7_1: new FormControl(),
      BroadcastTextID7: new FormControl(),
      lang7: new FormControl(),
      Probability7: new FormControl(),
      em7_0: new FormControl(),
      em7_1: new FormControl(),
      em7_2: new FormControl(),
      em7_3: new FormControl(),
      em7_4: new FormControl(),
      em7_5: new FormControl(),
      VerifiedBuild: new FormControl(),
    });

    const fixture = TestBed.createComponent(TestHostNpcTextFieldsGroupComponent);
    const page = new Page(fixture);
    const host = fixture.componentInstance;

    host.formGroup = formGroup;
    host.groupId = config.groupId;
    fixture.autoDetectChanges(true);
    fixture.detectChanges();

    return { host, page, formGroup };
  }

  it('should correctly initialise', () => {
    const { host } = setup({ groupId: 4 });

    expect(host.child).toBeDefined();
  });

  describe('changing the value of the form should be reflected in the component', () => {
    const GROUP_IDS: GroupIdType[] = [0, 1, 2, 3, 4, 5, 6, 7];

    for (const groupId of GROUP_IDS) {
      it(`[groupId=${groupId}]`, () => {
        const { page, formGroup } = setup({ groupId });

        formGroup.controls[`text${groupId}_0`].setValue('AzerothCore is the best WoW emulator');
        formGroup.controls[`text${groupId}_1`].setValue('Keira3 is the best WoW DB editor');
        formGroup.controls[`BroadcastTextID${groupId}`].setValue(111);
        formGroup.controls[`lang${groupId}`].setValue(222);
        formGroup.controls[`Probability${groupId}`].setValue(333);
        formGroup.controls[`em${groupId}_0`].setValue(444);
        formGroup.controls[`em${groupId}_1`].setValue(555);
        formGroup.controls[`em${groupId}_2`].setValue(666);
        formGroup.controls[`em${groupId}_3`].setValue(777);
        formGroup.controls[`em${groupId}_4`].setValue(888);
        formGroup.controls[`em${groupId}_5`].setValue(999);
        page.detectChanges();

        expect(page.text0(groupId).value).toEqual('AzerothCore is the best WoW emulator');
        expect(page.text1(groupId).value).toEqual('Keira3 is the best WoW DB editor');
        expect(page.broadcastTextId(groupId).value).toEqual('111');
        expect(page.lang(groupId).value).toEqual('222');
        expect(page.probability(groupId).value).toEqual('333');
        expect(page.em0(groupId).value).toEqual('444');
        expect(page.em1(groupId).value).toEqual('555');
        expect(page.em2(groupId).value).toEqual('666');
        expect(page.em3(groupId).value).toEqual('777');
        expect(page.em4(groupId).value).toEqual('888');
        expect(page.em5(groupId).value).toEqual('999');
      });
    }
  });

  describe('changing the inputs should be reflected in the form value', () => {
    const GROUP_IDS: GroupIdType[] = [0, 1, 2, 3, 4, 5, 6, 7];

    for (const groupId of GROUP_IDS) {
      it(`[groupId=${groupId}]`, () => {
        const { page, formGroup } = setup({ groupId });

        page.setInputValue(page.text0(groupId), 'AzerothCore is the best WoW emulator');
        page.setInputValue(page.text1(groupId), 'Keira3 is the best WoW DB editor');
        page.setInputValue(page.broadcastTextId(groupId), '111');
        page.setInputValue(page.lang(groupId), '222');
        page.setInputValue(page.probability(groupId), '333');
        page.setInputValue(page.em0(groupId), '444');
        page.setInputValue(page.em1(groupId), '555');
        page.setInputValue(page.em2(groupId), '666');
        page.setInputValue(page.em3(groupId), '777');
        page.setInputValue(page.em4(groupId), '888');
        page.setInputValue(page.em5(groupId), '999');

        page.detectChanges();

        expect(formGroup.controls[`text${groupId}_0`].value).toEqual('AzerothCore is the best WoW emulator');
        expect(formGroup.controls[`text${groupId}_1`].value).toEqual('Keira3 is the best WoW DB editor');
        expect(formGroup.controls[`BroadcastTextID${groupId}`].value).toEqual(111);
        expect(formGroup.controls[`lang${groupId}`].value).toEqual(222);
        expect(formGroup.controls[`Probability${groupId}`].value).toEqual(333);
        expect(formGroup.controls[`em${groupId}_0`].value).toEqual(444);
        expect(formGroup.controls[`em${groupId}_1`].value).toEqual(555);
        expect(formGroup.controls[`em${groupId}_2`].value).toEqual(666);
        expect(formGroup.controls[`em${groupId}_3`].value).toEqual(777);
        expect(formGroup.controls[`em${groupId}_4`].value).toEqual(888);
        expect(formGroup.controls[`em${groupId}_5`].value).toEqual(999);
      });
    }
  });
});
