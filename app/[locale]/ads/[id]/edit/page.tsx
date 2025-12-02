"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/redux";
import { Ad, setSelectedAd } from "@/redux/reducers/adsReducer"; // Make sure you have setSelectedAd action
import AddAds from "@/components/ads/AddAds";
import LoadingTable from "@/components/ui/LoadingTable";

const EditAdPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const adId = Number(params.id); // Get the ID from the URL

  // 1. Try to find the ad in the currently loaded Redux store
  const storedAd = useAppSelector((state) =>
    state.ads.ads.find((a) => a.id === adId)
  );

  const [adData, setAdData] = useState<Ad | undefined>(storedAd);
  const [isLoading, setIsLoading] = useState(!storedAd);

  useEffect(() => {
    // 2. If the ad wasn't in the store, fetch it from the API
    if (!storedAd) {
      const fetchAd = async () => {
        setIsLoading(true);
        try {
          // Replace with your actual fetch logic
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/ads/${adId}`
          );
          if (!response.ok) throw new Error("Failed to fetch ad");
          const data: { ad: Ad } = await response.json();
          setAdData(data.ad);
          dispatch(setSelectedAd(data.ad)); // Optionally store it in Redux once fetched
        } catch (error) {
          console.error(error);
          // Handle error, maybe redirect back to list
          router.push("/dashboard/ads");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAd();
    }
  }, [adId, storedAd, dispatch, router]);

  if (isLoading) {
    return (
      <div className="p-container space-y-10 pb-5">
        <LoadingTable />
      </div>
    );
  }

  if (!adData) {
    return <div>Ad not found.</div>;
  }

  // 3. Pass the (either stored or fetched) ad data to the AddAds form
  return (
    <div className="p-container space-y-10 pb-5">
      <AddAds ad={adData} handleClose={() => router.push("/ads")} />
    </div>
  );
};

export default EditAdPage;
