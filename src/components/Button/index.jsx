import React from 'react';
import classNames from 'classnames/bind';
import styles from './Button.module.scss';
import { Link } from 'react-router-dom';

const cx = classNames.bind(styles);

export default function Button({
    to,
    href,
    primary = false,
    outline = false,
    small = false,
    medium = false,
    large = false,
    text = false,
    disabled = false,
    rounded = false,
    className,
    children,
    leftIcon,
    rightIcon,
    borderRadiusSmall = false,
    borderRadiusMedium = false,
    borderRadiusLarge = false,
    success = false,
    error = false,
    active = false,
    search = false,
    info = false,
    warning = false,
    secondary = false,
    ...pass
}) {
    let Comp = 'button';
    const props = {
        ...pass,
    };

    //Remove event listeners
    if (disabled) {
        Object.keys(props).forEach((key) => {
            if (key.startsWith('on') && typeof props[key] === 'function') {
                delete props[key];
            }
        });
    }

    if (to) {
        props.to = to;
        Comp = Link;
    } else if (href) {
        props.href = href;
        Comp = 'a';
    }

    const classes = cx('wrapper', {
        [className]: className,
        primary,
        outline,
        text,
        small,
        medium,
        large,
        disabled,
        rounded,
        borderRadiusSmall,
        borderRadiusMedium,
        borderRadiusLarge,
        success,
        error,
        active,
        search,
        info,
        warning,
        secondary,
    });
    return (
        <Comp styles={{}} className={classes} {...props}>
            {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
            <span className={cx('title')}>{children}</span>
            {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
        </Comp>
    );
}
