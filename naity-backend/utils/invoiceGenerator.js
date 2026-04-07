const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

/**
 * Generate booking invoice PDF with QR code
 * @param {Object} bookingData - Booking information
 * @param {string} outputPath - Path to save PDF
 * @returns {Promise<string>} - Path to generated PDF
 */
async function generateInvoicePDF(bookingData, outputPath) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 40,
        info: {
          Title: `Naity Booking Receipt - ${bookingData.booking_reference}`,
          Author: 'Naity',
          Subject: 'Booking Receipt'
        }
      });

      // Pipe to file
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Generate QR code
      const qrCodeUrl = `${process.env.FRONTEND_URL || 'https://naity.net'}/my-bookings?ref=${bookingData.id}`;
      const qrCodeDataURL = await QRCode.toDataURL(qrCodeUrl, { width: 150, margin: 1 });
      const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

      // Colors
      const primaryColor = '#1a56db';
      const darkColor = '#1e293b';
      const lightGray = '#f1f5f9';
      const greenColor = '#16a34a';
      const orangeColor = '#ea580c';
      const blueLight = '#dbeafe';

      // Header - Dark background with Naity logo
      doc.rect(0, 0, 595, 80).fill(darkColor);
      
      doc.fontSize(32)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text('Naity', 40, 25);
      
      doc.fontSize(10)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text('Hotel Booking Platform', 40, 60);

      doc.fontSize(16)
         .fillColor('#ffffff')
         .font('Helvetica-Bold')
         .text('BOOKING RECEIPT', 400, 30, { align: 'right', width: 155 });

      // Status Badge - CONFIRMED
      doc.rect(40, 100, 515, 35).fill(greenColor).opacity(0.1);
      doc.opacity(1);
      doc.fontSize(14)
         .fillColor(greenColor)
         .font('Helvetica-Bold')
         .text('■ CONFIRMED / مؤكد', 0, 110, { align: 'center', width: 595 });

      // Booking Reference
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Booking Reference / رقم الحجز', 40, 155);
      
      doc.fontSize(16)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.booking_reference, 400, 150, { align: 'right', width: 155 });

      let yPos = 195;

      // Guest Information Box
      doc.rect(40, yPos, 250, 120).fill(blueLight).opacity(0.3);
      doc.opacity(1);
      
      doc.fontSize(12)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('GUEST INFORMATION / معلومات الضيف', 50, yPos + 10);

      doc.fontSize(14)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.guest_name, 50, yPos + 35);

      doc.fontSize(10)
         .fillColor('#475569')
         .font('Helvetica')
         .text(bookingData.guest_email, 50, yPos + 55);

      doc.text(`Nationality: ${bookingData.nationality || 'N/A'}`, 50, yPos + 75);
      
      const guestsText = `Guests: ${bookingData.guests_count} adult${bookingData.guests_count > 1 ? 's' : ''}${bookingData.children_count > 0 ? ` + ${bookingData.children_count} child${bookingData.children_count > 1 ? 'ren' : ''}` : ''}`;
      doc.text(guestsText, 50, yPos + 95);

      // Hotel Information Box
      doc.rect(305, yPos, 250, 120).fill(blueLight).opacity(0.3);
      doc.opacity(1);
      
      doc.fontSize(12)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('HOTEL INFORMATION / معلومات الفندق', 315, yPos + 10);

      doc.fontSize(14)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.hotel_name, 315, yPos + 35, { width: 230 });

      doc.fontSize(10)
         .fillColor('#475569')
         .font('Helvetica')
         .text(bookingData.hotel_city, 315, yPos + 60);

      if (bookingData.hotel_phone) {
        doc.text(bookingData.hotel_phone, 315, yPos + 80);
      }

      if (bookingData.hotel_email) {
        doc.text(bookingData.hotel_email, 315, yPos + 100);
      }

      yPos += 145;

      // Stay Details Box
      doc.rect(40, yPos, 515, 100).fill(lightGray);
      
      doc.fontSize(12)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('STAY DETAILS / تفاصيل الإقامة', 50, yPos + 10);

      // Room info
      doc.fontSize(9)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Room / الغرفة', 50, yPos + 35);
      
      doc.fontSize(11)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.room_name, 50, yPos + 50, { width: 150 });

      // Nights
      doc.fontSize(9)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Nights / الليالي', 350, yPos + 35);
      
      doc.fontSize(11)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.nights.toString(), 350, yPos + 50);

      // Check-in
      doc.fontSize(9)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Check-in / الوصول', 50, yPos + 70);
      
      doc.fontSize(11)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.check_in_formatted, 50, yPos + 85);

      // Check-out
      doc.fontSize(9)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Check-out / المغادرة', 220, yPos + 70);
      
      doc.fontSize(11)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.check_out_formatted, 220, yPos + 85);

      // Breakfast
      doc.fontSize(9)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Breakfast / الفطور', 390, yPos + 70);
      
      doc.fontSize(11)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(bookingData.breakfast_included ? '■ Included / مشمول' : '□ Not Included', 390, yPos + 85);

      // Payment Date
      if (bookingData.payment_date) {
        doc.fontSize(9)
           .fillColor('#64748b')
           .font('Helvetica')
           .text('Payment Date', 450, yPos + 35);
        
        doc.fontSize(11)
           .fillColor(darkColor)
           .font('Helvetica-Bold')
           .text(bookingData.payment_date, 450, yPos + 50);
      }

      yPos += 125;

      // Payment Summary
      doc.fontSize(12)
         .fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('PAYMENT SUMMARY / ملخص الدفع', 40, yPos);

      yPos += 25;

      // Room price
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Room price / سعر الغرفة', 40, yPos);
      
      doc.fontSize(11)
         .fillColor(darkColor)
         .font('Helvetica')
         .text(`$${bookingData.price_per_night} x ${bookingData.nights} nights`, 400, yPos, { align: 'right', width: 155 });

      yPos += 25;

      // Total
      doc.fontSize(10)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Total / المجموع', 40, yPos);
      
      doc.fontSize(14)
         .fillColor(darkColor)
         .font('Helvetica-Bold')
         .text(`$${bookingData.total_price}`, 400, yPos, { align: 'right', width: 155 });

      yPos += 30;

      // Deposit PAID
      doc.rect(40, yPos, 515, 25).fill(greenColor).opacity(0.1);
      doc.opacity(1);
      
      doc.fontSize(11)
         .fillColor(greenColor)
         .font('Helvetica-Bold')
         .text('Deposit PAID online / العربون المدفوع', 50, yPos + 7);
      
      doc.text(`$${bookingData.deposit_amount}`, 400, yPos + 7, { align: 'right', width: 145 });

      yPos += 30;

      // Balance DUE
      doc.rect(40, yPos, 515, 25).fill(orangeColor).opacity(0.1);
      doc.opacity(1);
      
      doc.fontSize(11)
         .fillColor(orangeColor)
         .font('Helvetica-Bold')
         .text('Balance DUE at hotel (cash) / المبلغ المتبقي', 50, yPos + 7);
      
      doc.text(`$${bookingData.balance_due}`, 400, yPos + 7, { align: 'right', width: 145 });

      yPos += 40;

      // Important Notice
      doc.rect(40, yPos, 515, 60).fill('#fef3c7');
      
      doc.fontSize(10)
         .fillColor('#92400e')
         .font('Helvetica-Bold')
         .text('■■ Important at Check-in / مهم عند الوصول:', 50, yPos + 10);

      doc.fontSize(9)
         .fillColor('#78350f')
         .font('Helvetica')
         .text(`Please present this receipt and pay the remaining balance of $${bookingData.balance_due} USD in cash at hotel reception.`, 50, yPos + 28, { width: 495 });

      yPos += 75;

      // Track booking link
      doc.rect(40, yPos, 515, 30).fill(blueLight).opacity(0.3);
      doc.opacity(1);
      
      doc.fontSize(10)
         .fillColor(primaryColor)
         .font('Helvetica')
         .text('Track your booking at: ', 50, yPos + 10);
      
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .text('naity.net/my-bookings', 170, yPos + 10);

      // QR Code
      doc.image(qrCodeBuffer, 480, yPos - 80, { width: 70, height: 70 });
      
      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Scan to view', 485, yPos + 5, { width: 60, align: 'center' });

      // Footer
      doc.fontSize(8)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text(`© ${new Date().getFullYear()} Naity — naity.net | support@naity.net | All rights reserved`, 0, 780, { 
           align: 'center', 
           width: 595 
         });

      // Finalize PDF
      doc.end();

      stream.on('finish', () => {
        resolve(outputPath);
      });

      stream.on('error', (err) => {
        reject(err);
      });

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = { generateInvoicePDF };
