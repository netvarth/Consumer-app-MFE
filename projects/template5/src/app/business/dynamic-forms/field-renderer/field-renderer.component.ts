import { Component, EventEmitter, Input, Output } from '@angular/core';
import { dynamicFormConstants } from '../dynamic-form.constants';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';

@Component({
  selector: 'app-field-renderer',
  templateUrl: './field-renderer.component.html',
  styleUrls: ['./field-renderer.component.scss'],
})
export class FieldRendererComponent {
  @Input() field: any
  @Input() sourceType: any;
  @Input() formData: any;
  @Input() section: any;
  @Input() sectionType: 'general';
  @Output() fieldDataEmit = new EventEmitter();
  datechange = false;
  staticVariables = {
    phoneNumber: {},
  };
  SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [
    CountryISO.India,
    CountryISO.UnitedKingdom,
    CountryISO.UnitedStates,
  ];
  separateDialCode = true;
  selectedTeethAreaOrRegionValues: string[] = [];
  selectedShadeValues: string[] = [];

  teethQuadrants = [
    { name: 'LT', items: [{ label: '8', value: 'lt8' }, { label: '7', value: 'lt7' }, { label: '6', value: 'lt6' }, { label: '5', value: 'lt5' }, { label: '4', value: 'lt4' }, { label: '3', value: 'lt3' }, { label: '2', value: 'lt2' }, { label: '1', value: 'lt1' }] },
    { name: 'RT', items: [{ label: '1', value: 'rt1' }, { label: '2', value: 'rt2' }, { label: '3', value: 'rt3' }, { label: '4', value: 'rt4' }, { label: '5', value: 'rt5' }, { label: '6', value: 'rt6' }, { label: '7', value: 'rt7' }, { label: '8', value: 'rt8' }] },
    { name: 'LB', items: [{ label: '8', value: 'lb8' }, { label: '7', value: 'lb7' }, { label: '6', value: 'lb6' }, { label: '5', value: 'lb5' }, { label: '4', value: 'lb4' }, { label: '3', value: 'lb3' }, { label: '2', value: 'lb2' }, { label: '1', value: 'lb1' }] },
    { name: 'RB', items: [{ label: '1', value: 'rb1' }, { label: '2', value: 'rb2' }, { label: '3', value: 'rb3' }, { label: '4', value: 'rb4' }, { label: '5', value: 'rb5' }, { label: '6', value: 'rb6' }, { label: '7', value: 'rb7' }, { label: '8', value: 'rb8' }] },
  ];


  teethShades = [
    [{ value: 'A1', label: 'A1' },
    { value: 'A2', label: 'A2' },
    { value: 'A3', label: 'A3' },
    { value: 'A3.5', label: 'A3.5' },
    { value: 'A4', label: 'A4' }],
    [{ value: 'B1', label: 'B1' },
    { value: 'B2', label: 'B2' },
    { value: 'B3', label: 'B3' },
    { value: 'B4', label: 'B4' }],
    [{ value: 'C1', label: 'C1' },
    { value: 'C2', label: 'C2' },
    { value: 'C3', label: 'C3' },
    { value: 'C4', label: 'C4' }],
    [{ value: 'D2', label: 'D2' },
    { value: 'D3', label: 'D3' },
    { value: 'D4', label: 'D4' }],
    [{ value: 'Bleach', label: 'Bleach' }]
  ];

  ngOnInit() {
    if (this.formData.preferreddatetime) {
      this.formData.preferreddatetime = new Date(this.formData.preferreddatetime)
    }
    if (this.formData.area) {
      this.selectedTeethAreaOrRegionValues = this.formData.area.split(',');
    }
  }

  getFieldValue(field: any, section: any): any {
    if (this.sourceType == 'array' || this.sectionType == 'general') {
      return this.formData[field.sectionKey];
    } else {
      return this.formData[section.sectionKey][field.sectionKey];
    }
  }

  getFieldOptions(field) {
    let options =
      field?.inputType == 'state'
        ? dynamicFormConstants.INDIAN_STATES_LIST
        : field?.inputType == 'country'
        ? dynamicFormConstants.COUNTRIES_LIST
        : field.options;
    return options || [];
  }

  setFieldValue(field: any, section: any, value: any): void {
    // (field?.inputType == 'date' || field?.inputType == 'time' || field?.inputType == 'dateTime') ? value = this.formatDateTime(value,field.inputType) : '';
    (field?.inputType == 'number') ? value = Number(value) : '';
    if (this.sourceType == 'array' || this.sectionType == 'general') {
      this.formData[field.sectionKey] = value;
    } else {
      this.formData[section.sectionKey][field.sectionKey] = value;
    }
    this.fieldDataEmit.emit(this.formData);
  }

  onPhoneNumberChange(event, section, field) {
    if (this.sectionType == 'general') {
      this.formData[field.sectionKey] = event?.e164Number
        ? event.e164Number
        : '';
    } else {
      this.formData[section.sectionKey][field.sectionKey] = event?.e164Number
        ? event.e164Number
        : '';
    }
  }


 getSelectedValues(field: any, section: any): string[] {
    let value = '';

    if (this.sourceType == 'array' || this.sectionType == 'general') {
      value = this.formData[field.sectionKey] || '';
    } else {
      value = this.formData[section.sectionKey]?.[field.sectionKey] || '';
    }

    return typeof value === 'string' ? value.split(',').map(v => v.trim()) : [];
  }



  toggleSelection(value: string, field: any, section: any, selectionType = 'multiple'): void {
    let currentValue = this.getSelectedValues(field, section);

    if (selectionType === 'single') {
      currentValue = [value];
    } else {
      const index = currentValue.indexOf(value);
      if (index > -1) {
        currentValue.splice(index, 1);
      } else {
        currentValue.push(value);
      }
    }

    const updatedValue = currentValue.join(',');

    if (this.sourceType == 'array' || this.sectionType == 'general') {
      this.formData[field.sectionKey] = updatedValue;
    } else {
      this.formData[section.sectionKey][field.sectionKey] = updatedValue;
    }

    this.fieldDataEmit.emit(this.formData);
  }

}
