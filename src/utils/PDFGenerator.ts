import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface User {
  id: string;
  name: string;
  roomNumber: string;
  loginCode: string;
  isAdmin: boolean;
  isActive?: boolean;
}

interface MealEntry {
  id: string;
  _id?: string;
  userId: any;
  entryDate: string;
  mealType: string;
  dishName: string;
  cost: number;
}

interface PDFGeneratorOptions {
  filteredEntries: MealEntry[];
  users: User[];
  filters: {
    dateFrom: string;
    dateTo: string;
    selectedStudent: string;
    selectedMealType: string;
  };
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private currentY: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.currentY = 30;
    this.margin = 20;
  }

  private addHeader(title: string, subtitle?: string): void {
    // Title
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80); // Dark blue-gray
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
    this.currentY += 12;

    // Subtitle
    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(108, 117, 125); // Gray
      this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 10;
    }

    // Horizontal line
    this.doc.setDrawColor(108, 117, 125);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 15;
  }

  private addMetadata(filters: PDFGeneratorOptions['filters']): void {
    const today = new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const timeNow = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(73, 80, 87);

    // Generation info
    this.doc.text(`Generated on: ${today} at ${timeNow}`, this.margin, this.currentY);
    this.currentY += 8;

    // Filter info
    if (filters.dateFrom || filters.dateTo) {
      const fromDate = filters.dateFrom || 'Beginning';
      const toDate = filters.dateTo || 'Present';
      this.doc.text(`Date Range: ${fromDate} to ${toDate}`, this.margin, this.currentY);
      this.currentY += 8;
    }

    if (filters.selectedStudent !== 'all') {
      this.doc.text(`Student Filter: Applied`, this.margin, this.currentY);
      this.currentY += 8;
    }

    if (filters.selectedMealType !== 'all') {
      const mealType = filters.selectedMealType.charAt(0).toUpperCase() + filters.selectedMealType.slice(1);
      this.doc.text(`Meal Type: ${mealType} only`, this.margin, this.currentY);
      this.currentY += 8;
    }

    this.currentY += 10;
  }

  private calculateStats(entries: MealEntry[]): any {
    const stats = {
      totalEntries: entries.length,
      totalCost: entries.reduce((sum, entry) => sum + entry.cost, 0),
      breakfastCount: entries.filter(e => e.mealType === 'breakfast').length,
      lunchCount: entries.filter(e => e.mealType === 'lunch').length,
      dinnerCount: entries.filter(e => e.mealType === 'dinner').length,
      breakfastCost: entries.filter(e => e.mealType === 'breakfast').reduce((sum, e) => sum + e.cost, 0),
      lunchCost: entries.filter(e => e.mealType === 'lunch').reduce((sum, e) => sum + e.cost, 0),
      dinnerCost: entries.filter(e => e.mealType === 'dinner').reduce((sum, e) => sum + e.cost, 0),
      avgCostPerMeal: entries.length > 0 ? entries.reduce((sum, e) => sum + e.cost, 0) / entries.length : 0,
      uniqueStudents: new Set(entries.map(e => e.userId?.id || e.userId?._id || e.userId)).size,
      avgEntriesPerDay: 0 // Initialize this property
    };

    // Calculate daily averages
    const dateGroups = entries.reduce((acc, entry) => {
      const date = new Date(entry.entryDate).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, MealEntry[]>);

    stats.avgEntriesPerDay = Object.keys(dateGroups).length > 0 ? 
      entries.length / Object.keys(dateGroups).length : 0;

    return stats;
  }

  private addStatisticsSection(stats: any): void {
    // Statistics header
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('📊 STATISTICS OVERVIEW', this.margin, this.currentY);
    this.currentY += 12;

    // Prepare stats data for table
    const statsTableData = [
      ['📈 Total Entries', stats.totalEntries.toLocaleString()],
      ['💰 Total Amount', `₹${stats.totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['📊 Average per Meal', `₹${stats.avgCostPerMeal.toFixed(2)}`],
      ['👥 Students Served', stats.uniqueStudents.toString()],
      ['📅 Avg. Entries/Day', stats.avgEntriesPerDay.toFixed(1)],
      ['', ''], // Separator row
      ['🍳 Breakfast', `${stats.breakfastCount} entries (₹${stats.breakfastCost.toFixed(2)})`],
      ['🍛 Lunch', `${stats.lunchCount} entries (₹${stats.lunchCost.toFixed(2)})`],
      ['🍽️ Dinner', `${stats.dinnerCount} entries (₹${stats.dinnerCost.toFixed(2)})`],
    ];

    autoTable(this.doc, {
      body: statsTableData,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      columnStyles: {
        0: { 
          fontStyle: 'bold', 
          fillColor: [248, 249, 250],
          cellWidth: 60
        },
        1: { 
          halign: 'right',
          cellWidth: 'auto'
        }
      },
      styles: { 
        fontSize: 11,
        cellPadding: 6,
        lineWidth: 0.1,
        lineColor: [222, 226, 230]
      },
      theme: 'grid',
      didParseCell: (data) => {
        // Style separator row
        if (data.row.index === 5) {
          data.cell.styles.fillColor = [108, 117, 125];
          data.cell.styles.minCellHeight = 3;
          (data.cell as any).text = [];
        }
        // Style meal type rows
        if (data.row.index >= 6 && data.column.index === 0) {
          data.cell.styles.fillColor = [232, 245, 233];
        }
      }
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addDetailedEntriesSection(entries: MealEntry[]): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = 30;
    }

    // Detailed entries header
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(44, 62, 80);
    this.doc.text('📋 DETAILED MEAL ENTRIES', this.margin, this.currentY);
    this.currentY += 15;

    if (entries.length === 0) {
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'italic');
      this.doc.setTextColor(108, 117, 125);
      this.doc.text('No meal entries found for the selected criteria.', this.margin, this.currentY);
      return;
    }

    // Group entries by date
    const entriesByDate = entries.reduce((acc, entry) => {
      const date = new Date(entry.entryDate).toLocaleDateString('en-IN');
      if (!acc[date]) acc[date] = [];
      acc[date].push(entry);
      return acc;
    }, {} as Record<string, MealEntry[]>);

    // Prepare table data with proper grouping
    const tableData: string[][] = [];
    const sortedDates = Object.keys(entriesByDate).sort((a, b) => 
      new Date(a.split('/').reverse().join('-')).getTime() - 
      new Date(b.split('/').reverse().join('-')).getTime()
    );

    sortedDates.forEach(date => {
      const dayEntries = entriesByDate[date];
      const dayTotal = dayEntries.reduce((sum, e) => sum + e.cost, 0);

      // Add date header
      tableData.push([
        `📅 ${date}`,
        '',
        '',
        '',
        dayEntries.length.toString(),
        `₹${dayTotal.toFixed(2)}`
      ]);

      // Sort entries by meal type
      const sortedEntries = dayEntries.sort((a, b) => {
        const mealOrder = { breakfast: 1, lunch: 2, dinner: 3 };
        return mealOrder[a.mealType as keyof typeof mealOrder] - 
               mealOrder[b.mealType as keyof typeof mealOrder];
      });

      // Add individual entries
      sortedEntries.forEach(entry => {
        const mealIcon = entry.mealType === 'breakfast' ? '🍳' : 
                        entry.mealType === 'lunch' ? '🍛' : '🍽️';
        
        tableData.push([
          '',
          entry.userId?.name || 'Unknown',
          `Room ${entry.userId?.roomNumber || 'N/A'}`,
          `${mealIcon} ${entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}`,
          entry.dishName,
          `₹${entry.cost.toFixed(2)}`
        ]);
      });
    });

    // Create the detailed table
    autoTable(this.doc, {
      head: [['Date', 'Student', 'Room', 'Meal', 'Dish', 'Cost']],
      body: tableData,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        lineWidth: 0.1,
        lineColor: [222, 226, 230]
      },
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 45 },
        5: { halign: 'right', cellWidth: 25 }
      },
      didParseCell: (data) => {
        // Style date header rows
        if (data.row.index < tableData.length && 
            tableData[data.row.index][0].startsWith('📅')) {
          data.cell.styles.fillColor = [52, 152, 219];
          data.cell.styles.textColor = [255, 255, 255];
          data.cell.styles.fontStyle = 'bold';
          
          // For date rows, merge styling across columns except cost
          if (data.column.index < 4) {
            data.cell.styles.fillColor = [52, 152, 219];
          }
        }
        
        // Alternate row coloring for entries
        else if (data.row.index % 2 === 0) {
          data.cell.styles.fillColor = [248, 249, 250];
        }
      },
      theme: 'grid'
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;
  }

  private addSummaryFooter(stats: any): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      this.doc.addPage();
      this.currentY = 30;
    }

    // Summary box
    this.doc.setDrawColor(52, 73, 94);
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 'FD');

    // Summary header
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(52, 73, 94);
    this.doc.text('📄 REPORT SUMMARY', this.margin + 10, this.currentY + 12);

    // Summary details
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(73, 80, 87);
    
    const leftCol = this.margin + 10;
    const rightCol = this.pageWidth / 2 + 10;
    
    this.doc.text(`Total Entries: ${stats.totalEntries}`, leftCol, this.currentY + 22);
    this.doc.text(`Total Amount: ₹${stats.totalCost.toFixed(2)}`, rightCol, this.currentY + 22);
    this.doc.text(`Average/Meal: ₹${stats.avgCostPerMeal.toFixed(2)}`, leftCol, this.currentY + 30);
    this.doc.text(`Students: ${stats.uniqueStudents}`, rightCol, this.currentY + 30);
  }

  public generatePDF(options: PDFGeneratorOptions): string {
    const { filteredEntries, users, filters } = options;
    
    // Calculate statistics
    const stats = this.calculateStats(filteredEntries);

    // Build the PDF
    this.addHeader('🏠 HOSTEL MEAL TRACKER', 'Comprehensive Meal Entries Report');
    this.addMetadata(filters);
    this.addStatisticsSection(stats);
    this.addDetailedEntriesSection(filteredEntries);
    this.addSummaryFooter(stats);

    // Generate filename
    const today = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
    const timeNow = new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(/:/g, '-');
    
    const fileName = `hostel-meal-report-${today}-${timeNow}.pdf`;

    // Save and return filename
    this.doc.save(fileName);
    return fileName;
  }
}

// Export utility function for easy use
export function generateMealEntriesPDF(options: PDFGeneratorOptions): string {
  const generator = new PDFGenerator();
  return generator.generatePDF(options);
}
