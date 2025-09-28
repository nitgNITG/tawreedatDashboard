import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import { ChevronDown, Loader } from "lucide-react";
import { useTranslations } from "next-intl";

export type Brand = {
  id: number;
  name: string;
  logo?: string;
};

type BrandSelectProps = {
  onSelect: (brand: Brand) => void;
  defaultValue?: Brand | null;
};

const BrandSelect: React.FC<BrandSelectProps> = ({
  onSelect,
  defaultValue = null,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const t = useTranslations("user");

  const fetchBrands = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/brand", {
        params: {
          sort: "-purchaseCount",
          limit: 10,
          keyword: searchTerm,
          page,
        },
      });

      setBrands((prevBrands) => [...prevBrands, ...response.data.brands]);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, page]);

  useEffect(() => {
    if (defaultValue) {
      setSelectedBrand(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    if (isDropdownOpen) {
      fetchBrands();
    }
  }, [fetchBrands, isDropdownOpen]);

  const handleSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    onSelect(brand);
    setIsDropdownOpen(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLUListElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 10 &&
      !isLoading &&
      page < totalPages
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <div className="grid items-center grid-cols-[1fr_2.5fr] w-full h-min relative">
      <label className="text-nowrap" htmlFor="brand">
        {t("brand")}:
      </label>
      <div className="relative">
        <input
          id="brand"
          type="text"
          placeholder={t("searchBrands")}
          value={selectedBrand ? selectedBrand.name : searchTerm}
          onFocus={() => {
            setIsDropdownOpen(true);
            setPage(1);
            setBrands([]);
          }}
          onBlur={() => {
            setTimeout(() => setIsDropdownOpen(false), 200);
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
            setBrands([]);
          }}
          className={clsx(
            "border-2 border-[#DADADA] p-2 rounded-xl w-full bg-transparent shadow-[0px_0px_5px_-1px_#00000040] outline-none",
            "hover:border-primary focus:border-primary transition-colors duration-200 ease-in-out"
          )}
        />
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown className="text-primary size-5" />
        </span>

        {isDropdownOpen && (
          <ul
            className="absolute z-10 mt-2 border-2 border-[#DADADA] rounded-xl bg-white max-h-60 overflow-y-auto shadow-lg w-full"
            onScroll={handleScroll}
          >
            {brands.map((brand) => (
              <li
                key={brand.id}
                onMouseDown={() => handleSelect(brand)}
                onClick={() => handleSelect(brand)}
                className={clsx(
                  "cursor-pointer p-2 hover:bg-gray-100",
                  selectedBrand?.id === brand.id && "bg-gray-100"
                )}
              >
                {brand.name}
              </li>
            ))}
            {isLoading && (
              <li className="p-2 text-center text-gray-500">
                <Loader className="animate-spin inline-block mr-2" />
                Loading...
              </li>
            )}
            {!isLoading && brands.length === 0 && (
              <li className="p-2 text-center text-gray-500">No brands found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default BrandSelect;
