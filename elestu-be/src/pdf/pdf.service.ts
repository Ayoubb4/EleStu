// src/pdf/pdf.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { join } from 'path';
// --- AÑADIDO: Importamos Buffer explícitamente para asegurar la conversión ---
import { Buffer } from 'buffer';

@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);

    async generateInvoicePdf(data: any): Promise<Buffer> {
        try {
            const templatePath = join(process.cwd(), 'src', 'templates', 'invoice.hbs');
            const templateHtml = await fs.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateHtml);
            const html = template(data);

            this.logger.log('Lanzando Puppeteer para generar el PDF...');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            await browser.close();
            this.logger.log('PDF generado con éxito.');

            // --- AÑADIDO: Conversión explícita a Buffer para evitar el error de tipos ---
            const finalBuffer = Buffer.from(pdfBuffer);
            this.logger.log(`Buffer del PDF convertido correctamente, tamaño: ${finalBuffer.length} bytes.`);
            return finalBuffer;

        } catch (error) {
            this.logger.error('Error al generar el PDF de la factura:', error);
            throw new Error('Could not generate PDF invoice.');
        }
    }
}