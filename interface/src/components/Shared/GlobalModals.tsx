import React from 'react';
import { AddProductModal } from './AddProductModal';
import { StockInModal } from './StockInModal';
import { TransferModal } from './TransferModal';
import { RequestItemModal } from './RequestItemModal';

export const GlobalModals = () => {
  return (
    <>
      <AddProductModal />
      <StockInModal />
      <TransferModal />
      <RequestItemModal />
    </>
  );
};
