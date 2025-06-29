import * as React from 'react';
import { spy } from 'sinon';
import { adapterToUse, getAllFieldInputRoot } from 'test/utils/pickers';
import { vi } from 'vitest';
import { DescribeRangeValidationTestSuite } from './describeRangeValidation.types';

const testInvalidStatus = (
  expectedAnswer: boolean[],
  fieldType: 'single-input' | 'multi-input' | 'no-input',
) => {
  const answers =
    fieldType === 'multi-input' ? expectedAnswer : [expectedAnswer[0] || expectedAnswer[1]];

  const fields = getAllFieldInputRoot();
  answers.forEach((answer, index) => {
    const fieldRoot = fields[index];

    expect(fieldRoot).to.have.attribute('aria-invalid', answer ? 'true' : 'false');
  });
};

export const testTextFieldRangeValidation: DescribeRangeValidationTestSuite = (
  ElementToTest,
  getOptions,
) => {
  const { componentFamily, render, fieldType, withDate, withTime } = getOptions();

  describe.skipIf(!['picker', 'field'].includes(componentFamily))('text field:', () => {
    it('should accept single day range', () => {
      const onErrorMock = spy();
      render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-01-01T10:15:00'),
            adapterToUse.date('2018-01-01T10:15:00'),
          ]}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);
    });

    it('should not accept end date prior to start state', () => {
      const onErrorMock = spy();
      render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-01-02'), adapterToUse.date('2018-01-01')]}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['invalidRange', 'invalidRange']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withDate)('should apply shouldDisableDate', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')]}
          shouldDisableDate={(date: any) =>
            adapterToUse.isAfter(date, adapterToUse.date('2018-03-10'))
          }
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-13')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'shouldDisableDate']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-12'), adapterToUse.date('2018-03-13')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([
        'shouldDisableDate',
        'shouldDisableDate',
      ]);
      testInvalidStatus([true, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-12'), adapterToUse.date('2018-03-13')],
        shouldDisableDate: (date: any) =>
          adapterToUse.isBefore(date, adapterToUse.date('2018-03-13')),
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['shouldDisableDate', null]);
      testInvalidStatus([true, false], fieldType);
    });

    it.skipIf(!withDate)('should apply shouldDisableDate specifically on end date', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')]}
          shouldDisableDate={(date: any, position: string) =>
            position === 'end' ? adapterToUse.isAfter(date, adapterToUse.date('2018-03-10')) : false
          }
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-13')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'shouldDisableDate']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-12'), adapterToUse.date('2018-03-13')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'shouldDisableDate']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-12'), adapterToUse.date('2018-03-13')],
        shouldDisableDate: (date: any, position: string) =>
          position === 'end' ? adapterToUse.isBefore(date, adapterToUse.date('2018-03-13')) : false,
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withDate)('should apply shouldDisableDate specifically on start date', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')]}
          shouldDisableDate={(date: any, position: string) =>
            position === 'start'
              ? adapterToUse.isAfter(date, adapterToUse.date('2018-03-10'))
              : false
          }
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-13')],
      });

      expect(onErrorMock.callCount).to.equal(0);

      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-12'), adapterToUse.date('2018-03-13')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['shouldDisableDate', null]);
      testInvalidStatus([true, false], fieldType);

      setProps({
        shouldDisableDate: (date: any, position: string) =>
          position === 'start'
            ? adapterToUse.isBefore(date, adapterToUse.date('2018-03-13'))
            : false,
      });

      expect(onErrorMock.callCount).to.equal(1);
      testInvalidStatus([true, false], fieldType);
    });

    describe('with fake timer', () => {
      beforeEach(() => {
        vi.setSystemTime(new Date(2018, 0, 1));
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('should apply disablePast', () => {
        const onErrorMock = spy();
        const now = adapterToUse.date();
        function WithFakeTimer(props: any) {
          return <ElementToTest value={[now, now]} {...props} />;
        }

        const { setProps } = render(<WithFakeTimer disablePast onError={onErrorMock} />);

        let past: null | ReturnType<typeof adapterToUse.date> = null;
        if (withDate) {
          past = adapterToUse.addDays(now!, -1);
        } else if (adapterToUse.isSameDay(adapterToUse.addHours(now!, -1), now!)) {
          past = adapterToUse.addHours(now!, -1);
        }

        if (past === null) {
          return;
        }

        setProps({
          value: [past, now],
        });

        expect(onErrorMock.callCount).to.equal(1);
        expect(onErrorMock.lastCall.args[0]).to.deep.equal(['disablePast', null]);
        testInvalidStatus([true, false], fieldType);

        setProps({
          value: [past, past],
        });

        expect(onErrorMock.callCount).to.equal(2);
        expect(onErrorMock.lastCall.args[0]).to.deep.equal(['disablePast', 'disablePast']);
        testInvalidStatus([true, true], fieldType);
      });
    });

    it('should apply disableFuture', () => {
      const onErrorMock = spy();
      const now = adapterToUse.date();
      function WithFakeTimer(props: any) {
        return <ElementToTest value={[now, now]} {...props} />;
      }

      const { setProps } = render(<WithFakeTimer disableFuture onError={onErrorMock} />);

      let future: null | ReturnType<typeof adapterToUse.date> = null;

      if (withDate) {
        future = adapterToUse.addDays(now, 1);
      } else if (adapterToUse.isSameDay(adapterToUse.addHours(now, 1), now)) {
        future = adapterToUse.addHours(now, 1);
      }

      if (future === null) {
        return;
      }

      setProps({
        value: [now, future],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'disableFuture']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [future, future],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['disableFuture', 'disableFuture']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withDate)('should apply minDate', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')]}
          minDate={adapterToUse.date('2018-03-15')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minDate', 'minDate']);
      testInvalidStatus([true, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-15')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minDate', null]);
      testInvalidStatus([true, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-16'), adapterToUse.date('2018-03-17')],
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withDate)('should apply minDate when only first field is filled', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-03-09'), null]}
          minDate={adapterToUse.date('2018-03-11')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minDate', null]);
      testInvalidStatus([true, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-16'), null],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withDate)('should apply minDate when only second field is filled', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[null, adapterToUse.date('2018-03-09')]}
          minDate={adapterToUse.date('2018-03-15')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'minDate']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [null, adapterToUse.date('2018-03-16')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withDate)('should apply maxDate', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-03-09'), adapterToUse.date('2018-03-10')]}
          maxDate={adapterToUse.date('2018-03-15')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-15'), adapterToUse.date('2018-03-17')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'maxDate']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-16'), adapterToUse.date('2018-03-17')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['maxDate', 'maxDate']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withTime)('should apply minTime', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-03-10T09:00:00'),
            adapterToUse.date('2018-03-10T10:00:00'),
          ]}
          minTime={adapterToUse.date('2018-03-10T12:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minTime', 'minTime']);
      testInvalidStatus([true, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-10T09:00:00'), adapterToUse.date('2018-03-10T12:05:00')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minTime', null]);
      testInvalidStatus([true, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-10T12:15:00'), adapterToUse.date('2018-03-10T18:00:00')],
      });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });
    it.skipIf(!withTime)('should ignore date when applying minTime', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-03-05T09:00:00'),
            adapterToUse.date('2018-03-15T10:00:00'),
          ]}
          minTime={adapterToUse.date('2018-03-10T12:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minTime', 'minTime']);
      testInvalidStatus([true, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-05T15:00:00'), adapterToUse.date('2018-03-15T16:05:00')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });

    it.skipIf(!withTime)('should apply minTime when only first field is filled', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[adapterToUse.date('2018-02-01T15:00:00'), null]}
          minTime={adapterToUse.date('2018-03-01T12:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-02-01T05:00:00'), null],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minTime', null]);
      testInvalidStatus([true, false], fieldType);
    });

    it.skipIf(!withTime)('should apply minTime when only second field is filled', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[null, adapterToUse.date('2018-02-01T15:00:00')]}
          minTime={adapterToUse.date('2018-03-01T12:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [null, adapterToUse.date('2018-02-01T05:00:00')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'minTime']);
      testInvalidStatus([false, true], fieldType);
    });

    it.skipIf(!withTime)('should apply maxTime', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-03-10T09:00:00'),
            adapterToUse.date('2018-03-10T10:00:00'),
          ]}
          maxTime={adapterToUse.date('2018-03-10T12:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-10T09:00:00'), adapterToUse.date('2018-03-10T12:05:00')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'maxTime']);
      testInvalidStatus([false, true], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-10T12:15:00'), adapterToUse.date('2018-03-10T18:00:00')],
      });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['maxTime', 'maxTime']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withTime)('should ignore date when applying maxTime', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-03-05T09:00:00'),
            adapterToUse.date('2018-03-15T10:00:00'),
          ]}
          maxTime={adapterToUse.date('2018-03-10T12:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({
        value: [adapterToUse.date('2018-03-05T15:00:00'), adapterToUse.date('2018-03-15T16:05:00')],
      });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['maxTime', 'maxTime']);
      testInvalidStatus([true, true], fieldType);
    });

    // prop only available on DateTime pickers
    it.skipIf(!withDate || !withTime)('should apply maxDateTime', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-03-01T09:00:00'),
            adapterToUse.date('2018-03-02T12:00:00'),
          ]}
          maxDateTime={adapterToUse.date('2018-03-02T13:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(0);
      testInvalidStatus([false, false], fieldType);

      setProps({ maxDateTime: adapterToUse.date('2018-03-02T08:00:00') });

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, 'maxTime']);
      testInvalidStatus([false, true], fieldType);

      setProps({ maxDateTime: adapterToUse.date('2018-03-01T05:00:00') });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['maxTime', 'maxDate']);
      testInvalidStatus([true, true], fieldType);
    });

    it.skipIf(!withDate || !withTime)('should apply minDateTime', () => {
      const onErrorMock = spy();
      const { setProps } = render(
        <ElementToTest
          onError={onErrorMock}
          value={[
            adapterToUse.date('2018-03-01T09:00:00'),
            adapterToUse.date('2018-03-02T12:00:00'),
          ]}
          minDateTime={adapterToUse.date('2018-03-02T13:00:00')}
        />,
      );

      expect(onErrorMock.callCount).to.equal(1);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minDate', 'minTime']);
      testInvalidStatus([true, true], fieldType);

      setProps({ minDateTime: adapterToUse.date('2018-03-02T08:00:00') });

      expect(onErrorMock.callCount).to.equal(2);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal(['minDate', null]);
      testInvalidStatus([true, false], fieldType);

      setProps({ minDateTime: adapterToUse.date('2018-03-01T05:00:00') });

      expect(onErrorMock.callCount).to.equal(3);
      expect(onErrorMock.lastCall.args[0]).to.deep.equal([null, null]);
      testInvalidStatus([false, false], fieldType);
    });
  });
};
