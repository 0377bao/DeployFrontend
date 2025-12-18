import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './ModelFilter.module.scss';
import { MyTable, Button, Popper } from '@/components';
import { RotateCcw, Search } from 'lucide-react';

const cx = classNames.bind(styles);

const ModelFilter = ({ handleSubmitFilter, handleResetFilters, columns, children, selectInput = [], className }) => {
    const [lastScrollY, setLastScrollY] = useState(0);
    const contentRef = useRef();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY) {
                // Cuộn xuống
                const height = contentRef.current.clientHeight;
                const heightCurrent = height - currentScrollY;

                if (heightCurrent > 0) {
                    contentRef.current.style.transform = `translateY(-${currentScrollY}px)`;
                    contentRef.current.style.transition = `transform 0.1s linear`;
                } else {
                    contentRef.current.style.transition = `transform 0.1s linear`;
                    contentRef.current.style.transform = `translateY(-110%)`;
                }
            } else {
                // Cuộn lên
                contentRef.current.style.transition = `transform 0.3s ease-in-out`;
                contentRef.current.style.transform = `translateY(0)`;
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);
    return (
        <Popper className={cx('popper', className)} ref={contentRef}>
            <div className={cx('wrapper-filter')}>
                {columns.map((item) => (
                    <div className={cx('form-group')} key={item.id}>
                        <label htmlFor={item.id}>{item.label}</label>
                        <input
                            type={item?.type || 'text'}
                            id={item.id}
                            className={cx('form-input')}
                            placeholder={`Nhập ${item.label}`}
                            value={item.value}
                            onChange={(e) => item.setValue(e.target.value)}
                        />
                    </div>
                ))}
                {selectInput.length > 0 &&
                    selectInput.map((item, index) => (
                        <div className={cx('form-group')}>
                            <label htmlFor={index}>{item.label}</label>
                            <select value={item.value} onChange={(e) => item.setValue(e.target.value)}>
                                <option disabled></option>
                                {item.option.map((opt) => (
                                    <option key={opt.name} value={opt.value}>
                                        {opt.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
            </div>
            <div className={cx('wrapper-action')}>
                {children}
                <Button
                    search
                    className={cx('btn-filter')}
                    onClick={handleSubmitFilter}
                    leftIcon={<Search size={15} />}
                >
                    Tìm kiếm
                </Button>
                <Button
                    outline
                    className={cx('btn-reset')}
                    onClick={handleResetFilters}
                    leftIcon={<RotateCcw size={15} />}
                >
                    Đặt lại
                </Button>
            </div>
        </Popper>
    );
};

export default ModelFilter;
