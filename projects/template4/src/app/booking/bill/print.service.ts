import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  /**
     * To Print Receipt
     */
  print(booking: any) {
    console.log(booking)
    const params = [
      'height=' + screen.height,
      'width=' + screen.width,
      'fullscreen=yes'
    ].join(',');
    const printWindow = window.open('', '', params);
    let bill_html = '';
    bill_html += '<table width="100%">';
    bill_html += '<tr><td	style="text-align:center;font-weight:bold; color:#000000; font-size:11pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:10px;">' + booking['info'].providerAccount['businessName'] + '</td></tr>';
    if (booking['location']) {
      bill_html += '	<tr>';
      bill_html += '<td style="color:#000000; text-align:center;font-size:10pt; font-family:"Ubuntu, Arial,sans-serif; text-transform: capitalize !important;">' + booking['location'] + '</td>';
      bill_html += '	</tr>';
    }
    bill_html += '<div style="margin-right:10px!important;"><img src="' + booking?.account?.logo + '" width="80px" style="border-radius:50%!important"></div>';
    bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
    bill_html += '<table width="100%">';
    bill_html += '	<tr style="line-height:20px">';
    bill_html += '<td width="50%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif;">' + (booking['bookingFor'][0]?.title ? (booking['bookingFor'][0]?.title + ' ') : '') + (booking['bookingFor'][0]?.firstName ? booking['bookingFor'][0]?.firstName : '') + ' ' + (booking['bookingFor'][0]?.lastName ? booking['bookingFor'][0]?.lastName : '') + '</td>';
    bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + (booking['isInvoice'] ? 'Invoice Date :' : '') + booking['invoiceExtras']['_billDate'];
    bill_html += '	</td>';
    bill_html += '	</tr>';
    bill_html += '	<tr style="line-height:20px">';
    bill_html += '<td width="50%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif;">' + (booking['isInvoice'] ? 'Invoice # :' : '') +
    booking['invoiceExtras']['invoiceNum'] + '</td>';
    bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + (booking['invoiceExtras']['departmentName'] ? 'Department :' : '') + booking['invoiceExtras']['departmentName'];
    bill_html += '	</td>';
    bill_html += '	</tr>';


    bill_html += '	<tr style="line-height:20px">';
    bill_html += '<td width="50%"	style="text-align:left;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">';
    if (booking['invoiceExtras']['gstNumber']) {
      bill_html += 'GSTIN ' + booking['invoiceExtras']['gstNumber'];
    }
    bill_html += '</td>';
    bill_html += '<td width="50%" style="text-align:right;color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">';
    if (booking['invoiceExtras']['providerName']) {
      bill_html += booking['providerLabel'] + ':' + booking['invoiceExtras']['providerName'];
    }
    bill_html += '</td>';
    bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">';
    if (booking['invoiceExtras']['_dueDate']) {
      bill_html += 'Due Date :' + booking['invoiceExtras']['_dueDate'];
    }
    bill_html += '	</td>';
    bill_html += '	</tr>';
    bill_html += '	<tr>';
    if (booking['isInvoice'] && booking['invoice'].billStatus && booking['invoice'].billStatus == 'Cancel') {
      bill_html += '<td style="color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' +
        'Cancelled'
        + '</td>';
    }
    bill_html += '	</tr>';
    bill_html += '	<tr>';
    if (booking['isInvoice'] && booking['invoice'].billStatus && booking['invoice'].billStatus == 'Settled') {
      bill_html += '<td style="color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' +
        'Settled'
        + '</td>';
    }
    bill_html += '	</tr>';
    bill_html += '</table>';
    bill_html += '	</td></tr>';
    bill_html += '<tr><td style="border-bottom:1px solid #ddd;">';
    bill_html += '<table width="100%"';
    bill_html += '	style="color:#000000; font-size:10pt; line-height:15px; font-family:Ubuntu, Arial,sans-serif; padding-top:5px;padding-bottom:5px">';
    bill_html += '	<tr>';
    bill_html += '<td width="40%" style="text-align:right; font-weight:600 !important;">' + 'Service';
    bill_html += '</td>';
    bill_html += '<td width="15%" style="text-align:right; font-weight:600 !important;">' + 'Rate';
    bill_html += '</td>';
    bill_html += '<td width="15%" style="text-align:right; font-weight:600 !important;">' + 'Quantity' + '</td>';
    bill_html += '<td width="30%" style="text-align:right; font-weight:600 !important;">' + 'Price' + '</td>';
    bill_html += '	</tr>';
    bill_html += '</table>';
    bill_html += '	</td></tr>';
    if (booking['invoiceExtras']['services']) {
      for (const service of booking['invoiceExtras']['services']) {
        bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
        bill_html += '<table width="100%"';
        bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
        bill_html += '	<tr >';
        bill_html += '<td width="40%"';
        bill_html += '	style="text-align:right;font-weight:bold;">';
        bill_html += service.serviceName;
        if (service.getGSTpercentage > 0) {
          bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
        }
        bill_html += '</td>';
        bill_html += '<td width="15%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(service.price).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="15%"';
        bill_html += '	style="text-align:right">' + service.quantity;
        bill_html += '</td>';
        bill_html += '<td width="30%"';
        bill_html += '	style="text-align:right">&#x20b9;' + (service.quantity * service.price).toFixed(2) + '</td>';
        bill_html += '	</tr>';
        if (service.discount && service.discount.length > 0) {
          for (const serviceDiscount of service.discount) {
            bill_html += '	<tr style="color:#aaa">';
            bill_html += '<td style="text-align:right;"';
            bill_html += '	colspan="2">' + serviceDiscount.name + '</td>';
            bill_html += '<td style="text-align:right">(-) &#x20b9;' + parseFloat(serviceDiscount.discountValue).toFixed(2);
            bill_html += '</td>';
            bill_html += '	</tr>';
          }

          bill_html += '	<tr style="line-height:0;">';
          bill_html += '<td style="text-align:right" colspan="2"></td>';
          bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd">Â </td>';
          bill_html += '	</tr>';
          bill_html += '	<tr style="font-weight:bold">';
          bill_html += '<td style="text-align:right"colspan="2">Sub Total</td>';
          bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(service.netRate).toFixed(2) + '</td>';
          bill_html += '	</tr>';
        }
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if (booking['invoiceExtras']['items']) {
      for (const item of booking['invoiceExtras']['items']) {
        bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
        bill_html += '<table width="100%"';
        bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
        bill_html += '	<tr>';
        bill_html += '<td width="50%" style="text-align:left;font-weight:bold;">' + item.itemName + ' @ &#x20b9;' + parseFloat(item.price).toFixed(2);
        if (item.GSTpercentage > 0) {
          bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
        }
        bill_html += '</td>';
        bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + (item.quantity * item.price).toFixed(2) + '</td>';
        bill_html += '	</tr>';
        if (item.discount && item.discount.length > 0) {
          for (const itemDiscount of item.discount) {
            bill_html += '	<tr style="color:#aaa">';
            bill_html += '<td style="text-align:right" colspan="2">' + itemDiscount.name + '</td>';
            bill_html += '<td style="text-align:right">(-) &#x20b9;' + parseFloat(itemDiscount.discountValue).toFixed(2) + '</td>';
            bill_html += '	</tr>';
          }
        }
        if (item.discount && item.discount.length > 0) {
          bill_html += '	<tr style="line-height:0;">';
          bill_html += '<td style="text-align:right" colspan="2"></td>';
          bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd">Â </td>';
          bill_html += '	</tr>';
          bill_html += '	<tr style="font-weight:bold">';
          bill_html += '<td style="text-align:right" colspan="2">Sub Total</td>';
          bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2) + '</td>';
          bill_html += '	</tr>';
        }
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if(booking['invoice']?.adhocItemList){
 for (const item of booking['invoice'].adhocItemList) {
      bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
      bill_html += '<table width="100%"';
      bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
      bill_html += '	<tr>';
      bill_html += '<td width="50%" style="text-align:left;font-weight:bold;">' + item.itemName + ' @ &#x20b9;' + parseFloat(item.price).toFixed(2);
      if (item.GSTpercentage > 0) {
        bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
      }
      bill_html += '</td>';
      bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
      bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + (item.quantity * item.price).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    }

    bill_html += '	<tr><td>';
    bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:5px">                                                                             ';
    bill_html += '	<tr style="font-weight: bold">';
    bill_html += '<td width="70%" style="text-align:right">Gross Amount</td>';
    bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoice'].netTotal).toFixed(2) + '</td>';
    bill_html += '	</tr>                                                                           ';
    bill_html += '</table>';
    bill_html += '	</td></tr>';
    if (booking['invoiceExtras']['discounts']) {
      for (const billDiscount of booking['invoiceExtras']['discounts']) {
        bill_html += '	<tr><td>';
        bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
        bill_html += '	<tr style="color:#aaa">';
        bill_html += '<td width="70%" style="text-align:right">' + billDiscount.name + '</td>';
        bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(billDiscount.discValue).toFixed(2) + '</td>';
        bill_html += '	</tr>';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if (booking['invoiceExtras']['coupons']) {
      for (const coupon of booking['invoiceExtras']['coupons']) {
        bill_html += '	<tr><td>';
        bill_html += '<table width="100%" style="color:#000000; font-size:10pt;  font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
        bill_html += '	<tr style="color:#aaa">';
        bill_html += '<td width="70%" style="text-align:right">' + coupon.couponCode + '</td>';
        bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(coupon.discount).toFixed(2) + '</td>';
        bill_html += '	</tr>                                                                           ';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if (booking['invoice'].taxableTotal !== 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr>';
      bill_html += '<td width="70%" style="text-align:right">Tax ' + booking['invoice'].taxPercentage + ' % of &#x20b9;' + parseFloat(booking['invoice'].taxableTotal).toFixed(2) + '(CGST-' + (booking['invoice'].taxPercentage / 2) + '%, SGST-' + (booking['invoice'].taxPercentage / 2) + '%)</td>';
      bill_html += '<td width="30%" style="text-align:right">(+) &#x20b9;' + parseFloat(booking['invoiceExtras']['netTaxAmount']).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    if (booking['invoice'].netRate > 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr style="font-weight: bold;">';
      bill_html += '<td width="70%" style="text-align:right">Net Total</td>';
      bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoice'].netRate).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    if (booking['invoice'].customerPaidCharges > 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr style="">';
      bill_html += '<td width="70%" style="text-align:right">Processing Fee</td>';
      bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(booking['invoice'].customerPaidCharges).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    if (booking['invoiceExtras']['amountPaid'] > 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr style="font-weight: bold;">';
      bill_html += '<td width="70%" style="text-align:right">Amount Paid</td>';
      bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoiceExtras']['amountPaid']).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    if (booking['invoice'].amountDue >= 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%"';
      bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr style="font-weight: bold;"> ';
      bill_html += '<td width="70%" style="text-align:right">Amount Due</td>';
      bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoice'].amountDue).toFixed(2) + '</td>';
      bill_html += '	</tr>                                                                           ';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    if (booking['invoice'].amountDue < 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%"';
      bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr style="font-weight: bold;"> ';
      bill_html += '<td width="70%" style="text-align:right">Refundable Amount</td>';
      bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoiceExtras']['refundAmount']).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    if (booking['invoice'].refundedAmount > 0) {
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%"';
      bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
      bill_html += '	<tr style="font-weight: bold;"> ';
      bill_html += '<td width="70%" style="text-align:right">Amount refunded</td>';
      bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoice'].refundedAmount).toFixed(2) + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }
    bill_html += '</table>';
    printWindow.document.write('<html><head><title></title>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(bill_html);
    printWindow.document.write('</body></html>');
    printWindow.moveTo(0, 0);
    printWindow.document.close();
    printWindow.print();
    if (!booking['isDesktop']) {
      printWindow.addEventListener('click', () => {
        printWindow.close();
      });
    } else {
      printWindow.close();
    }
  }
}
