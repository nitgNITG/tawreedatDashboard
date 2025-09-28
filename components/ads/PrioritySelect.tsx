"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import axios from "axios";
import { useAppContext } from "@/context/appContext";
import { CircleAlert } from "lucide-react";
import CustomSelect from "../users/CustomSelect";
import { Ad } from "@/redux/reducers/adsReducer";
import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";

interface PrioritySelectProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  currentAd?: Ad;
}

const PrioritySelect = ({
  register,
  errors,
  currentAd,
}: PrioritySelectProps) => {
  const t = useTranslations("ads");
  const { token } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [availablePriorities, setAvailablePriorities] = useState<
    Array<{ value: number; label: number; disabled?: boolean }>
  >([]);

  useEffect(() => {
    const fetchPriorities = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get("/api/ads", {
          params: {
            fields: "priority,id,startDate,endDate",
            status: "Active",
            "startDate[lte]": new Date().toISOString(),
            "endDate[gte]": new Date().toISOString(),
            limit: 0,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("data.ads", data.ads);

        // Get used priorities excluding current ad
        const usedPriorities = data.ads
          .filter((ad: Ad) => ad?.id !== currentAd?.id)
          .map((ad: Ad) => ad.priority);
          console.log("usedPriorities", usedPriorities);
          console.log("totalCount", data.totalCount);

          

        // Create options array with disabled state
        const options = Array.from(
          { length: data.totalCount + 1 },
          (_, index) => ({
            value: index + 1,
            label: index + 1,
            disabled: usedPriorities.includes(index + 1),
          })
        );

        setAvailablePriorities(options);
      } catch (error) {
        console.error("Error fetching priorities:", error);
        setAvailablePriorities(
          Array.from({ length: 10 }, (_, index) => ({
            value: index + 1,
            label: index + 1,
            disabled: false,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPriorities();
  }, [token, currentAd]);

  if (isLoading) {
    return (
      <div className="relative">
        <span className="rtl:-right-7 ltr:-left-7 top-1/2 -translate-y-1/2 absolute">
          <CircleAlert className="text-white bg-primary rounded-full size-5" />
        </span>
        <div className="animate-pulse">
          <CustomSelect
            placeholder={t("selectPriority")}
            errors={errors}
            fieldForm="priority"
            label={t("priority")}
            register={register}
            defaultValue={currentAd?.priority}
            roles={{
              value: currentAd?.priority,
              required: t("priorityRequired"),
            }}
            options={[]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <span className="rtl:-right-7 ltr:-left-7 top-1/2 -translate-y-1/2 absolute">
        <CircleAlert className="text-white bg-primary rounded-full size-5" />
      </span>
      <CustomSelect
        placeholder={t("selectPriority")}
        errors={errors}
        fieldForm="priority"
        label={t("priority")}
        register={register}
        roles={{
          value: currentAd?.priority,
          required: t("priorityRequired"),
        }}
        defaultValue={currentAd?.priority}
        options={availablePriorities}
      />
    </div>
  );
};

export default PrioritySelect;
