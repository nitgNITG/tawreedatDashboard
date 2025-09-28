import { useState, useEffect } from "react";
import axios from "axios";
import { useAppContext } from "@/context/appContext";

export interface Brand {
  id: number;
  name: string;
  logo: string;
  validFrom: string | Date;
  validTo: string | Date;
}

export default function useBrandFetch(brandId: number, initialBrand?: Brand) {
  const { token } = useAppContext();
  const [brand, setBrand] = useState<Brand | undefined>(initialBrand);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBrand = async () => {
    try {
      setLoading(true);
      console.log(`Fetching brand with ID: ${brandId}`);
      const { data } = await axios.get(
        `/api/brand/${brandId}?fields=id,name,logo,validTo,validFrom`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBrand(data.brand);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to fetch brand", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialBrand) {
      fetchBrand();
    }
  }, [brandId]);

  return { brand, loading, error, refresh: fetchBrand };
}
