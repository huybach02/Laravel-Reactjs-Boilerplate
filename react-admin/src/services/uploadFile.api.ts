// import { notificationController } from '@app/controllers/notificationController';
// import { IApiSuccess } from '@app/interfaces/interfaces';
// import fileDownload from 'js-file-download';
// import moment from 'moment';
// import { apiInstance } from './core.api';

// export const UploadFile = async (path: string, value: any) => {
//   try {
//     const data: IApiSuccess = await apiInstance.post(path + '/import-excel', value, { responseType: 'blob' });
//     if (data) {
//       notificationController.success({
//         message: 'Thành công'
//       });
//       return data;
//     }
//   } catch (error: any) {
//     fileDownload(error.response.data, `file-bao-loi-${moment().format('MMYYHHmmss').padStart(2, '0')}.xlsx`);
//   }
// };
