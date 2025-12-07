import React from "react"
import classNames from "classnames/bind"
import styles from "./Select.module.scss"

const cx = classNames.bind(styles)

const Select = ({options = [], onChange =() => {}, classNames, ...props}) => {
    if(options.length == 0) {
        return  <select className={cx("wrapper-selected-custom", classNames)} {...props}>
            <option></option>
        </select>
    }
    return (
         <select className={cx("wrapper-selected-custom", classNames)} {...props} onChange={onChange}>
            {options.map((op, idx)=> <option key={idx} value={op.value}>{op.name}</option>)}
        </select>
    )
}

export default Select;