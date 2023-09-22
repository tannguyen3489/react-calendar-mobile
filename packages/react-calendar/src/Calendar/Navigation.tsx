'use client';

import React, { useState, useCallback, Fragment } from 'react';
import { getUserLocale } from 'get-user-locale';
import { Dialog, Transition } from '@headlessui/react';
import Picker, { PickerValue } from 'react-mobile-picker';

import {
  getCenturyLabel,
  getDecadeLabel,
  getBeginNext,
  getBeginNext2,
  getBeginPrevious,
  getBeginPrevious2,
  getEndPrevious,
  getEndPrevious2,
} from '../shared/dates.js';
import {
  formatMonthYear as defaultFormatMonthYear,
  formatYear as defaultFormatYear,
} from '../shared/dateFormatter.js';

import type { Action, NavigationLabelFunc, RangeType } from '../shared/types.js';

const className = 'react-calendar__navigation';

function getDayArray(year: number, month: number) {
  const dayCount = new Date(year, month, 0).getDate();
  return Array.from({ length: dayCount }, (_, i) => String(i + 1).padStart(2, '0'));
}

type NavigationProps = {
  activeStartDate: Date;
  drillUp: () => void;
  formatMonthYear?: typeof defaultFormatMonthYear;
  formatYear?: typeof defaultFormatYear;
  locale?: string;
  maxDate?: Date;
  minDate?: Date;
  navigationAriaLabel?: string;
  navigationAriaLive?: 'off' | 'polite' | 'assertive';
  navigationLabel?: NavigationLabelFunc;
  next2AriaLabel?: string;
  next2Label?: React.ReactNode;
  nextAriaLabel?: string;
  nextLabel?: React.ReactNode;
  prev2AriaLabel?: string;
  prev2Label?: React.ReactNode;
  prevAriaLabel?: string;
  prevLabel?: React.ReactNode;
  setActiveStartDate: (nextActiveStartDate: Date, action: Action) => void;
  showDoubleView?: boolean;
  view: RangeType;
  views: string[];
};

