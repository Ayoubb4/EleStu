// src/pdf/pdf.service.ts
import { Injectable, Logger } from '@nestjs/common';
// --- MODIFICADO: Importamos desde 'puppeteer-core' ---
import * as puppeteer from 'puppeteer-core';
// --- AÑADIDO: Importamos la nueva librería que contiene Chrome ---
import * as chromium from 'chrome-aws-lambda';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { join } from 'path';
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

            this.logger.log('Lanzando Puppeteer con la versión de Chrome para servidor...');

            // --- MODIFICADO: Cambiamos la forma en que se inicia el navegador ---
            const browser = await puppeteer.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath, // <-- La clave está aquí
                headless: chromium.headless,
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

            const finalBuffer = Buffer.from(pdfBuffer);
            this.logger.log(`Buffer del PDF convertido correctamente, tamaño: ${finalBuffer.length} bytes.`);
            return finalBuffer;

        } catch (error) {
            this.logger.error('Error al generar el PDF de la factura:', error);
            throw new Error('Could not generate PDF invoice.');
        }
    }
}