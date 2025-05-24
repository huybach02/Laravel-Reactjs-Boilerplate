import { notificationController } from '@app/controllers/notificationController';
import { apiInstance } from './core.api';
import { IApiSuccess } from '@app/interfaces/interfaces';

export const deleteData = async (path: string, id: number) => {
  try {
    const respUsers: IApiSuccess = await apiInstance.delete(`${path}/${id}`);
    if (respUsers.code === 200) {
      notificationController.success({
        message: 'Xoá thành công'
      });
    }
  } catch (error: any) {
    notificationController.error({
      message: 'Có lỗi xảy ra vui lòng thử lại sau',
      description: error.message
    });
  }
};
