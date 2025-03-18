'use client';

import {  useState, useRef } from 'react';

import { createEmployee, getEmployees, EmployeeState, updateEmployee, resetEmployeePassword, deleteEmployee } from '@/app/lib/actions';
import { useUser } from '@/context/UserContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { EyeIcon, EyeOffIcon, PencilIcon, TrashIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useQuery, useQueryClient } from '@tanstack/react-query';


// Define the Employee type
type Employee = {
  id: number;
  name: string;
  phoneNumber: string;
  password: string;
};


const fetchEmployees = async (userId: string) => {

  const result = await getEmployees(parseInt(userId));
  console.log(result)
  // Ensure we return a plain object
  return {
    ...result,
    data: result.map(item => ({ ...item }))
  }
}

export default function EmployeesPage() {

  const { userId } = useUser();

  const [isDialogOpen, setIsDialogOpen] = useState(false);



  const { 
    data: employeemData,
    isLoading: isEmployeeLoading,

  } = useQuery({
    queryKey: ['employee',userId],
    queryFn: () => fetchEmployees(userId ?? ''),
    staleTime: 1000 * 60 * 60 * 12, // 12 hours
    gcTime: 1000 * 60 * 60 * 24
  })


const employees = employeemData?.data || []
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Add Employee
        </Button>
      </div>

      {isEmployeeLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No employees added yet
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-full divide-y divide-gray-200">
            {/* Desktop view */}
            <table className="min-w-full divide-y divide-gray-200 hidden md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <EmployeeRow key={employee.id} employee={employee} />
                ))}
              </tbody>
            </table>

            {/* Mobile view */}
            <div className="md:hidden">
              {employees.map((employee) => (
                <div key={employee.id} className="bg-white p-4 border-b border-gray-200">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Name</label>
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Phone Number</label>
                      <div className="text-sm text-gray-500">{employee.phoneNumber}</div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 uppercase">Password</label>
                      <MobilePasswordField password={employee.password} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isDialogOpen && (
        <AddEmployeeDialog 
          isOpen={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)}
          onSuccess={() => {
           
            setIsDialogOpen(false);
          }}
          loginId={userId}
        />
      )}
    </div>
  );
}

function EmployeeRow({ employee }: { employee: Employee }) {
  const { userId } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient()

  const handleDelete = async () => {
    const result = await deleteEmployee(employee.id);
    
    if (result.message === "Employee deleted successfully") {
      queryClient.invalidateQueries({ queryKey: ['employee',userId] });
      toast({
        title: "Success",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{employee.phoneNumber}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <span className="font-mono">
            {showPassword ? employee.password : '••••••••'}
          </span>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOffIcon className="h-4 w-4" />
            ) : (
              <EyeIcon className="h-4 w-4" />
            )}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetPasswordDialogOpen(true)}
            className="ml-2 text-xs"
          >
            Reset
          </Button>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </td>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
          </DialogHeader>
          <EditEmployeeForm 
            employee={employee} 
            onClose={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password for {employee.name}</DialogTitle>
          </DialogHeader>
          <ResetPasswordForm 
            employeeId={employee.id} 
            onClose={() => setIsResetPasswordDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>


      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              account and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </tr>
  );
}

function EditEmployeeForm({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const { userId } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient()
  async function handleSubmit(formData: FormData) {
    const result = await updateEmployee(employee.id, formData);
    
    if (result.message === "Employee updated successfully") {
      queryClient.invalidateQueries({ queryKey: ['employee',userId] });
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
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          defaultValue={employee.name}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          name="phoneNumber"
          defaultValue={employee.phoneNumber}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <div className="space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}

function ResetPasswordForm({ employeeId, onClose }: { employeeId: number; onClose: () => void }) {
  const { userId } = useUser();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient()
  async function handleSubmit(formData: FormData) {
    const result = await resetEmployeePassword(employeeId, formData);
    
    if (result.message === "Password reset successfully") {
      queryClient.invalidateQueries({ queryKey: ['employee',userId] });
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
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOffIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          Reset Password
        </Button>
      </div>
    </form>
  );
}

function MobilePasswordField({ password }: { password: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 font-mono">
        {showPassword ? password : '••••••••'}
      </span>
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-gray-400 hover:text-gray-600"
      >
        {showPassword ? (
          <EyeOffIcon className="h-4 w-4" />
        ) : (
          <EyeIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

function AddEmployeeDialog({ 
  isOpen, 
  onClose, 
  onSuccess,
  loginId
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSuccess: () => void;
  loginId?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<EmployeeState>({ message: "", errors: {} });
  const queryClient = useQueryClient()
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    const response = await createEmployee(state, formData);
    setState(response); 
    if (response.message === "Employee created successfully") {
      queryClient.invalidateQueries({ queryKey: ['employee',loginId] });
      formRef.current?.reset();
      onSuccess();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          formRef.current?.reset();
          onClose();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <input type="hidden" name="loginId" value={loginId} />
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Employee Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Set Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10"
                 aria-describedby="pass-error"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>
              <div id="pass-error" aria-live="polite" aria-atomic="true">
                {state.errors?.password && state.errors.password.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              aria-describedby="ph-error"
              />
              <div id="ph-error" aria-live="polite" aria-atomic="true">
                {state.errors?.phoneNumber && state.errors.phoneNumber.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
              </div>
          
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              Add Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
