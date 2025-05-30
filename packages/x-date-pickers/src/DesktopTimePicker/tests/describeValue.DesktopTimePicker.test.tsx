import { fireEvent, screen } from '@mui/internal-test-utils';
import {
  createPickerRenderer,
  adapterToUse,
  expectFieldValueV7,
  describeValue,
  formatFullTimeValue,
  getFieldInputRoot,
} from 'test/utils/pickers';
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker';
import { PickerValue } from '@mui/x-date-pickers/internals';

describe('<DesktopTimePicker /> - Describe Value', () => {
  const { render } = createPickerRenderer();

  describeValue<PickerValue, 'picker'>(DesktopTimePicker, () => ({
    render,
    componentFamily: 'picker',
    type: 'time',
    variant: 'desktop',
    values: [adapterToUse.date('2018-01-01T11:30:00'), adapterToUse.date('2018-01-01T12:35:00')],
    emptyValue: null,
    assertRenderedValue: (expectedValue: any) => {
      const hasMeridiem = adapterToUse.is12HourCycleInCurrentLocale();
      const fieldRoot = getFieldInputRoot();

      let expectedValueStr: string;
      if (expectedValue) {
        expectedValueStr = formatFullTimeValue(adapterToUse, expectedValue);
      } else {
        expectedValueStr = hasMeridiem ? 'hh:mm aa' : 'hh:mm';
      }

      expectFieldValueV7(fieldRoot, expectedValueStr);
    },
    setNewValue: (value, { isOpened, applySameValue, selectSection, pressKey }) => {
      const newValue = applySameValue
        ? value!
        : adapterToUse.addMinutes(adapterToUse.addHours(value!, 1), 5);

      if (isOpened) {
        const hasMeridiem = adapterToUse.is12HourCycleInCurrentLocale();
        const hours = adapterToUse.format(newValue, hasMeridiem ? 'hours12h' : 'hours24h');
        const hoursNumber = adapterToUse.getHours(newValue);
        fireEvent.click(screen.getByRole('option', { name: `${parseInt(hours, 10)} hours` }));
        fireEvent.click(
          screen.getByRole('option', { name: `${adapterToUse.getMinutes(newValue)} minutes` }),
        );
        if (hasMeridiem) {
          fireEvent.click(screen.getByRole('option', { name: hoursNumber >= 12 ? 'PM' : 'AM' }));
        }
      } else {
        selectSection('hours');
        pressKey(undefined, 'ArrowUp');

        selectSection('minutes');
        pressKey(undefined, 'PageUp'); // increment by 5 minutes

        const hasMeridiem = adapterToUse.is12HourCycleInCurrentLocale();
        if (hasMeridiem) {
          selectSection('meridiem');
          const previousHours = adapterToUse.getHours(value!);
          const newHours = adapterToUse.getHours(newValue);
          // update meridiem section if it changed
          if ((previousHours < 12 && newHours >= 12) || (previousHours >= 12 && newHours < 12)) {
            pressKey(undefined, 'ArrowUp');
          }
        }
      }

      return newValue;
    },
  }));
});
