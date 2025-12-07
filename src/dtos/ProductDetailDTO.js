class ProductDetailDTO {
    constructor(data) {
        this.skug = data.categoryID;
        this.sku = data.productID;
        this.productName = data.productName;
        this.image = data.image;
        this.des = data.description;
        this.price = new Intl.NumberFormat('vi-VN').format(data.price);
        this.minStock = data.minStock;
        this.baseUnitName = data?.baseUnitName || '';
        this.qrcode = data.qrCode;
        this.listBatch = data.listBatch;
        this.total = data.listBatch.reduce((s, item) => s + item.totalProductRemain, 0);
        this.amount = data.amount;
    }
}

export default ProductDetailDTO;
