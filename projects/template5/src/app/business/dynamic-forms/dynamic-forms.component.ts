import { Component, EventEmitter, Input, Output } from '@angular/core';
import { dynamicFormConstants } from './dynamic-form.constants';
import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from 'ngx-intl-tel-input';
import { ConfirmBoxComponent } from 'jaldee-framework/confirm';
import { MatDialog } from '@angular/material/dialog';

interface SimpleField {
  sectionKey: string;
  title: string;
  type: string;
  itemType: string;
  inputType: string;
  required?: boolean;
  description?: string;
  placeholder?: string;
  default?: string;
  minimum?: boolean;
  maximum?: string;
  maxLength?: string;
  enum?: string[];
  options?: string[];
  fields?: SimpleField[];
}

@Component({
  selector: 'app-dynamic-forms',
  templateUrl: './dynamic-forms.component.html',
  styleUrls: ['./dynamic-forms.component.scss'],
})
export class DynamicFormsComponent {
  @Input() sections: any = {};
  @Input() formData: any = {};
  @Input() type: any = 'general';
  @Input() sourceType: any = 'general';
  @Input() jsonSchema;
  @Input() templateSchemaValue;
  @Output() formDataEmit = new EventEmitter();
  @Output() fieldDataEmit = new EventEmitter<any>();
  lastOpenedIndexMap: { [key: string]: number } = {};
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

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    console.log('templateSchemaValue', this.templateSchemaValue);
    if (this.type == 'general') {
      this.sections = this.extractFieldsBySection(this.jsonSchema);
      console.log('sections1:', this.sections);

      this.formData = this.generateFormData(this.sections);
      if (this.templateSchemaValue) {
        this.formData = this.mergeFormData(
          this.templateSchemaValue,
          this.formData,
          this.jsonSchema
        );
        console.log('sections123:', this.formData);
        this.formDataEmit.emit(this.formData);
      }
    }
  }
  

  mergeFormData(templateSchemaValue: any, formData: any, schema: any): any {
    for (const key in templateSchemaValue) {
      if (!templateSchemaValue.hasOwnProperty(key)) continue;
      const value = templateSchemaValue[key];
      const fieldSchema =
        schema?.properties?.[key] ||
        schema?.fields?.find((f: any) => f.key === key);
      if (
          fieldSchema?.inputType === 'date' &&
          typeof value === 'string' &&
          !isNaN(Date.parse(value))
      ) {
        formData[key] = new Date(value);
      } else {
        formData[key] = value;
      }
    }

    return formData;
  }

  generateFormData(schema: any[]): any {
    const formData: any = {};

    schema.forEach((field) => {
      const key = field.sectionKey;

      if (field.type === 'object') {
        formData[key] = this.generateFormData(field.fields || []);
      } else if (field.type === 'array') {
        const itemFields = field.fields || [];
        const item = this.generateFormData(itemFields);
        formData[key] = [];
      } else if (field.type === 'string') {
        formData[key] = field.default || '';
      } else if (field.type === 'number') {
        formData[key] = field.default ?? null;
      } else {
        formData[key] = field.default ?? null;
      }
    });

    return formData;
  }

  closeCurrentAccordion(section: any, index: number) {
    this.lastOpenedIndexMap[section.sectionKey] = null;
  }

  extractFieldsBySection(schema: any): SimpleField[] {
    const simplifiedFields: SimpleField[] = [];

    if (schema.type && schema.type !== 'object') {
      return [
        {
          sectionKey: 'root',
          title: schema.title || '',
          type: schema.type,
          inputType: schema.inputType,
          itemType: schema.itemType,
          default: schema.default,
          required: schema.required || false,
          description: schema.description || '',
          placeholder: schema.placeholder || '',
          ...(schema.enum ? { enum: schema.enum } : {}),
          ...(schema.options ? { options: schema.options } : {}),
          ...(schema.minimum ? { minimum: schema.minimum } : {}),
          ...(schema.maximum ? { maximum: schema.maximum } : {}),
          ...(schema.maxLength ? { maxLength: schema.maxLength } : {}),
        },
      ];
    }

    if (schema.type === 'object' && schema.properties) {
      // **Step 1**: Store properties in an ordered array
      const orderedProps = Object.keys(schema.properties).map((key) => ({
        key,
        value: schema.properties[key],
      }));

      // **Step 2**: Iterate over the ordered array
      for (const { key, value } of orderedProps) {
        const simpleField: SimpleField = {
          sectionKey: key,
          title: value.title || '',
          type: value.type,
          inputType: value.inputType,
          itemType: value.itemType,
          default: value.default,
          required: schema.required ? schema.required.includes(key) : false,
          description: value.description || '',
          placeholder: value.placeholder || '',
          ...(value.enum ? { enum: value.enum } : {}),
          ...(value.options ? { options: value.options } : {}),
          ...(value.minimum ? { minimum: value.minimum } : {}),
          ...(value.maximum ? { maximum: value.maximum } : {}),
          ...(value.maxLength ? { maxLength: value.maxLength } : {}),
        };

        // Handle nested objects
        if (value.type === 'object') {
          simpleField.fields = this.extractFieldsBySection(value);
        } else if (value.type === 'array' && value.items) {
          const arrayItems = value.items;

          if (arrayItems.type === 'object') {
            simpleField.fields = this.extractFieldsBySection(arrayItems);
          } else {
            simpleField.fields = [
              {
                sectionKey: key,
                title: arrayItems.title || key,
                type: arrayItems.type,
                inputType: arrayItems.inputType,
                itemType: arrayItems.itemType,
                default: arrayItems.default,
                enum: arrayItems.enum,
                options: arrayItems.options,
                placeholder: arrayItems.placeholder,
                required: schema.required
                  ? schema.required.includes(key)
                  : false,
                description: arrayItems.description || undefined,
              },
            ];
          }
        }

        simplifiedFields.push(simpleField);
      }
    }
    return simplifiedFields;
  }

  addArrayItem(section: any): void {
    const key = section.sectionKey;
    if (!this.formData[key]) {
      this.formData[key] = [];
    }

    const newItem = {};
    section.fields.forEach((field) => {
      newItem[field.sectionKey || field.key] = field.default || '';
    });

    this.formData[key].push(newItem);
    this.lastOpenedIndexMap[key] = this.formData[key].length - 1;
    this.formDataEmit.emit(this.formData);
  }

  deleteArrayItem(section: any, index: number): void {
    // let deleteArrayItemRef = this.dialog.open(ConfirmBoxComponent, {
    //   width: '50%',
    //   panelClass: [
    //     'popup-class',
    //     'commonpopupmainclass',
    //     'confirmationmainclass',
    //   ],
    //   disableClose: true,
    //   data: {
    //     message: "Are you sure you want to delete this data ?"
    //   },
    // });
    // deleteArrayItemRef.afterClosed().subscribe((result) => {
    //   if (result) {
    const key = section.sectionKey;
    if (this.formData[key]) {
      this.formData[key].splice(index, 1);
    }
    this.formDataEmit.emit(this.formData);
    //   }
    // });
  }

  emittedFieldData(event) {
    // this.formData = event;
    console.log('this.formData', event, this.formData);
    this.fieldDataEmit.emit(event);
    this.formDataEmit.emit(this.formData);
  }

  formatDateTime(date: Date, type: 'date' | 'time' | 'dateTime'): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    switch (type) {
      case 'date':
        return `${day}/${month}/${year}`;
      case 'time':
        return `${hours}:${minutes}`;
      case 'dateTime':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      default:
        return '';
    }
  }

  deformatDateTime(
    value: string,
    type: 'date' | 'time' | 'dateTime'
  ): Date | null {
    let date = new Date(); // Start with current date as default base

    switch (type) {
      case 'date': {
        // Assuming date is in the format 'dd/MM/yy'
        const [day, month, year] = value.split('/');
        if (day && month && year) {
          const fullYear = parseInt(year.length === 2 ? `20${year}` : year, 10); // Handle two-digit years
          date = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
        } else {
          return null; // Invalid format
        }
        break;
      }
      case 'time': {
        // Assuming time is in the format 'HH:mm'
        const [hours, minutes] = value.split(':');
        if (hours && minutes) {
          date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        } else {
          return null; // Invalid format
        }
        break;
      }
      case 'dateTime': {
        // Assuming datetime is in the format 'dd/MM/yy HH:mm'
        const [datePart, timePart] = value.split(' ');
        if (datePart && timePart) {
          const [day, month, year] = datePart.split('/');
          const [hours, minutes] = timePart.split(':');
          const fullYear = parseInt(year.length === 2 ? `20${year}` : year, 10); // Handle two-digit years
          date = new Date(
            fullYear,
            parseInt(month, 10) - 1,
            parseInt(day, 10),
            parseInt(hours, 10),
            parseInt(minutes, 10)
          );
        } else {
          return null; // Invalid format
        }
        break;
      }
      default:
        return null;
    }

    return date;
  }

  sectionKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  submitForm() {}

  getFieldOptions(field) {
    let options =
      field?.inputType == 'state'
        ? dynamicFormConstants.INDIAN_STATES_LIST
        : field?.inputType == 'country'
        ? dynamicFormConstants.COUNTRIES_LIST
        : field.options;
    return options || [];
  }

  onPhoneNumberChange(event, section, field) {
    this.formData[section.sectionKey][field.sectionKey] = event?.e164Number
      ? event.e164Number
      : '';
  }
}
