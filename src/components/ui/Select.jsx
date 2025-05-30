import { forwardRef, useState } from "react";
import { cn } from "../../lib/utils";

const Select = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-md border border-gray-300 bg-white text-black",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
Select.displayName = "Select";

const SelectTrigger = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "w-full text-left px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-100 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg z-10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-4 py-2 cursor-pointer hover:bg-gray-100 text-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = ({ value }) => {
  return <span>{value}</span>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
