import { forwardRef, useState, useEffect, useRef, createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/utils";

const SelectContext = createContext();

const Select = forwardRef(({ children, onValueChange, value, defaultValue, ...props }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || "");
  const selectRef = useRef(null);

  // Update selected value when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (itemValue) => {
    setSelectedValue(itemValue);
    setIsOpen(false);
    if (onValueChange) {
      onValueChange(itemValue);
    }
  };

  const contextValue = {
    isOpen,
    setIsOpen,
    selectedValue,
    handleSelect
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div ref={selectRef} className="relative w-full" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  );
});
Select.displayName = "Select";

const SelectTrigger = forwardRef(({ children, className, ...props }, ref) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectTrigger must be used within a Select');
  }
  
  const { isOpen, setIsOpen } = context;

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        "flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown 
        className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200 ml-2",
          isOpen && "transform rotate-180"
        )} 
      />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = forwardRef(({ children, className, ...props }, ref) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectContent must be used within a Select');
  }
  
  const { isOpen } = context;

  if (!isOpen) return null;
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = forwardRef(({ children, className, value, ...props }, ref) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectItem must be used within a Select');
  }
  
  const { handleSelect, selectedValue } = context;
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      onClick={() => handleSelect(value)}
      className={cn(
        "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors text-black",
        isSelected && "bg-orange-50 text-orange-600",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = ({ placeholder }) => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('SelectValue must be used within a Select');
  }
  
  const { selectedValue } = context;

  return (
    <span className={cn(
      selectedValue ? "text-gray-900" : "text-gray-500"
    )}>
      {selectedValue || placeholder}
    </span>
  );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };