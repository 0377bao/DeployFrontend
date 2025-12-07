import { Modal } from '../../../components';
import GoodsReceiptRequest from '../../ProposalPage/GoodsReceiptRequest';

const ModelProposalDetail = ({ isOpen, onClose, proposalDetailID, typeDetail, handleSearch }) => {
    return (
        <Modal isOpenInfo={isOpen} onClose={onClose} showButtonClose={false}>
            <GoodsReceiptRequest
                onClose={onClose}
                proposalDetailID={proposalDetailID}
                typeDetail={typeDetail}
                handleSearch={handleSearch}
            />
        </Modal>
    );
};

export default ModelProposalDetail;
