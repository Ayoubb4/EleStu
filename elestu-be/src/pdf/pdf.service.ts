// src/pdf/pdf.service.ts
import { Injectable, Logger } from '@nestjs/common';
// --- MODIFICADO: Importamos 'Browser' y cambiamos la importación de puppeteer ---
import puppeteer, { Browser } from 'puppeteer-core';
const chromium = require('@sparticuz/chrome-aws-lambda');
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { join } from 'path';
import { Buffer } from 'buffer';

@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);

    async generateInvoicePdf(data: any): Promise<Buffer> {
        // --- MODIFICADO: Le decimos a TypeScript el tipo exacto de la variable 'browser' ---
        let browser: Browser | null = null;

        try {
            const templatePath = join(process.cwd(), 'src', 'templates', 'invoice.hbs');
            const templateHtml = await fs.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateHtml);
            const html = template(data);

            this.logger.log('Lanzando Puppeteer con la versión de Chrome para servidor...');

            browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath,
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });

            const page = await browser.newPage();

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
            });

            this.logger.log('PDF generado con éxito.');

            const finalBuffer = Buffer.from(pdfBuffer);
            this.logger.log(`Buffer del PDF convertido correctamente, tamaño: ${finalBuffer.length} bytes.`);
            return finalBuffer;

        } catch (error) {
            this.logger.error('Error al generar el PDF de la factura:', error);
            throw new Error('Could not generate PDF invoice.');
        } finally {
            // Con el tipo explícito, TypeScript ya entiende que esta comprobación es válida y segura
            if (browser !== null) {
                await browser.close();
            }
        }
    }
}