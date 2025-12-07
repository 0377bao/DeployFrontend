class EmployeeDTO {
    constructor(data) {
        this.key= data.employeeID,
        this.empId= data.employeeID,
        this.empName= data.employeeName,
        this.empCCCD= data.cccd,
        this.empDob= data.dob.split('T')[0],
        this.gender= data.gender == "male" ? 'Nam' : 'Nữ',
        this.empPhone= data.phoneNumber,
        this.empAddress= data.address,
        this.empStartDate= data.startDate.split('T')[0],
        this.empEndDate= data.endDate ? data.endDate.split('T')[0] : "",
        this.warehouseId= data.warehouseID,
        this.empRole= data.roles,
        this.empStatus= data.status == 'ACTIVE' ? 'Đang làm' : 'Nghỉ việc',
        this.empImage= data.image
    }
}

export default EmployeeDTO