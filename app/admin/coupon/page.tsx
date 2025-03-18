'use client';

import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CouponDialog } from '@/components/CouponDialog';
import { getCoupons, deleteCoupon } from '@/app/lib/actions';
import { format } from 'date-fns';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserContext';
import {  useQuery, useQueryClient } from '@tanstack/react-query';
export interface Coupon {
    id: number;
    code: string;
    type: 'PERCENTAGE' | 'FLAT';
    value: number;
    maxUsage?: number | null; // Allow null
  expiryDate?: Date | null;
  }

const fetchCoupons = async (userId: string) => {

  const result = await getCoupons(userId);

  // Ensure we return a plain object
  return {
    ...result,
    data: result.map(item => ({ ...item }))
  }
}
export default function CouponsPage() {

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon |null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const queryClient = useQueryClient()
    const {userId}= useUser()
    const { 
        data: couponsData,
      } = useQuery({
        queryKey: ['coupon',userId],
        queryFn: () => fetchCoupons(userId ?? ''),
        staleTime: 1000 * 60 * 60 * 12, // 12 hours
        gcTime: 1000 * 60 * 60 * 24,
        // You can conditionally disable the query instead
        enabled: !!userId
      });
    
      // Early return after all hooks have been called
      if (!userId) {
        return null; // Return null or a loading component
      }
      
      const loginId = parseInt(userId);
      const coupons = couponsData?.data || [];
  const handleEdit = (coupon: Coupon) => {
    console.log(coupon)
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteCoupon(deleteConfirmId);
      queryClient.invalidateQueries({ queryKey: ['coupon',userId] });
    //   setCoupons(coupons.filter(c => c.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="container mx-auto p-6 mt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button 
          onClick={() => {
            setEditingCoupon(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Create Coupon
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Max Usage</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((coupon) => (
            <TableRow key={coupon.id}>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.type}</TableCell>
              <TableCell>
                {coupon.type === 'PERCENTAGE' 
                  ? `${coupon.value}%` 
                  : `Rs.${coupon.value.toFixed(2)}`}
              </TableCell>
              <TableCell>{coupon.maxUsage || '0'}</TableCell>
              <TableCell>
                {coupon.expiryDate 
                  ? format(new Date(coupon.expiryDate), 'PPP') 
                  : 'No Expiry'}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleEdit(coupon)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => setDeleteConfirmId(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the coupon. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CouponDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        initialData={editingCoupon ?? undefined} 
        loginId={loginId}
      />
    </div>
  );
}