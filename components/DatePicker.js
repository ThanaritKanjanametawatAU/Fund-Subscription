import { useState } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FiCalendar } from 'react-icons/fi';

export default function DatePicker({ selectedDate, onDateChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (date) => {
    onDateChange(date);
    setIsOpen(false);
  };

  const toggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  const formatDate = (date) => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substr(-2);
    
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Report Date
      </label>
      <div className="relative">
        <div 
          className="input flex items-center cursor-pointer"
          onClick={toggleCalendar}
        >
          <input
            type="text"
            readOnly
            value={formatDate(selectedDate)}
            className="grow bg-transparent outline-none cursor-pointer"
            placeholder="DD/MM/YY"
          />
          <FiCalendar className="text-gray-500" />
        </div>
        {isOpen && (
          <div className="absolute z-10 mt-1">
            <ReactDatePicker
              selected={selectedDate}
              onChange={handleChange}
              inline
              dateFormat="dd/MM/yy"
            />
          </div>
        )}
      </div>
    </div>
  );
} 