'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { createCoupon, updateCoupon } from '@/app/lib/actions'
import { useQueryClient } from '@tanstack/react-query';
import { Coupon } from '@/app/admin/coupon/page';


interface CouponDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Coupon
  loginId: number;
}

export function CouponDialog({ 
  isOpen, 
  onOpenChange, 
  initialData, 
  loginId 
}: CouponDialogProps) {

useEffect(() => {
    if (initialData) {
        setCode(initialData.code || "");
        setType(initialData.type || "FLAT");
        setValue(initialData.value || 0);
        setMaxUsage(initialData.maxUsage || undefined);
        setExpiryDate(initialData.expiryDate || undefined);
    }
    }, [initialData]);
  const [code, setCode] = useState(initialData?.code || '');
  const [type, setType] = useState<'PERCENTAGE' | 'FLAT'>(initialData?.type || 'FLAT');
  const [value, setValue] = useState(initialData?.value || 0);
  const [maxUsage, setMaxUsage] = useState(initialData?.maxUsage || undefined);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(initialData?.expiryDate?? undefined);
const queryClient=useQueryClient()

  const handleSubmit = async () => {
    try {
      const formData = {
        code,
        type,
        value,
        maxUsage,
        expiryDate,
        loginId
      };

      const result = initialData?.id 
        ? await updateCoupon(initialData.id, formData)
        : await createCoupon(formData);

      if (result.success) {
        onOpenChange(false);
        // Reset form
        setCode('');
        setType('FLAT');
        setValue(0);
        setMaxUsage(undefined);
        setExpiryDate(undefined);
        queryClient.invalidateQueries({ queryKey: ['coupon'] });
      } else {
        // Handle error (maybe show a toast)
        console.error(result.error);
      }
    } catch (error) {
      console.error('Error submitting coupon:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Coupon' : 'Create New Coupon'}
          </DialogTitle>
          <DialogDescription>
            Fill in the coupon details
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="code" className="text-right">
              Coupon Code
            </label>
            <Input 
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="col-span-3"
              placeholder="Enter coupon code"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="type" className="text-right">
              Discount Type
            </label>
            <Select 
              value={type} 
              onValueChange={(val: 'PERCENTAGE' | 'FLAT') => setType(val)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FLAT">Fixed Amount</SelectItem>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="value" className="text-right">
              Discount Value
            </label>
            <Input 
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value))}
              className="col-span-3"
              placeholder="Enter discount value"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="maxUsage" className="text-right">
              Max Usage
            </label>
            <Input 
              id="maxUsage"
              type="number"
              value={maxUsage || ''}
              onChange={(e) => {
                const val = e.target.value;
                setMaxUsage(val ? parseInt(val) : undefined);
              }}
              className="col-span-3"
              placeholder="Optional: Maximum usage limit"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="expiryDate" className="text-right">
              Expiry Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'col-span-3 justify-start text-left font-normal',
                    !expiryDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            {initialData?.id ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}