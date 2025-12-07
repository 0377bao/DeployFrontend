import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './CategoryPage.module.scss';
import { Button, CategoryList, ModalCreateCategory, ModelFilter } from '../../components';
import request, { post } from '../../utils/httpRequest';
import parseToken from '../../utils/parseToken';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';

const cx = classNames.bind(styles);

const CategoryPage = () => {
    const [showModalCreateCategory, setShowModalCreateCategory] = useState(false)
    const [filterCategory, setFilterCategory] = useState({
        categoryID: "",
        categoryName: ""
    })
    const [categoryList, setCategoryList] = useState([])
    const columnsFilter = [
        {
            id: 1,
            label: 'Mã nhóm sản phẩm',
            value: filterCategory.categoryID,
            setValue: (value) => setFilterCategory(prev => ({...prev, categoryID: value}))
        },
        {
            id: 2,
            label: 'Tên nhóm sản phẩm',
            value: filterCategory.categoryName,
            setValue: (value) => setFilterCategory(prev => ({...prev, categoryName: value}))
        }
    ] 

    const handleResetFilter = () => {
        setFilterCategory({
            categoryID: '',
            categoryName: ''
        })
    }

    const handleSubmitFilter = () => {

    }

    const handleCreateCategory = async (data) =>{
        try{
            const token = parseToken("tokenUser")
            const result = await post('/api/category-product/create-category', {
                ...data
            }, token.accessToken, token.employeeID)
            toast.success(result.message, styleMessage)
            setCategoryList(prev => [data,...prev])
            handleOpenModalCreateCategory()
        }catch(err) {   
            console.log(err);
            toast.error(err.response.data.message, styleMessage)
        }
    }

     const handleOpenModalCreateCategory = () => {
        setShowModalCreateCategory(prev => !prev)
    }

    const fetchCategories = async () =>{
        try{
            const token = parseToken("tokenUser")
            const result = await request.get('/api/category-product/get-all-categories', {
                headers: {
                    token: `Beare ${token.accessToken}`,
                    employeeid: token.employeeID
                }
            })
            setCategoryList(result.data.data)
        }catch(err) {   
            console.log(err);
        }
    }

    useEffect(() => {
        // fetch category
        fetchCategories()
    }, [])
    return (
        <div className={cx('wrapper-category')}>
            <ModelFilter columns={columnsFilter} handleResetFilters={handleResetFilter} handleSubmitFilter={handleSubmitFilter}>
                <Button primary onClick={handleOpenModalCreateCategory}>
                    <span>Thêm nhóm sản phẩm</span>
                </Button>
            </ModelFilter>
            <CategoryList data={categoryList}/>
             {showModalCreateCategory && <ModalCreateCategory handleCreate={handleCreateCategory} onClose={handleOpenModalCreateCategory}/>}
        </div>
    );
}

export default CategoryPage;