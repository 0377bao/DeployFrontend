import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './QrReader.module.scss';
import Modal from '../Modal';
import toast from 'react-hot-toast';
import { styleMessage } from '../../constants';
import BarcodeScanner from "react-qr-barcode-scanner";

const cx = classNames.bind(styles);

const QrReader = ({ data, setData, isOpenInfo = false, onClose = () => {} }) => {

const handleResult = (result) => {
    const checkProductExist = data.find(item => item.sku === result.text)
    if(checkProductExist) {
      toast.error("Sản phẩm đã tồn tại trong danh sách đề xuất", styleMessage)
      onClose();
      return;
    }
    setData(prev => result.text)
    onClose();
  }

  return (
    <Modal isOpenInfo={isOpenInfo} onClose={onClose}>
        <p className={cx('title-qrcode')}>Quét mã QR</p>
      <BarcodeScanner
        width={350}
        height={350}
        onUpdate={(err, result) => {
          if (result) handleResult(result);
          else console.log('Not found QR')
        }}
      />
    </Modal>
  );
};

export default QrReader;

