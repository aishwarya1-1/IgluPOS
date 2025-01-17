'use client';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cancelBill, deleteKOTorder, getKOTData } from '@/app/lib/actions';
import { JsonValue } from '@prisma/client/runtime/library';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface KOTOrderData {
  id: number,
  kotName: string;
  cartItems: JsonValue;
  total: number;
  lastUpdatedDate: Date;
}

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'edit' | 'delete' | 'cancel';
}


interface BillCancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const BillCancelDialog = ({ isOpen, onClose }: BillCancelDialogProps) => {
  const { toast } = useToast()
  const [billNumber, setBillNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { userId } = useUser();
  const handleConfirmCancel = async () => {
    if (!billNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a bill number",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const result = await cancelBill(billNumber,userId);
      
      if (result.success) {
       
        toast({
          title: "Success",
          description: result.message,
        });
       
        onClose();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Bill Cancel Failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>Cancel Bill</DialogTitle>
          <DialogDescription>
            Please enter the bill number you want to cancel.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="billNumber">Bill Number</Label>
            <Input
              id="billNumber"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="Enter bill number"
              onKeyPress={(e) => e.key === 'Enter' && handleConfirmCancel()}
            />
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            onClick={handleConfirmCancel} 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Cancel"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const PasswordDialog = ({ isOpen, onClose, onConfirm, action }: PasswordDialogProps) => { 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (password === adminPassword) {
      setError('');
      setPassword('');
      onConfirm();
      onClose();
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] mx-auto">
        <DialogHeader>
          <DialogTitle>Enter Admin Password</DialogTitle>
          <DialogDescription>
            Please enter the admin password to {action} this {action === 'cancel' ? 'Bill' : 'KOT'}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ActionMenu = ({ 
  onAddItems, 
  onEditLast, 
  onViewCheckout, 
  onDelete 
}: { 
  onAddItems: () => void, 
  onEditLast: () => void, 
  onViewCheckout: () => void, 
  onDelete: () => void 
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onAddItems}>Add Items</DropdownMenuItem>
        <DropdownMenuItem onClick={onEditLast}>Edit Last KOT</DropdownMenuItem>
        <DropdownMenuItem onClick={onViewCheckout}>View/Checkout</DropdownMenuItem>
        <DropdownMenuItem className="text-red-600" onClick={onDelete}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const KOTTablePage = () => {
  const router = useRouter();
  const { userId } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [kotData, setKotData] = useState<KOTOrderData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showBillCancelDialog, setShowBillCancelDialog] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    action: 'edit' | 'delete' | 'cancel';
    kotId: number | null;
    cartItems?: JsonValue;
  }>({
    isOpen: false,
    action: 'edit',
    kotId: null
  });
  const handleCancelBill = () => {

    setPasswordDialog({
      isOpen: true,
      action: 'cancel',
      kotId: null
    });
  };
  const formatCartItems = (cartItemsString: JsonValue) => {
    if (typeof cartItemsString !== 'string') return 'Invalid data';
    try {
      const cartItems = JSON.parse(cartItemsString);
      return cartItems
        .map((itemList: { name: string; quantity: number }[]) => {
          const formattedItems = itemList
            .map((item) => `${item.name}-${item.quantity}`)
            .join(', ');
          return `(${formattedItems})`;
        })
        .join(' ');
    } catch (error) {
      console.error('Error parsing cart items:', error);
      return 'Invalid data';
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleAddItems = (kotid: number) => {
    router.push(`/billing?kotid=${kotid}&kotAction=append`);
  };

  const handleEditLastKOT = (kotid: number, cartItems: JsonValue) => {
    setPasswordDialog({
      isOpen: true,
      action: 'edit',
      kotId: kotid,
      cartItems,
    });
  };

  const handleViewCheckout = (kotid: number, cartItems: JsonValue) => {
    const encodedCartItems = encodeURIComponent(JSON.stringify(cartItems));
    router.push(`/billing?kotid=${kotid}&cartItems=${encodedCartItems}&kotAction=checkout`);
  };

  const handleDelete = (kotid: number) => {
    setPasswordDialog({
      isOpen: true,
      action: 'delete',
      kotId: kotid
    });
  };

  const handlePasswordConfirm = async () => {
    if (passwordDialog.action === 'cancel') {
      setPasswordDialog(prev => ({ ...prev, isOpen: false }));
      setShowBillCancelDialog(true);
      return;
    }
    if (!passwordDialog.kotId) return;

    if (passwordDialog.action === 'edit') {
      const encodedCartItems = encodeURIComponent(JSON.stringify(passwordDialog.cartItems));
      router.push(`/billing?kotid=${passwordDialog.kotId}&cartItems=${encodedCartItems}&kotAction=edit`);
    } else if (passwordDialog.action === 'delete') {
      try {
        await deleteKOTorder(passwordDialog.kotId,userId);
        const data = await getKOTData(userId);
        if (data.success) {
          setKotData(data.data);
        }
      } catch (err) {
        console.error('Error deleting KOT:', err);
        setError('Failed to delete KOT');
      }
    }
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getKOTData(userId);
        if (data.success) {
          setKotData(data.data);
        } else {
          setError('Failed to fetch KOT data');
        }
      } catch (err) {
        setError('An error occurred while fetching data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-gray-500">Loading KOT orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-500">Error: {error}</div>
      </div>
    );
  }

  const filteredData = kotData.filter(kot => 
    kot.kotName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showEmptyState = filteredData.length === 0;

  return (
    <div className="pt-20 sm:pt-24 px-2 sm:px-6 max-w-7xl mx-auto">
    <div className="mb-8 relative">
      <h2 className="text-2xl font-semibold mb-4">KOT Orders</h2>
      <div className="relative flex flex-row items-center justify-between gap-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by KOT name..."
          className="pl-8 w-full sm:max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleCancelBill}>Cancel Bill</Button>
      </div>
    </div>

      {showEmptyState ? (
        <div className="border rounded-lg p-6 sm:p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No KOT Orders Found
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "No orders match your search criteria. Try a different search term." 
                : "There are no KOT orders yet. Orders will appear here once created."}
            </p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">KOT Name</TableHead>
                <TableHead className="hidden sm:table-cell">Cart Items</TableHead>
                <TableHead className="whitespace-nowrap">Total</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((kot, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {kot.kotName}
                    <div className="sm:hidden text-sm text-gray-500 mt-1">
                      {formatDate(kot.lastUpdatedDate)}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatCartItems(kot.cartItems)}
                  </TableCell>
                  <TableCell>₹{kot.total}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {formatDate(kot.lastUpdatedDate)}
                  </TableCell>
                  <TableCell>
                    <div className="hidden sm:flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddItems(kot.id)}
                      >
                        Add Items
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLastKOT(kot.id, kot.cartItems)}
                      >
                        Edit Last KOT
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCheckout(kot.id, kot.cartItems)}
                      >
                        View/Checkout
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(kot.id)}
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="sm:hidden">
                      <ActionMenu
                        onAddItems={() => handleAddItems(kot.id)}
                        onEditLast={() => handleEditLastKOT(kot.id, kot.cartItems)}
                        onViewCheckout={() => handleViewCheckout(kot.id, kot.cartItems)}
                        onDelete={() => handleDelete(kot.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

<PasswordDialog
        isOpen={passwordDialog.isOpen}
        onClose={() => setPasswordDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handlePasswordConfirm}
        action={passwordDialog.action}
      />

      <BillCancelDialog
        isOpen={showBillCancelDialog}
        onClose={() => setShowBillCancelDialog(false)}
      />
    </div>
  );
};

export default KOTTablePage;