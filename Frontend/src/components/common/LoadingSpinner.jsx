import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ size = 'default', description = 'Cargando...' }) => {
  return (
    <div className="flex items-center justify-center p-8 min-h-[200px]">
      <Spin 
        size={size} 
        description={description}
        className="text-blue-500"
      />
    </div>
  );
};

export default LoadingSpinner;
