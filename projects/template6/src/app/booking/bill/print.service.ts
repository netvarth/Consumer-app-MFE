import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {

  constructor() { }

  getGenerateBillHTML(booking: any) {
    let bill_html = '';
    bill_html += '<table width="100%">';
    bill_html += '<tr><td	style="text-align:center;font-weight:bold; color:#000000; font-size:11pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:10px;">' + booking['info'].providerAccount['businessName'] + '</td></tr>';
    if (booking['location']) {
      bill_html += '	<tr>';
      bill_html += '<td style="color:#000000; text-align:center;font-size:10pt; font-family:"Ubuntu, Arial,sans-serif; text-transform: capitalize !important;">' + booking['location'] + '</td>';
      bill_html += '	</tr>';
    }
    if (booking['invoiceExtras']['gstNumber']) {
      bill_html += '<td width="50%"	style="text-align:center;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">';
      bill_html += 'GSTIN ' + booking['invoiceExtras']['gstNumber'];
      bill_html += '</td>';
    }
    bill_html += '<div style="margin-right:10px!important;"><img src="' + booking?.account?.logo + '" width="80px" style="border-radius:50%!important"></div>';
    bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
    bill_html += '<table width="100%">';
    bill_html += '	<tr style="line-height:20px">';
    bill_html += '<td width="50%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif;">' + (booking['bookingFor'][0]?.title ? (booking['bookingFor'][0]?.title + ' ') : '') + (booking['bookingFor'][0]?.firstName ? booking['bookingFor'][0]?.firstName : '') + ' ' + (booking['bookingFor'][0]?.lastName ? booking['bookingFor'][0]?.lastName : '') + '</td>';
    bill_html += '	</tr>';
    bill_html += '	<tr style="line-height:20px">';
    if (booking['isInvoice']) {
      bill_html += '<td width="50%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif;">' + (booking['isInvoice'] ? 'Invoice # :' : '') +
        booking['invoiceExtras']['invoiceNum'] + '</td>';
    }

    bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + (booking['isInvoice'] ? 'Invoice Date :' : '') + booking['invoiceExtras']['_billDate'];
    bill_html += '	</td>';
    bill_html += '	</tr>';
    bill_html += '<tr style="line-height:20px">';
    if (booking['providerLabel'] && booking['invoiceExtras']['providerName']) {
      bill_html += '<td width="50%" style="text-align:left;color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">';
      bill_html += booking['providerLabel'] + ':' + booking['invoiceExtras']['providerName'];
      bill_html += '</td>';
    }
    if (booking['invoiceExtras']['_dueDate']) {
      bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">';
      bill_html += 'Due Date :' + booking['invoiceExtras']['_dueDate'];
      bill_html += '</td>';
    }
    bill_html += '</tr>';
    bill_html += '<tr>';
    bill_html += '<td width="50%" style="text-align:left; color:#000000; text-transform: capitalize; font-size:10pt; font-family:Ubuntu, Arial, sans-serif;">';
    if (booking['isInvoice'] && booking['invoice'].billStatus === 'Cancel') {
      bill_html += 'Cancelled';
    }
    bill_html += '</td>';
    if (booking['invoiceExtras']['departmentName']) {
      bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + (booking['invoiceExtras']['departmentName'] ? 'Department :' : '') + booking['invoiceExtras']['departmentName'];
    }
    bill_html += '</td>';
    bill_html += '</tr>';
    bill_html += '</table>';
    bill_html += '</td></tr>';
    if (booking && booking.invoiceID !== undefined && booking && booking.invoiceID !== null) {
      bill_html += '<tr><td style="border-bottom:1px solid #ddd;">';
      bill_html += '<table width="100%"';
      bill_html += '	style="color:#000000; font-size:10pt; line-height:15px; font-family:Ubuntu, Arial,sans-serif; padding-top:5px;padding-bottom:5px">';
      bill_html += '	<tr>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Service';
      bill_html += '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Rate';
      bill_html += '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Quantity' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Total Rate' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Discount' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'After Discount' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Tax' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Price' + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    } else {
      bill_html += '<tr><td style="border-bottom:1px solid #ddd;">';
      bill_html += '<table width="100%"';
      bill_html += '	style="color:#000000; font-size:10pt; line-height:15px; font-family:Ubuntu, Arial,sans-serif; padding-top:5px;padding-bottom:5px">';
      bill_html += '	<tr>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Service';
      bill_html += '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Rate';
      bill_html += '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Quantity' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Total Rate' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Tax' + '</td>';
      bill_html += '<td width="10%" style="text-align:right; font-weight:600 !important;">' + 'Price' + '</td>';
      bill_html += '	</tr>';
      bill_html += '</table>';
      bill_html += '	</td></tr>';
    }



    if (booking['invoiceExtras']['services']) {
      for (const service of booking['invoiceExtras']['services']) {
        bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
        bill_html += '<table width="100%"';
        bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
        bill_html += '	<tr >';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right;font-weight:bold;">';
        bill_html += service.serviceName;
        if (service.getGSTpercentage > 0) {
          bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
        }
        bill_html += '</td>';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(service.price).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + service.quantity;
        bill_html += '</td>';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(service.totalPrice).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(service.taxAmount).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(service.netRate).toFixed(2);
        bill_html += '</td>';
        bill_html += '	</tr>';
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
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(item.price).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(item.totalPrice).toFixed(2); + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(item.taxAmount).toFixed(2); + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2); + '</td>';
        bill_html += '	</tr>';

        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if (booking['invoice'].adhocItemList) {
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
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(item.price).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(item.totalPrice).toFixed(2); + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(item.taxAmount).toFixed(2); + '</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2); + '</td>';
        bill_html += '	</tr>';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if (booking['invoice'].detailList) {
      for (const item of booking['invoice'].detailList) {
        bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
        bill_html += '<table width="100%"';
        bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
        bill_html += '	<tr>';
        bill_html += '<td width="10%" style="text-align:left;font-weight:bold;">' + item.itemName;
        if (item.GSTpercentage > 0) {
          bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
        }
        bill_html += '</td>';
        bill_html += '<td width="10%"';
        bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(item.price).toFixed(2);
        bill_html += '</td>';
        bill_html += '<td width="10%" style="text-align:right">' + item.quantity + '</td>';
        bill_html += '<td width="10%" style="text-align:right">&#x20b9;' + parseFloat(item.netTotal).toFixed(2); + '</td>';
        bill_html += '<td width="10%" style="text-align:right">&#x20b9;' + parseFloat(item.discountTotal).toFixed(2); + '</td>';
        bill_html += '<td width="10%" style="text-align:right">&#x20b9;' + parseFloat(item.netTotalAfterDiscount).toFixed(2); + '</td>';
        bill_html += '<td width="10%" style="text-align:right">&#x20b9;' + parseFloat(item.taxTotal).toFixed(2); + '</td>';
        bill_html += '<td width="10%" style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2); + '</td>';
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
        bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(billDiscount.discountValue).toFixed(2) + '</td>';
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
    if (booking && booking.invoiceID !== undefined && booking && booking.invoiceID !== null) {
      if (booking['invoice'].totalTaxAmount > 0) {
        bill_html += '	<tr><td>';
        bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
        bill_html += '	<tr style="font-weight: bold;">';
        bill_html += '<td width="70%" style="text-align:right">Tax</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoice'].totalTaxAmount).toFixed(2) + '</td>';
        bill_html += '	</tr>';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    } else {
      if (booking['invoice'].taxTotal > 0) {
        bill_html += '	<tr><td>';
        bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
        bill_html += '	<tr style="font-weight: bold;">';
        bill_html += '<td width="70%" style="text-align:right">Tax</td>';
        bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(booking['invoice'].taxTotal).toFixed(2) + '</td>';
        bill_html += '	</tr>';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
      }
    }
    if (booking['invoice'].roundedValue != 0) {
      let roundedValue = parseFloat(booking['invoice'].roundedValue).toFixed(2);
      let formattedValue = booking['invoice'].roundedValue > 0 ? `₹+${roundedValue}` : `₹${roundedValue}`;
      bill_html += '	<tr><td>';
      bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial, sans-serif; padding-bottom:5px">';
      bill_html += '	<tr style="font-weight: bold;">';
      bill_html += '<td width="70%" style="text-align:right">Rounded Value</td>';
      bill_html += `<td width="30%" style="text-align:right; font-weight: bold;">${formattedValue}</td>`;
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
    return bill_html;
  }

  /**
     * To Print Receipt
     */
  print(booking: any) {
    console.log("booking", booking)
    const params = [
      'height=' + screen.height,
      'width=' + screen.width,
      'fullscreen=yes'
    ].join(',');
    const printWindow = window.open('', '', params);
    const bill_html = this.getGenerateBillHTML(booking);
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