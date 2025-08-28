import React from 'react';

const PaymentProductList = ({ products }) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
          <img
            src={product.imageUrl || '/default-product.jpg'}
            alt={product.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <div className="text-sm text-gray-600">
              수량: {product.quantity}개
            </div>
            {product.discountAmount > 0 && (
              <div className="text-sm text-red-600">
                할인: -{product.discountAmount.toLocaleString()}원
              </div>
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              {product.totalAmount.toLocaleString()}원
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentProductList;