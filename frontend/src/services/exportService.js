import reportService from './reportService.js';

export const exportService = {
  async exportExcel(filter = 'this_month', reportType = 'executive') {
    return await reportService.downloadReportFile('xlsx', reportType, filter);
  },

  async exportPdf(filter = 'this_month', reportType = 'executive') {
    return await reportService.downloadReportFile('pdf', reportType, filter);
  },
};

export default exportService;

