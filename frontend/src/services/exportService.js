import reportService from './reportService.js';

export const exportService = {
  async exportCsv(filter = 'this_month') {
    return await reportService.downloadReportFile('csv', 'executive', filter);
  },

  async exportExcel(filter = 'this_month') {
    return await reportService.downloadReportFile('excel', 'executive', filter);
  },

  async exportPdf(filter = 'this_month') {
    return await reportService.downloadReportFile('pdf', 'executive', filter);
  },
};

export default exportService;
