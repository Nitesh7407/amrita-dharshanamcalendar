import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
const fontkit = require('fontkit');
import fs from 'fs';
import path from 'path';

interface GeneratePdfOptions {
  title: string;
  nativeTitle?: string;
  deity: string;
  category: string;
  language: 'sanskrit' | 'tamil' | 'telugu' | 'english' | 'multilingual';
  verses: Array<{ verseNumber?: number; text: string; meaning?: string }>;
  overallMeaning?: string;
  sourceDocument?: string;
}

export async function generateSlokhaPdf(options: GeneratePdfOptions): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Load standard fonts
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const timesItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // Load Unicode fonts according to script
  let contentFont = timesRoman;
  const projectRoot = process.cwd();

  try {
    if (options.language === 'sanskrit') {
      const devPath = path.join(projectRoot, 'node_modules/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-devanagari-400-normal.woff');
      if (fs.existsSync(devPath)) {
        contentFont = await doc.embedFont(fs.readFileSync(devPath));
      }
    } else if (options.language === 'tamil') {
      const tamPath = path.join(projectRoot, 'node_modules/@fontsource/noto-sans-tamil/files/noto-sans-tamil-tamil-400-normal.woff');
      if (fs.existsSync(tamPath)) {
        contentFont = await doc.embedFont(fs.readFileSync(tamPath));
      }
    } else if (options.language === 'telugu') {
      const telPath = path.join(projectRoot, 'node_modules/@fontsource/noto-sans-telugu/files/noto-sans-telugu-telugu-400-normal.woff');
      if (fs.existsSync(telPath)) {
        contentFont = await doc.embedFont(fs.readFileSync(telPath));
      }
    } else if (options.language === 'english') {
      const engPath = path.join(projectRoot, 'node_modules/@fontsource/noto-sans-telugu/files/noto-sans-telugu-latin-ext-400-normal.woff');
      if (fs.existsSync(engPath)) {
        contentFont = await doc.embedFont(fs.readFileSync(engPath));
      }
    }
  } catch (err) {
    console.error('Font embedding fallback to standard font:', err);
    contentFont = timesRoman;
  }

  // Colors
  const maroon = rgb(0.43, 0.11, 0.14);   // #6E1B24
  const gold = rgb(0.83, 0.69, 0.22);     // #D4AF37
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 50;
  const printableWidth = pageWidth - margin * 2;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawHeader = (currentPage: any, pageNum: number) => {
    // Top border line
    currentPage.drawLine({
      start: { x: margin, y: pageHeight - 35 },
      end: { x: pageWidth - margin, y: pageHeight - 35 },
      thickness: 1.5,
      color: gold,
    });

    currentPage.drawText('AMRITA DARSHANAM • AMRITA DHARMA CALENDAR', {
      x: margin,
      y: pageHeight - 30,
      size: 8,
      font: timesBold,
      color: maroon,
    });

    currentPage.drawText('Amrita Vishwa Vidyapeetham', {
      x: pageWidth - margin - 120,
      y: pageHeight - 30,
      size: 8,
      font: timesItalic,
      color: lightGray,
    });

    // Bottom footer line
    currentPage.drawLine({
      start: { x: margin, y: 35 },
      end: { x: pageWidth - margin, y: 35 },
      thickness: 0.75,
      color: gold,
    });

    currentPage.drawText(`Page ${pageNum}`, {
      x: pageWidth / 2 - 15,
      y: 22,
      size: 8,
      font: timesRoman,
      color: lightGray,
    });

    currentPage.drawText('Discover sacred occasions • Celebrate with devotion', {
      x: margin,
      y: 22,
      size: 7.5,
      font: timesItalic,
      color: lightGray,
    });
  };

  let pageIndex = 1;
  drawHeader(page, pageIndex);
  y = pageHeight - 75;

  // Title section
  page.drawText(options.title.toUpperCase(), {
    x: margin,
    y: y,
    size: 16,
    font: timesBold,
    color: maroon,
  });
  y -= 20;

  // Subtitle / metadata line
  const metaText = `Deity: ${options.deity}  |  Category: ${options.category}  |  Language: ${options.language.toUpperCase()}`;
  page.drawText(metaText, {
    x: margin,
    y: y,
    size: 9.5,
    font: timesItalic,
    color: darkGray,
  });
  y -= 12;

  if (options.sourceDocument) {
    page.drawText(`Source: ${options.sourceDocument}`, {
      x: margin,
      y: y,
      size: 8.5,
      font: timesRoman,
      color: lightGray,
    });
    y -= 16;
  } else {
    y -= 8;
  }

  // Divider
  page.drawLine({
    start: { x: margin, y: y },
    end: { x: pageWidth - margin, y: y },
    thickness: 1,
    color: gold,
  });
  y -= 25;

  // Render verses
  const fontSize = 11;
  const lineHeight = 16;

  for (let i = 0; i < options.verses.length; i++) {
    const v = options.verses[i];
    const lines = v.text.split('\n').filter(l => l.trim().length > 0);

    // Estimate height needed for this verse
    const verseHeight = lines.length * lineHeight + (v.meaning ? 30 : 15);

    // If verse exceeds bottom margin, add new page
    if (y - verseHeight < 60) {
      page = doc.addPage([pageWidth, pageHeight]);
      pageIndex++;
      drawHeader(page, pageIndex);
      y = pageHeight - 65;
    }

    // Verse number badge if applicable
    if (v.verseNumber) {
      page.drawText(`[Verse ${v.verseNumber}]`, {
        x: margin,
        y: y,
        size: 8.5,
        font: timesBold,
        color: gold,
      });
      y -= 14;
    }

    // Render lines of the verse
    for (const line of lines) {
      if (y < 60) {
        page = doc.addPage([pageWidth, pageHeight]);
        pageIndex++;
        drawHeader(page, pageIndex);
        y = pageHeight - 65;
      }

      // Truncate or wrap long lines if necessary
      let safeLine = line.trim();
      if (safeLine.length > 90) {
        safeLine = safeLine.substring(0, 87) + '...';
      }

      try {
        page.drawText(safeLine, {
          x: margin + 10,
          y: y,
          size: fontSize,
          font: contentFont,
          color: darkGray,
        });
      } catch (err) {
        // Fallback for character encoding issues
        try {
          const asciiFallback = safeLine.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ');
          page.drawText(asciiFallback, {
            x: margin + 10,
            y: y,
            size: fontSize,
            font: timesRoman,
            color: darkGray,
          });
        } catch (innerErr) {
          // Graceful skip rather than breaking the PDF
        }
      }
      y -= lineHeight;
    }

    // Render meaning if available
    if (v.meaning) {
      y -= 4;
      const cleanMeaning = v.meaning.substring(0, 100).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ');
      try {
        page.drawText(`Meaning: ${cleanMeaning}`, {
          x: margin + 15,
          y: y,
          size: 8.5,
          font: timesItalic,
          color: lightGray,
        });
      } catch (e) {
        // ignore
      }
      y -= 14;
    }

    y -= 12; // Gap between verses
  }

  // If overall meaning exists and space allows
  if (options.overallMeaning) {
    if (y < 120) {
      page = doc.addPage([pageWidth, pageHeight]);
      pageIndex++;
      drawHeader(page, pageIndex);
      y = pageHeight - 65;
    }

    y -= 10;
    page.drawLine({
      start: { x: margin, y: y },
      end: { x: pageWidth - margin, y: y },
      thickness: 0.5,
      color: gold,
    });
    y -= 16;

    page.drawText('SPIRITUAL SIGNIFICANCE & SUMMARY', {
      x: margin,
      y: y,
      size: 9.5,
      font: timesBold,
      color: maroon,
    });
    y -= 14;

    // Word wrap summary
    const words = options.overallMeaning.split(' ');
    let currentLine = '';
    for (const w of words) {
      if ((currentLine + ' ' + w).length > 85) {
        try {
          page.drawText(currentLine.trim(), {
            x: margin,
            y: y,
            size: 9,
            font: timesItalic,
            color: darkGray,
          });
        } catch (e) {
          const asciiLine = currentLine.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ');
          page.drawText(asciiLine, {
            x: margin,
            y: y,
            size: 9,
            font: timesItalic,
            color: darkGray,
          });
        }
        currentLine = w + ' ';
        y -= 12;
        if (y < 60) {
          page = doc.addPage([pageWidth, pageHeight]);
          pageIndex++;
          drawHeader(page, pageIndex);
          y = pageHeight - 65;
        }
      } else {
        currentLine += w + ' ';
      }
    }
    if (currentLine.trim().length > 0) {
      try {
        page.drawText(currentLine.trim(), {
          x: margin,
          y: y,
          size: 9,
          font: timesItalic,
          color: darkGray,
        });
      } catch (e) {
        const asciiLine = currentLine.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ');
        page.drawText(asciiLine, {
          x: margin,
          y: y,
          size: 9,
          font: timesItalic,
          color: darkGray,
        });
      }
    }
  }

  return await doc.save();
}
