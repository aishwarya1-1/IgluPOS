'use client';
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteKOTorder, getKOTData } from '@/app/lib/actions';
import { JsonValue } from '@prisma/client/runtime/library';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';

interface KOTOrderData {
  id: number,
  kotNumber: number,
  kotName: string;
  cartItems: JsonValue;
  total: number;
  lastUpdatedDate: Date;
}

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'edit' | 'delete';
}

const PasswordDialog = ({ isOpen, onClose, onConfirm, action }: PasswordDialogProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Get admin password from environment variable
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Admin Password</DialogTitle>
          <DialogDescription>
            Please enter the admin password to {action === 'edit' ? 'edit' : 'delete'} this KOT.
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
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const KOTTablePage = () => {
  const router = useRouter();
  const { userId } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [kotData, setKotData] = useState<KOTOrderData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordDialog, setPasswordDialog] = useState<{
    isOpen: boolean;
    action: 'edit' | 'delete';
    kotId: number | null;
    cartItems?: JsonValue;
    kotnum?: number
  }>({
    isOpen: false,
    action: 'edit',
    kotId: null
  });

  const formatCartItems = (cartItemsString: JsonValue) => {
    if (typeof cartItemsString !== 'string') {
      return 'Invalid data';
    }
  
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

  const handleAddItems = (kotid: number,kotnum :number) => {
    const kotAction = 'append';
    router.push(`/billing?kotid=${kotid}&kotAction=${kotAction}&kotnum=${kotnum}`);
  };

  const handleEditLastKOT = (kotid: number, cartItems: JsonValue,kotnum :number) => {
    setPasswordDialog({
      isOpen: true,
      action: 'edit',
      kotId: kotid,
      cartItems,
      kotnum
    });
  };

  const handleViewCheckout = (kotid: number, cartItems: JsonValue) => {
    const encodedCartItems = encodeURIComponent(JSON.stringify(cartItems));
    const kotAction = 'checkout';
    router.push(`/billing?kotid=${kotid}&cartItems=${encodedCartItems}&kotAction=${kotAction}`);
  };

  const handleDelete = (kotid: number) => {
    setPasswordDialog({
      isOpen: true,
      action: 'delete',
      kotId: kotid
    });
  };

  const handlePasswordConfirm = async () => {
    if (!passwordDialog.kotId) return;

    if (passwordDialog.action === 'edit') {
      const encodedCartItems = encodeURIComponent(JSON.stringify(passwordDialog.cartItems));
      router.push(`/billing?kotid=${passwordDialog.kotId}&cartItems=${encodedCartItems}&kotAction=edit&kotnum=${passwordDialog.kotnum}`);
    } else if (passwordDialog.action === 'delete') {
      try {
        await deleteKOTorder(passwordDialog.kotId);
        // Refresh the data after deletion
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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by KOT name..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showEmptyState ? (
        <div className="border rounded-lg p-12">
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
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KOT Name</TableHead>
                <TableHead>Cart Items</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((kot, index) => (
                <TableRow key={index}>
                  <TableCell>{kot.kotName}</TableCell>
                  <TableCell>{formatCartItems(kot.cartItems)}</TableCell>
                  <TableCell>₹{kot.total}</TableCell>
                  <TableCell>{formatDate(kot.lastUpdatedDate)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddItems(kot.id,kot.kotNumber)}
                      >
                        Add Items
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLastKOT(kot.id, kot.cartItems,kot.kotNumber)}
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
    </div>
  );
};

export default KOTTablePage;