export default function Navigation({
  activeStartDate,
  drillUp,
  formatMonthYear = defaultFormatMonthYear,
  formatYear = defaultFormatYear,
  locale,
  maxDate,
  minDate,
  navigationAriaLabel = '',
  navigationAriaLive,
  navigationLabel,
  next2AriaLabel = '',
  next2Label = '»',
  nextAriaLabel = '',
  nextLabel = '›',
  prev2AriaLabel = '',
  prev2Label = '«',
  prevAriaLabel = '',
  prevLabel = '‹',
  setActiveStartDate,
  showDoubleView,
  view,
  views,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState<PickerValue>({
    year: '1989',
    month: '08',
    day: '12',
  });
  const handlePickerChange = useCallback((newValue: PickerValue, key: string) => {
    if (key === 'day') {
      setPickerValue(newValue);
      return;
    }

    const { year, month } = newValue;
    const newDayArray = getDayArray(Number(year), Number(month));
    const newDay = newDayArray.includes(newValue.day)
      ? newValue.day
      : newDayArray[newDayArray.length - 1];
    setPickerValue({ ...newValue, day: newDay });
  }, []);

  const drillUpAvailable = views.indexOf(view) > 0;
  const shouldShowPrevNext2Buttons = view !== 'century';

  const previousActiveStartDate = getBeginPrevious(view, activeStartDate);
  const previousActiveStartDate2 = shouldShowPrevNext2Buttons
    ? getBeginPrevious2(view, activeStartDate)
    : undefined;
  const nextActiveStartDate = getBeginNext(view, activeStartDate);
  const nextActiveStartDate2 = shouldShowPrevNext2Buttons
    ? getBeginNext2(view, activeStartDate)
    : undefined;

  const prevButtonDisabled = (() => {
    if (previousActiveStartDate.getFullYear() < 0) {
      return true;
    }
    const previousActiveEndDate = getEndPrevious(view, activeStartDate);
    return minDate && minDate >= previousActiveEndDate;
  })();

  const prev2ButtonDisabled =
    shouldShowPrevNext2Buttons &&
    (() => {
      if ((previousActiveStartDate2 as Date).getFullYear() < 0) {
        return true;
      }
      const previousActiveEndDate = getEndPrevious2(view, activeStartDate);
      return minDate && minDate >= previousActiveEndDate;
    })();

  const nextButtonDisabled = maxDate && maxDate < nextActiveStartDate;

  const next2ButtonDisabled =
    shouldShowPrevNext2Buttons && maxDate && maxDate < (nextActiveStartDate2 as Date);

  function onClickPrevious() {
    setActiveStartDate(previousActiveStartDate, 'prev');
  }

  function onClickPrevious2() {
    setActiveStartDate(previousActiveStartDate2 as Date, 'prev2');
  }

  function onClickNext() {
    setActiveStartDate(nextActiveStartDate, 'next');
  }

  function onClickNext2() {
    setActiveStartDate(nextActiveStartDate2 as Date, 'next2');
  }

  function renderLabel(date: Date) {
    const label = (() => {
      switch (view) {
        case 'century':
          return getCenturyLabel(locale, formatYear, date);
        case 'decade':
          return getDecadeLabel(locale, formatYear, date);
        case 'year':
          return formatYear(locale, date);
        case 'month':
          return formatMonthYear(locale, date);
        default:
          throw new Error(`Invalid view: ${view}.`);
      }
    })();

    return navigationLabel
      ? navigationLabel({
          date,
          label,
          locale: locale || getUserLocale() || undefined,
          view,
        })
      : label;
  }

  const onMainTitleClick = () => {
    console.info('test', arguments);
    setIsOpen(true);
  };

  function renderButton() {
    const labelClassName = `${className}__label`;
    return (
      <button
        aria-label={navigationAriaLabel}
        aria-live={navigationAriaLive}
        className={labelClassName}
        disabled={!drillUpAvailable}
        onClick={onMainTitleClick}
        style={{ flexGrow: 1 }}
        type="button"
      >
        <span className={`${labelClassName}__labelText ${labelClassName}__labelText--from`}>
          {renderLabel(activeStartDate)}
        </span>
        {showDoubleView ? (
          <>
            <span className={`${labelClassName}__divider`}> – </span>
            <span className={`${labelClassName}__labelText ${labelClassName}__labelText--to`}>
              {renderLabel(nextActiveStartDate)}
            </span>
          </>
        ) : null}
      </button>
    );
  }

  return (
    <div className={className}>
      {prev2Label !== null && shouldShowPrevNext2Buttons ? (
        <button
          aria-label={prev2AriaLabel}
          className={`${className}__arrow ${className}__prev2-button`}
          disabled={prev2ButtonDisabled}
          onClick={onClickPrevious2}
          type="button"
        >
          {prev2Label}
        </button>
      ) : null}
      {prevLabel !== null && (
        <button
          aria-label={prevAriaLabel}
          className={`${className}__arrow ${className}__prev-button`}
          disabled={prevButtonDisabled}
          onClick={onClickPrevious}
          type="button"
        >
          {prevLabel}
        </button>
      )}
      {renderButton()}
      {nextLabel !== null && (
        <button
          aria-label={nextAriaLabel}
          className={`${className}__arrow ${className}__next-button`}
          disabled={nextButtonDisabled}
          onClick={onClickNext}
          type="button"
        >
          {nextLabel}
        </button>
      )}
      {next2Label !== null && shouldShowPrevNext2Buttons ? (
        <button
          aria-label={next2AriaLabel}
          className={`${className}__arrow ${className}__next2-button`}
          disabled={next2ButtonDisabled}
          onClick={onClickNext2}
          type="button"
        >
          {next2Label}
        </button>
      ) : null}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="calendar-time-picker w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-2">
                    <Picker value={pickerValue} onChange={handlePickerChange} wheelMode="natural">
                      <Picker.Column name="year">
                        {Array.from({ length: 100 }, (_, i) => `${1923 + i}`).map((year) => (
                          <Picker.Item key={year} value={year}>
                            {({ selected }) => (
                              <div
                                className={
                                  selected ? 'font-semibold text-neutral-900' : 'text-neutral-400'
                                }
                              >
                                {year}
                              </div>
                            )}
                          </Picker.Item>
                        ))}
                      </Picker.Column>
                      <Picker.Column name="month">
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(
                          (month) => (
                            <Picker.Item key={month} value={month}>
                              {({ selected }) => (
                                <div
                                  className={
                                    selected ? 'font-semibold text-neutral-900' : 'text-neutral-400'
                                  }
                                >
                                  {month}
                                </div>
                              )}
                            </Picker.Item>
                          ),
                        )}
                      </Picker.Column>
                      <Picker.Column name="day">
                        {getDayArray(Number(pickerValue.year), Number(pickerValue.month)).map(
                          (day) => (
                            <Picker.Item key={day} value={day}>
                              {({ selected }) => (
                                <div
                                  className={
                                    selected ? 'font-semibold text-neutral-900' : 'text-neutral-400'
                                  }
                                >
                                  {day}
                                </div>
                              )}
                            </Picker.Item>
                          ),
                        )}
                      </Picker.Column>
                    </Picker>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      OK
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
