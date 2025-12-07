import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from "./Image.module.scss"
import avatar from "@/assets/no_user.jpg"
import { forwardRef } from 'react';


const cx = classNames.bind(styles)

const Image = ({src, alt="", classname, ...props}, ref) => {
    const [fallbackImage, setFallbackImage] = useState('')

    const handleError = () => {
        setFallbackImage(avatar)
    }
    return (
        <img
            ref={ref}
            className={cx('wrapper', classname)}
            alt={alt}
            src={fallbackImage || src}
            onError={handleError}
            {...props}
        />
    );
}

export default forwardRef(Image);
