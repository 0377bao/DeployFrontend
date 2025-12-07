class ProductDTO {
    constructor(data) {
        this.skgu = data.category.categoryName;
        this.sku = data.productID;
        this.productName = data.productName;
        this.minStock = data.minStock;
        this.status = data.status;
        this.baseUnitName = data.baseUnitProducts.baseUnitName;
        this.baseUnitProductID = data.baseUnitProducts.baseUnitProductID;
    }
}

export default ProductDTO;
