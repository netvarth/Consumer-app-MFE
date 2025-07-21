import { Component, HostListener } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { OrderService } from '../../services/order.service';


@Component({
  selector: 'app-order-templates',
  templateUrl: './order-templates.component.html',
  styleUrls: ['./order-templates.component.scss']
})
export class OrderTemplatesComponent {
  templateId: any;
  templateFormData: any;
  itemTemplateData: any = {};
  templateLoading = true;
  memberTypeDatas: any;
  templateDataSchema: any;
  savedTemplateData: any;
  globalError: any;
  quadrants = [
    {
      name: 'LT',
      items: [
        { label: '8', value: 'lt8' },
        { label: '7', value: 'lt7' },
        { label: '6', value: 'lt6' },
        { label: '5', value: 'lt5' },
        { label: '4', value: 'lt4' },
        { label: '3', value: 'lt3' },
        { label: '2', value: 'lt2' },
        { label: '1', value: 'lt1' },
      ],
    },
    {
      name: 'RT',
      items: [
        { label: '1', value: 'rt1' },
        { label: '2', value: 'rt2' },
        { label: '3', value: 'rt3' },
        { label: '4', value: 'rt4' },
        { label: '5', value: 'rt5' },
        { label: '6', value: 'rt6' },
        { label: '7', value: 'rt7' },
        { label: '8', value: 'rt8' },
      ],
    },
    {
      name: 'LB',
      items: [
        { label: '8', value: 'lb8' },
        { label: '7', value: 'lb7' },
        { label: '6', value: 'lb6' },
        { label: '5', value: 'lb5' },
        { label: '4', value: 'lb4' },
        { label: '3', value: 'lb3' },
        { label: '2', value: 'lb2' },
        { label: '1', value: 'lb1' },
      ],
    },
    {
      name: 'RB',
      items: [
        { label: '1', value: 'rb1' },
        { label: '2', value: 'rb2' },
        { label: '3', value: 'rb3' },
        { label: '4', value: 'rb4' },
        { label: '5', value: 'rb5' },
        { label: '6', value: 'rb6' },
        { label: '7', value: 'rb7' },
        { label: '8', value: 'rb8' },
      ],
    },
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

  templateSchemaValue: any;

  constructor(
    private dialogRef: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private orderService: OrderService,
    private snackbarService: SnackbarService
  ) {
    this.onResize();
    console.log('this.config?.data', this.config?.data);
    if (this.config?.data?.templateId) {
      this.templateLoading = true;
      this.templateId = this.config.data.templateId;
      this.templateSchemaValue = this.config.data.templateSchemaValue || '';
      this.orderService.getOrderItemTemplate(this.templateId).subscribe(
        (templateData: any) => {
          this.itemTemplateData = templateData;
          this.templateLoading = false;
          console.log('templateData', this.itemTemplateData.templateSchema);
        },
        (error) => { }
      );
    }
    if (this.config?.data?.templateData) {
      console.log('templateData1111', this.config.data.templateData);
      this.templateDataSchema = this.config?.data?.templateData[0]
        ? this.config?.data?.templateData[0]
        : this.config?.data?.templateData;
      console.log('this.savedTemplateData1', this.templateDataSchema);

      this.templateDataSchema?.templateSchemaValue &&
        this.templateDataSchema?.templateSchema
        ? (this.savedTemplateData = this.extractTitlesAndValues(
          this.templateDataSchema?.templateSchema,
          this.templateDataSchema?.templateSchemaValue
        ))
        : '';
      console.log('this.savedTemplateData', this.savedTemplateData);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 576) {
      this.config.width = '100%';
    } else {
    }
  }
  getTemplateFormData(event) {
    console.log('passData0', event);
    console.log('passData0', this.cleanObject(event));
    this.templateFormData = this.cleanObject(event);
    console.log('this.templateFormData', this.templateFormData);
  }
  cleanObject(obj) {
    const result = Array.isArray(obj) ? [] : {};

    Object.keys(obj).forEach((key) => {
      const value = obj[key];

      if (typeof value === 'object' && value !== null) {
        if (value instanceof Date) {
          result[key] = value;
        } else {
          const cleanedValue = this.cleanObject(value);
          if (Array.isArray(cleanedValue)) {
            if (cleanedValue.length > 0) {
              result[key] = cleanedValue;
            }
          } else if (Object.keys(cleanedValue).length > 0) {
            result[key] = cleanedValue;
          }
        }
      } else if (
        value !== '' &&
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        result[key] = value;
      }
    });
    return result;
  }

  selectionDone() {
    // if (this.templateFormData) {
    let passData = {
      templateSchemaValue: this.templateFormData ? this.templateFormData : {},
      templateSchema: this.itemTemplateData.templateSchema,
    };
    console.log('passData', passData);
    this.orderService.validateSchema(passData).subscribe(
      (data) => {
        if (data) {
          this.dialogRef.close(passData);
        }
      },
      (error) => {
        this.setGlobalError(error.error);
      }
    );
    // }
  }

  setGlobalError(errorMsg) {
    this.globalError = errorMsg;
    setTimeout(() => {
      this.globalError = '';
    }, 5000);
  }
  close() {
    this.dialogRef.close();
  }
  formatValue(value, type): string {
    if (type == 'date' || type == 'time' || type == 'dateTime') {
      value = new Date(value);
      const day = ('0' + value.getDate()).slice(-2);
      const month = ('0' + (value.getMonth() + 1)).slice(-2);
      const year = value.getFullYear().toString().slice(-2);
      const hours = ('0' + value.getHours()).slice(-2);
      const minutes = ('0' + value.getMinutes()).slice(-2);

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
    if (typeof value === 'string') {
      return value
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (str) => str.toUpperCase());
    }
    return value;
  }
  extractTitlesAndValues(schema: any, schemaValue: any): any {
    const result: any = {};

    for (const key in schema.properties) {
      const fieldSchema = schema.properties[key];
      const fieldValue = schemaValue ? schemaValue[key] : null;

      if (fieldSchema.type === 'object') {
        result[key] = {
          type: 'object',
          title: fieldSchema.title,
          description: fieldSchema.description || '',
          fields: [],
        };

        for (const subKey in fieldSchema.properties) {
          const subFieldSchema = fieldSchema.properties[subKey];
          const subFieldValue = fieldValue ? fieldValue[subKey] : null;

          if (subFieldSchema.type === 'object') {
            const nested = this.extractTitlesAndValues(
              subFieldSchema,
              subFieldValue || {}
            );
            result[key].fields.push({
              type: 'object',
              inputType: subFieldSchema.inputType,
              itemType: subFieldSchema.itemType,
              title: subFieldSchema.title,
              value: nested,
            });
          } else if (subFieldSchema.type === 'array') {
            const arrayValues = (subFieldValue || []).map((item: any) => {
              if (subFieldSchema.items.type === 'object') {
                return this.extractTitlesAndValues(subFieldSchema.items, item);
              }
              return item;
            });

            result[key].fields.push({
              type: 'array',
              inputType: subFieldSchema.inputType,
              itemType: subFieldSchema.items.type,
              title: subFieldSchema.title,
              value: arrayValues,
            });
          } else {
            result[key].fields.push({
              type: subFieldSchema.type,
              inputType: subFieldSchema.inputType,
              itemType: subFieldSchema.itemType,
              title: subFieldSchema.title,
              value: subFieldValue || '',
            });
          }
        }
      } else if (fieldSchema.type === 'array') {
        const arrayValues = (fieldValue || []).map((item: any) => {
          if (fieldSchema.items.type === 'object') {
            return this.extractTitlesAndValues(fieldSchema.items, item);
          }
          return item;
        });

        result[key] = {
          type: 'array',
          title: fieldSchema.title,
          inputType: fieldSchema.inputType,
          itemType: fieldSchema.items.type,
          value: arrayValues,
        };
      } else {
        result[key] = {
          type: fieldSchema.type,
          title: fieldSchema.title,
          inputType: fieldSchema.inputType,
          itemType: fieldSchema.itemType,
          value: fieldValue,
        };
      }
    }

    return result;
  }

  isArray(data: any): boolean {
    return Array.isArray(data);
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
