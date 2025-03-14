'use client'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

import { insertIceCreams ,getCategories} from "@/app/lib/actions";
import { useUser } from "@/context/UserContext";
import Papa from 'papaparse';

type Category = {
  id: number;
  name: string;
};

type CategoryMap = {
  [key: string]: number;
};

type CSVRow = {
  name: string;
  category: string;
  cost: string;
};

export default function IceCreamUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { userId } = useUser();
  const [filteredRows, setFilteredRows] = useState<CSVRow[]| null>(null);
  const fetchCategories = async () => {
    const result = await getCategories();
    return {
      ...result,
      data: result.data.map((item: { id: number; name: string }) => ({ ...item }))
    };
  };

  const {
    data: categoriesResponse,
    isLoading: isLoadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 60 * 12,
    gcTime: 1000 * 60 * 60 * 24
  });

  const categories = categoriesResponse?.data || [];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilteredRows(null)
    const file = event.target.files?.[0];
    if (file && file.type !== "text/csv") {
      toast({
        title: "Error",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    setFile(file || null);
  };

  const handleUpload = async () => {
    if (!file || !userId) return;
    setIsProcessing(true);

    // Create category map for quick lookups
    const categoryMap: CategoryMap = {};
    categories.forEach((cat: Category) => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    try {
      const text = await file.text();
      Papa.parse<CSVRow>(text, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.trim(),
        complete: async (results) => {
          const { data, errors } = results;
          console.log('Parsed data:', data);

          if (errors.length > 0) {
            toast({
              title: "Error",
              description: "Invalid CSV format",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }

          // Transform and validate the data
          const validRows = data
            .filter(row => row.name && row.category && row.cost)
            .map(row => ({
              name: row.name.trim(),
              categoryId: categoryMap[row.category.toLowerCase()?.trim()],
              cost: parseFloat(row.cost),
              loginId: parseInt(userId),
            }))
            .filter(row => 
              row.name && 
              !isNaN(row.cost) && 
              row.categoryId && 
              row.loginId
            );

          console.log('Valid rows:', validRows);
          const filteredOutRows = data.filter(row => 
            !row.name || 
            !row.category || 
            !row.cost || 
            isNaN(parseFloat(row.cost)) || 
            !categoryMap[row.category.toLowerCase()?.trim()] || 
            isNaN(parseInt(userId))
          );
          
          console.log("Filtered-out rows:", filteredOutRows);
          setFilteredRows(filteredOutRows)

          if (validRows.length === 0) {
            toast({
              title: "Error",
              description: "No valid ice creams found in the CSV",
              variant: "destructive",
            });
            setIsProcessing(false);
            return;
          }

          try {
            const result = await insertIceCreams(validRows);
            
            if (result.success) {
              toast({
                title: "Success",
                description: `${validRows.length} ice cream(s) inserted successfully!`,
              });
              setFile(null);
              // Reset file input
              const fileInput = document.getElementById('csvFile') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            } else {
              toast({
                title: "Error",
                description: result.message,
                variant: "destructive",
              });
            }
          } catch {
            toast({
              title: "Error",
              description: "Failed to insert ice creams",
              variant: "destructive",
            });
          }
          setIsProcessing(false);
        },
        error: () => {
          toast({
            title: "Error",
            description: "Failed to parse CSV file",
            variant: "destructive",
          });
          setIsProcessing(false);
        }
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (isLoadingCategories) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="p-4 space-y-6">
   

      <div className="space-y- mt-20">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium mb-4">Upload Icecream CSV File</h3>
          <p className="text-sm text-gray-500 mb-4">
            File should have columns: name, category, cost
          </p>
          <div className="space-y-4">
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <Button 
              onClick={handleUpload} 
              disabled={!file || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Upload and Process'}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Example:</h4>
          <pre className="text-xs text-blue-800 bg-white p-2 rounded">
            name,category,cost{'\n'}
            Vanilla,IceCream,20{'\n'}
            Chocolate,IceCream,30
          </pre>
        </div>
        {filteredRows &&  <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-900 mb-2">Invalid Rows</h4>
          <pre className="text-xs text-red-800 bg-white p-2 rounded">
          {filteredRows.map((row, index) => (
    <div key={index}>
      {[row.name, row.category, row.cost].join(', ')}
    </div>
  ))}
          </pre>
        </div>}
      </div>
    </div>
  );
}



