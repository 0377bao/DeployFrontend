import toast from 'react-hot-toast';
import { styleMessage } from '../constants';

function isOver18(birthDateStr) {
    const today = new Date();
    const birthDate = new Date(birthDateStr);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }

    return age >= 18;
}

const validateEmployeeData = (data, action = 'add') => {
    const {
        empId,
        empName,
        empCCCD,
        empDob,
        gender,
        empPhone,
        empAddress,
        empStartDate,
        warehouseId,
        empRole,
        empStatus,
        empImage,
    } = data;
    const message = {
        empId: 'Vui lòng tạo mã nhân viên',
        empName: 'Vui lòng nhập tên nhân viên',
        empCCCD: 'Vui lòng nhập căn cước công dân',
        empDob: 'Vui lòng chọn ngày sinh',
        gender: 'Vui lòng chọn giới tính',
        empPhone: 'Vui lòng nhập số điện thoại',
        empAddress: 'Vui lòng nhập địa chỉ',
        empStartDate: 'Vui lòng chọn ngày vào làm',
        warehouseId: 'Vui lòng chọn kho',
        empStatus: 'Vui lòng chọn trạng thái',
        empRole: 'Vui lòng chọn ít nhất một vai trò cho nhân viên',
        empImage: 'Vui lòng tải hình ảnh nhân viên lên',
    };
    if (!empId) {
        toast.error(message['empId'], styleMessage);
        return false;
    }
    if (!empName) {
        toast.error(message['empName'], styleMessage);
        return false;
    }
    if (!empCCCD) {
        toast.error(message['empCCCD'], styleMessage);
        return false;
    }
    if (!empDob) {
        toast.error(message['empDob'], styleMessage);
        return false;
    }
    if (!gender) {
        toast.error(message['gender'], styleMessage);
        return false;
    }
    if (!empPhone) {
        toast.error(message['empPhone'], styleMessage);
        return false;
    }
    if (!empAddress) {
        toast.error(message['empAddress'], styleMessage);
        return false;
    }
    if (!empStartDate) {
        toast.error(message['empStartDate'], styleMessage);
        return false;
    }
    // if (!warehouseId) {
    //     toast.error(message['warehouseId'], styleMessage);
    //     return false;
    // }
    if (empRole.length == 0) {
        toast.error(message['empRole'], styleMessage);
        return false;
    }
    if (!empStatus) {
        toast.error(message['empStatus'], styleMessage);
        return false;
    }
    if (!empImage) {
        toast.error(message['empImage'], styleMessage);
        return false;
    }

    if (empStatus == 'Nghỉ việc') {
        if (!data.empEndDate) {
            toast.error('Vui lòng điền ngày nghỉ làm khi nhân viên nghỉ việc', {
                ...styleMessage,
            });
            return false;
        } else {
            if (new Date(data.empEndDate) < new Date(empStartDate)) {
                toast.error('Ngày nghỉ làm phải sau ngày vào làm', {
                    ...styleMessage,
                });
                return false;
            }
        }
    }

    if (!/^[\p{L}\s]+$/u.test(empName)) {
        toast.error('Tên chỉ chứa chữ và khoảng trắng', {
            ...styleMessage,
        });
        return false;
    }
    if (!/^\d{12}$/.test(empCCCD)) {
        toast.error('Căn cước công dân bắt buộc có độ dài 12 chữ số', {
            ...styleMessage,
        });
        return false;
    }
    if (!/^(03|05|07|08|09)\d{8}$/.test(empPhone)) {
        toast.error('Số điện thoại có độ dài 10 chữ số và bắt đầu bằng 03 hoặc 05 hoặc 07 hoặc 08 hoặc 09', {
            ...styleMessage,
        });
        return false;
    }
    if (new Date(empDob) > Date.now()) {
        toast.error('Ngày sinh phải trước ngày hôm nay', {
            ...styleMessage,
        });
        return false;
    }
    if (new Date(empDob) < Date.now()) {
        if (!isOver18(empDob)) {
            toast.error('Nhân viên phải bằng hoặc trên 18 tuổi', {
                ...styleMessage,
            });
            return false;
        }
    }
    if (empStatus !== 'Nghỉ việc' && action != 'update') {
        if (new Date(empStartDate) < Date.now()) {
            toast.error('Ngày vào làm phải sau ngày hôm nay', {
                ...styleMessage,
            });
            return false;
        }
    }
    return true;
};

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const day = String(date.getDate()).padStart(2, '0'); // lấy ngày, thêm 0 nếu < 10
    const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() trả 0–11
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}

export { isOver18, validateEmployeeData, formatDate };
