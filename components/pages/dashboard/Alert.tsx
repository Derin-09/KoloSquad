import React from 'react';
import { Card } from '@/components/ui/Card';

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => (
  <Card className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
    <span className="block sm:inline">{message}</span>
  </Card>
);

export default Alert;
