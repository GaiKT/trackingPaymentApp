import express from 'express';
import ExcelJS from 'exceljs';
import { Transaction } from '../models/transaction';
import { protect } from '../middlewares/protectRouters';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';

const exportRouter = express.Router();

// Apply authentication middleware
exportRouter.use(protect);

// Export transactions to Excel
exportRouter.get('/transactions', asyncHandler(async (req : Request, res : Response) => {
  try {
    const userId = req.query.userId;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find transactions for the user
    const transactions = await Transaction.find({ 'user._id': userId })
      .populate({
        path: 'category',
        select: 'name type icon color'
      })
      .sort({ date: -1 });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Transactions');

    // Add headers
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Transaction', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Type', key: 'type', width: 10 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Description', key: 'description', width: 40 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add transaction data
    transactions.forEach(transaction => {
      const categoryName = transaction.category ? transaction.category.name : 'Uncategorized';
      const type = transaction.category ? transaction.category.type : 'unknown';
      
      worksheet.addRow({
        date: new Date(transaction.date),
        name: transaction.name,
        category: categoryName,
        type: type === 'income' ? 'Income' : 'Expense',
        amount: transaction.amount,
        description: transaction.description || ''
      });
    });

    // Format date column
    worksheet.getColumn('date').numFmt = 'yyyy-mm-dd';
    
    // Format amount column
    worksheet.getColumn('amount').numFmt = '$#,##0.00';
    
    // Style amount cells by transaction type
    for (let i = 2; i <= transactions.length + 1; i++) {
      const cell = worksheet.getCell(`E${i}`);
      const typeCell = worksheet.getCell(`D${i}`);
      
      if (typeCell.value === 'Income') {
        cell.font = { color: { argb: '006100' } };
      } else {
        cell.font = { color: { argb: '950000' } };
      }
    }

    // Add summary calculations at bottom
    const totalRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${totalRow}`).value = 'Total Income:';
    worksheet.getCell(`A${totalRow}`).font = { bold: true };
    
    worksheet.getCell(`E${totalRow}`).value = {
      formula: `SUMIF(D2:D${transactions.length + 1},"Income",E2:E${transactions.length + 1})`
    };
    worksheet.getCell(`E${totalRow}`).font = { bold: true, color: { argb: '006100' } };
    worksheet.getCell(`E${totalRow}`).numFmt = '$#,##0.00';
    
    worksheet.getCell(`A${totalRow + 1}`).value = 'Total Expenses:';
    worksheet.getCell(`A${totalRow + 1}`).font = { bold: true };
    
    worksheet.getCell(`E${totalRow + 1}`).value = {
      formula: `SUMIF(D2:D${transactions.length + 1},"Expense",E2:E${transactions.length + 1})`
    };
    worksheet.getCell(`E${totalRow + 1}`).font = { bold: true, color: { argb: '950000' } };
    worksheet.getCell(`E${totalRow + 1}`).numFmt = '$#,##0.00';
    
    worksheet.getCell(`A${totalRow + 2}`).value = 'Balance:';
    worksheet.getCell(`A${totalRow + 2}`).font = { bold: true };
    
    worksheet.getCell(`E${totalRow + 2}`).value = {
      formula: `E${totalRow}-E${totalRow + 1}`
    };
    worksheet.getCell(`E${totalRow + 2}`).font = { bold: true };
    worksheet.getCell(`E${totalRow + 2}`).numFmt = '$#,##0.00';

    // Generate the Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=transactions-export-${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export transactions',
      error: error.message
    });
  }
}));

// Export a monthly summary
exportRouter.get('/monthly-summary', asyncHandler(async (req : Request, res : Response) => {
  try {
    const userId = req.query.userId;
    const year = req.query.year || new Date().getFullYear();

    // Validate user ID
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Find transactions for the user in the specified year
    const transactions = await Transaction.find({
      'user._id': userId,
      date: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      }
    }).populate({
      path: 'category',
      select: 'name type'
    });

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Summary');

    // Add headers
    worksheet.columns = [
      { header: 'Month', key: 'month', width: 15 },
      { header: 'Income', key: 'income', width: 15 },
      { header: 'Expenses', key: 'expenses', width: 15 },
      { header: 'Balance', key: 'balance', width: 15 }
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Prepare monthly data
    const monthlyData = {};
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Initialize monthly data
    months.forEach(month => {
      monthlyData[month] = { income: 0, expenses: 0, balance: 0 };
    });

    // Aggregate transactions by month
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = months[date.getMonth()];
      const type = transaction.category?.type || 'expense';
      
      if (type === 'income') {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expenses += transaction.amount;
      }
    });

    // Calculate balance and add rows
    months.forEach(month => {
      monthlyData[month].balance = monthlyData[month].income - monthlyData[month].expenses;
      
      worksheet.addRow({
        month,
        income: monthlyData[month].income,
        expenses: monthlyData[month].expenses,
        balance: monthlyData[month].balance
      });
    });

    // Format currency columns
    worksheet.getColumn('income').numFmt = '$#,##0.00';
    worksheet.getColumn('expenses').numFmt = '$#,##0.00';
    worksheet.getColumn('balance').numFmt = '$#,##0.00';
    
    // Style income, expense, and balance columns
    for (let i = 2; i <= months.length + 1; i++) {
      const incomeCell = worksheet.getCell(`B${i}`);
      const expenseCell = worksheet.getCell(`C${i}`);
      const balanceCell = worksheet.getCell(`D${i}`);
      
      incomeCell.font = { color: { argb: '006100' } };
      expenseCell.font = { color: { argb: '950000' } };
      
      // Color balance based on value
      if (Number(balanceCell.value) >= 0) {
        balanceCell.font = { color: { argb: '006100' } };
      } else {
        balanceCell.font = { color: { argb: '950000' } };
      }
    }

    // Add yearly totals
    const totalRow = worksheet.rowCount + 2;
    worksheet.getCell(`A${totalRow}`).value = 'Yearly Totals:';
    worksheet.getCell(`A${totalRow}`).font = { bold: true };
    
    worksheet.getCell(`B${totalRow}`).value = {
      formula: `SUM(B2:B${months.length + 1})`
    };
    worksheet.getCell(`B${totalRow}`).font = { bold: true, color: { argb: '006100' } };
    worksheet.getCell(`B${totalRow}`).numFmt = '$#,##0.00';
    
    worksheet.getCell(`C${totalRow}`).value = {
      formula: `SUM(C2:C${months.length + 1})`
    };
    worksheet.getCell(`C${totalRow}`).font = { bold: true, color: { argb: '950000' } };
    worksheet.getCell(`C${totalRow}`).numFmt = '$#,##0.00';
    
    worksheet.getCell(`D${totalRow}`).value = {
      formula: `B${totalRow}-C${totalRow}`
    };
    worksheet.getCell(`D${totalRow}`).font = { bold: true };
    worksheet.getCell(`D${totalRow}`).numFmt = '$#,##0.00';

    // Generate the Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=monthly-summary-${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting monthly summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export monthly summary',
      error: error.message
    });
  }
}));

export { exportRouter };